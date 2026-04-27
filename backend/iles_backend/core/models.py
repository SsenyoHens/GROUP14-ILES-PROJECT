from tabnanny import check

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)

        if 'username' not in extra_fields or not extra_fields['username']:
            extra_fields['username'] = email

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(email, password, **extra_fields)

# 1. Custom User Model
class CustomUser(AbstractUser):
    objects = CustomUserManager()
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('admin', 'Admin'),
    )
    
    username = models.CharField(max_length=150, unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='student')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    
    def save(self, *args, **kwargs):
        if not self.username:
          self.username = self.email   # auto-fill username
        super().save(*args, **kwargs)
        
    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()

        if full_name:
            return f"{full_name} ({self.role.title()})"

        return f"{self.email} ({self.role.title()})"    


# 2. Student Profile
class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    registration_number = models.CharField(max_length=20, unique=True)
    course = models.CharField(max_length=100)
    year_of_study = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    phone_number = models.CharField(max_length=25, blank=True, null=True)

    def __str__(self):
        return self.user.email


# 3. Academic Supervisor Profile
class AcademicSupervisorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    department = models.CharField(max_length=100)
    office_number = models.CharField(max_length=20)

    def __str__(self):
        return self.user.email


# 4. Workplace Supervisor Profile
class WorkplaceSupervisorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=25)

    def __str__(self):
        return self.user.email


# 5. Internship Placement
class InternshipPlacement(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE)

    academic_supervisor = models.ForeignKey(
        AcademicSupervisorProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_supervised_students'
    )

    workplace_supervisor = models.ForeignKey(
        WorkplaceSupervisorProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workplace_supervised_students'
    )

    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()

    def clean(self):
        if self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date")

        overlapping = InternshipPlacement.objects.filter(
            student=self.student
        ).filter(
            Q(start_date__lt=self.end_date) &
            Q(end_date__gt=self.start_date)
        )

        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError("This placement overlaps with an existing one")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.email} at {self.company_name}"
        return f"{self.student.first_name} {self.student.last_name} - {self.company_name}"


# 6. Weekly Log
class WeeklyLog(models.Model):
    

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'}
    )
    
    date = models.DateField(auto_now_add=True)

    week_number = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(52)]
    )

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    content = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )

    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'week_number')
        constraints = [
            models.CheckConstraint(
                check=Q(week_number__gte=1) & Q(week_number__lte=52),
                name="week_number_valid_range"
            )
        ]

    def clean(self):
        old = None
        if self.pk:
            old = WeeklyLog.objects.filter(pk=self.pk).first()

        if old:
            if old.status == "approved":
                raise ValidationError("Approved logs cannot be edited")

            if old.status == "submitted" and self.status == "draft":
                raise ValidationError("Cannot revert submitted log to draft")

        if self.status == "submitted":
            deadline = self.created_at + timedelta(days=7)
            if timezone.now() > deadline:
                raise ValidationError("Submission deadline passed")

    def save(self, *args, **kwargs):
        if self.status == "submitted" and not self.submitted_at:
            self.submitted_at = timezone.now()

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - Week {self.week_number}"


# 7. Evaluation Criteria
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=255, unique=True)
    max_score = models.IntegerField(default=10)
    description = models.TextField()

    def __str__(self):
        return self.name


# 8. Evaluation
class Evaluation(models.Model):
    weekly_log = models.ForeignKey(WeeklyLog, on_delete=models.CASCADE, null=True, blank=True)
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'}
    )

    evaluator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='evaluations_given',
        limit_choices_to={
            'role__in': ['academic_supervisor', 'workplace_supervisor']
        }
    )

    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    criteria = models.ManyToManyField(
        EvaluationCriteria,
        through='EvaluationScore'
    )

    class Meta:
        unique_together = ('student', 'evaluator')
        
    def __str__(self):
        return f"Evaluation for {self.student.first_name} {self.student.last_name}"


# 9. Evaluation Score (Through Table)
class EvaluationScore(models.Model):
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE)

    score = models.FloatField(
        validators=[MinValueValidator(0)]
    )

    def clean(self):
        if self.score > self.criteria.max_score:
            raise ValidationError(
                f"Score must not exceed {self.criteria.max_score}"
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.criteria.name}: {self.score}"


# 10. Signals - Auto Create Profiles
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'student':
            StudentProfile.objects.get_or_create(user=instance)
        elif instance.role == 'academic_supervisor':
            AcademicSupervisorProfile.objects.get_or_create(user=instance)
        elif instance.role == 'workplace_supervisor':
            WorkplaceSupervisorProfile.objects.get_or_create(user=instance)
