from xml.parsers.expat import errors

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.dispatch import receiver
from django.db.models.signals import post_save


# =========================
# 1. Custom User Manager
# =========================
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


# =========================
# 2. Custom User
# =========================
class CustomUser(AbstractUser):
    objects = CustomUserManager()

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('admin', 'Admin'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"

# =========================
# 3. Profiles
# =========================
class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    registration_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
    )
    
    course = models.CharField(max_length=100)
    year_of_study = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    phone_number = models.CharField(max_length=25, blank=True, null=True)

    def __str__(self):
        return self.user.email


class AcademicSupervisorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    department = models.CharField(max_length=100)
    office_number = models.CharField(max_length=20)

    def __str__(self):
        return self.user.email


class WorkplaceSupervisorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=25)

    def __str__(self):
        return self.user.email


# =========================
# 4. Internship Placement
# =========================
class InternshipPlacement(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE,
    limit_choices_to={'role': 'student'})

    academic_supervisor = models.ForeignKey(
        AcademicSupervisorProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_students'
    )

    workplace_supervisor = models.ForeignKey(
        WorkplaceSupervisorProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workplace_students'
    )

    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()

    def clean(self):
        if self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date")

    def __str__(self):
        return f"{self.student.user.email} - {self.company_name}"


# =========================
# 5. Weekly Log
# =========================
class WeeklyLog(models.Model):

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    week_number = models.IntegerField()

    activities_done = models.TextField()

    challenges = models.TextField(
        blank=True
    )

    skills_gained = models.TextField(
        blank=True
    )

    strengths = models.TextField(
        blank=True
    )

    plan_for_action = models.TextField(
        blank=True
    )

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

         
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'week_number')
        constraints = [
            models.CheckConstraint(
                check=Q(week_number__gte=1) & Q(week_number__lte=52),
                name="week_number_valid_range"
            )
        ]
    
    #Rule 1 Lock afetr approval: A student cannot edit log after it has been approved
    def clean(self):
        allowed_transitions = {
        "draft": ["submitted"],
        "submitted": ["reviewed"],
        "reviewed": ["approved", "rejected"],
        "approved": [],
        "rejected": ["draft"],  # optional (allow resubmission)
}
        
        user = getattr(self, '_current_user', None)
        
        #if user.is_superuser:
            #return  # Superusers can bypass all validations

        if not user:
            raise ValidationError("Current user must be provided for validation.")
        if user.role != "student":
            raise ValidationError("Only students can create or edit logs.") 

        if self.pk:
            old=WeeklyLog.objects.filter(pk=self.pk).first()

            if old:
                if self.status != old.status:
                    if self.status not in allowed_transitions.get(old.status, []):
                        raise ValidationError(f"Invalid status transition from {old.status} to {self.status}.") 

                #Lock approved logs
                if old.status == "approved" and self.status != "approved":
                    raise ValidationError("Approved logs cannot be edited.")
            
                # Prevent revert
                if old.status == "submitted" and self.status == "draft":
                    raise ValidationError("Submitted logs cannot be reverted to draft.")
                
                #ROLE BASED RESTRICTION: 
                #STUDENT RESTRICTION: Only the student who created the log can edit it, and only if it's not approved
                if user.role == "student":
                    if self.student != user:
                        raise ValidationError("Students can only edit their own logs.") 
                    if self.status in ["approved", "reviewed", "rejected"]:
                        raise ValidationError("Students cannot review or approve logs.")
                    
                    
                #SUPERVISOR RESTRICTION: Supervisors can only review logs that are in "submitted" status and cannot edit the content
                elif user.role in ["academic_supervisor", "workplace_supervisor"]:
                    if self.student==user:
                        raise ValidationError("Supervisors cannot edit their own logs.")
                    
                    #Accessing student's placement
                    placement = getattr(self.student, 'internshipplacement', None)
                    
                    if not placement:
                        raise ValidationError("Student must have an internship placement to submit logs.")  
        
                    #Checking supervisor Ownership
                    if user not in [placement.academic_supervisor, placement.workplace_supervisor] and user.role in ["academic_supervisor", "workplace_supervisor"]:
                        raise ValidationError("Your are not assigned to this student!")
                    
                    if old.status =='draft':
                        raise ValidationError("Supervisors cannot edit draft logs.")
                    
                    if self.status == "submitted":
                        raise ValidationError("Supervisors cannot submit logs.")
                        #if placement is linked
                        #if self.student.internshipplacement.academic_supervisor != user and self.student.internshipplacement.workplace_supervisor != user:
                            #raise ValidationError("Supervisors can only review logs of their assigned students.")  
                else:
                    raise ValidationError("Only students and supervisors can edit logs/Unauhorized role.")           
                        
        if self.score < 0 or self.score > self.criteria.max_score:
            raise ValidationError("Score must be within allowed range")
            
        #Rule 2: Deadline for submission: A student cannot submit a log for a week that has already passed
        if self.status == "submitted":
            base_time = self.submitted_at or timezone.now()
            
            deadline = base_time + timedelta(days=7)
            if timezone.now() > deadline:
                raise ValidationError("Submission Deadline Passed!")
        
        
            
    def save(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        user = kwargs.pop('user', None) #Store current user
        self._curent_user = user #attach user to model 
        
        #auto set submited time
        if self.status == "submitted" and not self.submitted_at:
            self.submitted_at = timezone.now()

        #Capture old data
        old_status = None
        if self.pk:
            old = WeeklyLog.objects.filter(pk=self.pk).first()
            if old:
                old_status = old.status

        self.full_clean()
        super().save(*args, **kwargs)

        #Creating history record after saving
        if old_status and old_status !=self.status:
            WeeklyLogHistory.objects.create(
                log=self,
                changed_by=user,
                old_status=old_status,
                new_status=self.status
            )   

#EvaluationScore model
class EvaluationScore(models.Model):
    evaluation = models.ForeignKey('Evaluation', on_delete=models.CASCADE)
    criteria = models.ForeignKey('EvaluationCriteria', on_delete=models.CASCADE)

    score = models.FloatField()

    class Meta:
        unique_together = ['evaluation', 'criteria']

    def __str__(self):
        return f"{self.criteria.name}: {self.score}"

    # -------------------------
    # 🔒 VALIDATION
    # -------------------------
    def clean(self):
        errors = {}

        # Ensure weekly_log exists BEFORE accessing it
        if not self.weekly_log:
            errors['weekly_log'] = "Weekly log is required."

        # Only compare if both exist
        if self.weekly_log and self.student:
            if self.student != self.weekly_log.student:
                errors['student'] = "Student must match the weekly log."

        # Prevent editing after submission
        if self.pk:
            old = Evaluation.objects.get(pk=self.pk)
            if old.status != 'draft':
                errors['status'] = "Cannot modify submitted or approved evaluation."

    if errors:
        raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)



#Weekly Log History
class WeeklyLogHistory(models.Model):
    log = models.ForeignKey('WeeklyLog', on_delete=models.CASCADE, related_name='history')
    changed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.log.id}:{self.old_status} -> {self.new_status} at {self.changed_at}" 

#4. Evaluation Criteria model
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=255, unique=True)
    max_score = models.IntegerField(default=10)
    description = models.TextField()

    def __str__(self):
        return self.name
    
    def clean(self):
        if self.max_score <= 0:
            raise ValidationError("Max score must be greater than 0.")

#Evaluation model
class Evaluation(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
    ]

    weekly_log = models.ForeignKey(
        'WeeklyLog',
        on_delete=models.CASCADE
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
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

    feedback = models.TextField(blank=True)

    total_score = models.FloatField(null=True, blank=True)
    grade = models.CharField(max_length=2, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    criteria = models.ManyToManyField(
        'EvaluationCriteria',
        through='EvaluationScore'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['weekly_log', 'evaluator']

    def __str__(self):
        return f"Evaluation - {self.student.email}"

    # -------------------------
    # CORE VALIDATION LOGIC
    # -------------------------
    def clean(self):
        errors = {}

        # 1. Must have evaluator
        if not self.evaluator:
            errors['evaluator'] = "Evaluator is required."

        # 2. Student must match weekly log
        if self.weekly_log and self.student != self.weekly_log.student:
            errors['student'] = "Student must match the weekly log."

        # 3. Prevent editing after submission
        if self.pk:
            old = Evaluation.objects.get(pk=self.pk)
            if old.status != 'draft':
                errors['status'] = "Cannot modify submitted or approved evaluation."

        if errors:
            raise ValidationError(errors)

    # -------------------------
    # SCORE LOGIC
    # -------------------------
    def calculate_total_score(self):
        scores = self.evaluationscore_set.all()
        return sum(score.score for score in scores)

    def compute_grade(self, total):
        if total >= 80:
            return 'A'
        elif total >= 70:
            return 'B'
        elif total >= 60:
            return 'C'
        elif total >= 50:
            return 'D'
        return 'F'

    # -------------------------
    # SAVE OVERRIDE
    # -------------------------
    def save(self, *args, **kwargs):
        self.full_clean()  # 🔥 Always enforce validation
        super().save(*args, **kwargs)

    # -------------------------
    # WORKFLOW METHODS
    # -------------------------
    def submit(self):
        if self.status != 'draft':
            raise ValidationError("Only draft evaluations can be submitted.")

        self.total_score = self.calculate_total_score()
        self.grade = self.compute_grade(self.total_score)

        self.status = 'submitted'
        self.save()

    def approve(self):
        if self.status != 'submitted':
            raise ValidationError("Only submitted evaluations can be approved.")

        self.status = 'approved'
        self.save()

'''class Evaluation(models.Model):
    weekly_log = models.ForeignKey(WeeklyLog, on_delete=models.CASCADE, null=True, blank=True)

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
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

    total_score = models.FloatField(null =True, blank = True, default=0)
    grade= models.CharField(max_length=2, null=True, blank=True)    

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    def calculate_total_score(self):
        scores = self.evaluationscore_set.all()
        return sum(score.score for score in scores)

    def compute_grade(self):
        if self.total_score is None:
            return None
        if self.total_score >= 80:
            return 'A'
        elif self.total_score >= 70:
            return 'B'
        elif self.total_score >= 60:
            return 'C'
        elif self.total_score >= 50:
            return 'D'
        else:
            return 'F'
        
    #def clean(self):
        #if self.pk:
            #old 

    def submit(self):
         if self.status != 'draft':
             raise ValidationError("Only draft evaluations can be submitted")

         self.total_score = self.calculate_total_score()
         self.grade = self.compute_grade(self.total_score)

         self.status = 'submitted'
         self.save()

    def approve(self):
        if self.status != 'submitted':
            raise ValidationError("Only submitted evaluations can be approved")

        self.status = 'approved'
        self.save()

    def __str__(self):
        return f"Evaluation - {self.student.email}"'''


'''class EvaluationScore(models.Model):
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE)

    score = models.FloatField(validators=[MinValueValidator(0)])

    def clean(self):
        if self.score > self.criteria.max_score:
            raise ValidationError(f"Max allowed is {self.criteria.max_score}")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.criteria.name}: {self.score}"'''


# =========================
# 7. Signals
# =========================
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'student':
            StudentProfile.objects.create(user=instance)
        elif instance.role == 'academic_supervisor':
            AcademicSupervisorProfile.objects.create(user=instance)
        elif instance.role == 'workplace_supervisor':
            WorkplaceSupervisorProfile.objects.create(user=instance)