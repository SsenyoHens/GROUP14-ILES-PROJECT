from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from django.dispatch import receiver
from django.db.models.signals import post_save


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    objects = CustomUserManager()

    ROLE_CHOICES = (
        ('student',              'Student'),
        ('academic_supervisor',  'Academic Supervisor'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('admin',                'Admin'),
    )

    email      = models.EmailField(unique=True)
    username   = models.CharField(max_length=150, unique=True)
    role       = models.CharField(max_length=30, choices=ROLE_CHOICES, default='student')
    phone      = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"


class StudentProfile(models.Model):
    user                = models.OneToOneField(
                            settings.AUTH_USER_MODEL,
                            on_delete=models.CASCADE
                          )
    registration_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    course              = models.CharField(max_length=100, blank=True)
    year_of_study       = models.IntegerField(
                            validators=[MinValueValidator(1), MaxValueValidator(5)],
                            null=True, blank=True
                          )
    phone_number        = models.CharField(max_length=25, blank=True, null=True)

    def __str__(self):
        return self.user.email


class AcademicSupervisorProfile(models.Model):
    user          = models.OneToOneField(
                      settings.AUTH_USER_MODEL,
                      on_delete=models.CASCADE
                    )
    department    = models.CharField(max_length=100, blank=True)
    office_number = models.CharField(max_length=20, blank=True)
    staff_id      = models.CharField(max_length=50, blank=True, null=True)
    phone_number  = models.CharField(max_length=25, blank=True, null=True)

    def __str__(self):
        return self.user.email


class WorkplaceSupervisorProfile(models.Model):
    user         = models.OneToOneField(
                     settings.AUTH_USER_MODEL,
                     on_delete=models.CASCADE
                   )
    company_name = models.CharField(max_length=255, blank=True)
    position     = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=25, blank=True, null=True)

    def __str__(self):
        return self.user.email


class InternshipPlacement(models.Model):

    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('active',    'Active'),
        ('completed', 'Completed'),
        ('rejected',  'Rejected'),
    ]

    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
    )

    academic_supervisor = models.ForeignKey(
        AcademicSupervisorProfile,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='academic_students',
    )

    workplace_supervisor = models.ForeignKey(
        WorkplaceSupervisorProfile,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='workplace_students',
    )

    company_name = models.CharField(max_length=255)
    position     = models.CharField(max_length=255)
    start_date   = models.DateField(null=True, blank=True)
    end_date     = models.DateField(null=True, blank=True)
    status       = models.CharField(
                     max_length=20, choices=STATUS_CHOICES, default='pending'
                   )
    created_at   = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date.")

    def __str__(self):
        return f"{self.student.user.email} — {self.company_name}"


class WeeklyLog(models.Model):

    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('submitted', 'Submitted'),
        ('approved',  'Approved'),
        ('rejected',  'Rejected'),
    ]

    student         = models.ForeignKey(
                        settings.AUTH_USER_MODEL,
                        on_delete=models.CASCADE
                      )
    week_number     = models.IntegerField()
    activities_done = models.TextField()
    challenges      = models.TextField(blank=True)
    skills_gained   = models.TextField(blank=True)
    strengths       = models.TextField(blank=True)
    plan_for_action = models.TextField(blank=True)
    status          = models.CharField(
                        max_length=20, choices=STATUS_CHOICES, default='draft'
                      )
    submitted_at    = models.DateTimeField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    date            = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'week_number')
        constraints = [
            models.CheckConstraint(
                condition=Q(week_number__gte=1) & Q(week_number__lte=52),
                name='week_number_valid_range',
            )
        ]

    def clean(self):
        allowed_transitions = {
            'draft':     ['submitted'],
            'submitted': ['approved', 'rejected'],
            'approved':  [],
            'rejected':  ['draft'],
        }
        if self.pk:
            old = WeeklyLog.objects.filter(pk=self.pk).first()
            if old and self.status != old.status:
                if self.status not in allowed_transitions.get(old.status, []):
                    raise ValidationError(
                        f"Invalid status transition from '{old.status}' to '{self.status}'."
                    )

    def save(self, *args, **kwargs):
        if self.status == 'submitted' and not self.submitted_at:
            self.submitted_at = timezone.now()

        old_status = None
        if self.pk:
            old = WeeklyLog.objects.filter(pk=self.pk).first()
            if old:
                old_status = old.status

        super().save(*args, **kwargs)

        if old_status and old_status != self.status:
            WeeklyLogHistory.objects.create(
                log        = self,
                old_status = old_status,
                new_status = self.status,
            )

    def __str__(self):
        return f"Week {self.week_number} — {self.student.email}"


class WeeklyLogHistory(models.Model):
    log        = models.ForeignKey(
                   'WeeklyLog', on_delete=models.CASCADE, related_name='history'
                 )
    changed_by = models.ForeignKey(
                   CustomUser, on_delete=models.SET_NULL, null=True, blank=True
                 )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log {self.log_id}: {self.old_status} → {self.new_status} at {self.changed_at}"


class EvaluationCriteria(models.Model):
    name        = models.CharField(max_length=255, unique=True)
    max_score   = models.IntegerField(default=10)
    description = models.TextField()

    def clean(self):
        if self.max_score <= 0:
            raise ValidationError("Max score must be greater than 0.")

    def __str__(self):
        return self.name


class Evaluation(models.Model):

    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('submitted', 'Submitted'),
        ('approved',  'Approved'),
    ]

    # ✅ weekly_log is now optional — not required to create an evaluation
    weekly_log = models.ForeignKey(
        'WeeklyLog',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evaluations',
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'},
        related_name='evaluations_received',
    )

    evaluator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evaluations_given',
        # ✅ admin included so admin can also create evaluations
        limit_choices_to={
            'role__in': ['academic_supervisor', 'workplace_supervisor', 'admin']
        },
    )

    feedback    = models.TextField(blank=True, default='')
    total_score = models.FloatField(null=True, blank=True)
    grade       = models.CharField(max_length=2, null=True, blank=True)
    status      = models.CharField(
                    max_length=20, choices=STATUS_CHOICES, default='draft'
                  )
    criteria    = models.ManyToManyField(
                    'EvaluationCriteria',
                    through='EvaluationScore',
                    blank=True,
                  )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    # ✅ No unique_together — allows multiple evaluations per student
    # ✅ No full_clean() in save() — was causing 500s on every create

    def clean(self):
        # Only validate student matches log if both provided
        if self.weekly_log_id and self.student_id:
            if self.weekly_log.student_id != self.student_id:
                raise ValidationError(
                    {'student': 'Student must match the weekly log student.'}
                )

    def calculate_total_score(self):
        scores = self.evaluationscore_set.all()
        if not scores.exists():
            return self.total_score
        return sum(s.score for s in scores)

    def compute_grade(self, total):
        if total is None:
            return None
        if total >= 80: return 'A'
        if total >= 70: return 'B'
        if total >= 60: return 'C'
        if total >= 50: return 'D'
        return 'F'

    def submit(self):
        if self.status != 'draft':
            raise ValidationError("Only draft evaluations can be submitted.")
        self.status = 'submitted'
        self.save()

    def approve(self):
        if self.status != 'submitted':
            raise ValidationError("Only submitted evaluations can be approved.")
        self.status = 'approved'
        self.save()

    def save(self, *args, **kwargs):
        # ✅ No full_clean() call — removed to prevent 500 errors
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Evaluation #{self.id} — {self.student.email}"


class EvaluationScore(models.Model):
    evaluation = models.ForeignKey('Evaluation', on_delete=models.CASCADE)
    criteria   = models.ForeignKey('EvaluationCriteria', on_delete=models.CASCADE)
    score      = models.FloatField()

    class Meta:
        unique_together = ['evaluation', 'criteria']

    def clean(self):
        errors = {}
        if self.score < 0:
            errors['score'] = "Score cannot be negative."
        if self.criteria_id and self.score > self.criteria.max_score:
            errors['score'] = f"Score exceeds maximum allowed ({self.criteria.max_score})."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.criteria.name}: {self.score}"


# ── Signals ───────────────────────────────────────────────────────────────────

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Auto-create role profile when a new user is registered.
    Signal is a safety net — RegisterSerializer creates profiles with full data.
    """
    if not created:
        return
    if instance.role == 'student':
        StudentProfile.objects.get_or_create(user=instance)
    elif instance.role == 'academic_supervisor':
        AcademicSupervisorProfile.objects.get_or_create(user=instance)
    elif instance.role == 'workplace_supervisor':
        WorkplaceSupervisorProfile.objects.get_or_create(user=instance)