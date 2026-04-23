from django.db import models
from django.db.models import Q
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.core.validators import MinValueValidator, MaxValueValidator


# 1. Custom User Model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')


# 2. Internship Placement Model
class InternshipPlacement(models.Model):
    student = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'}
    )

    academic_supervisor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_supervised_students',
        limit_choices_to={'role': 'academic_supervisor'}
    )

    workplace_supervisor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workplace_supervised_students',
        limit_choices_to={'role': 'workplace_supervisor'}
    )

    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.student.username} - {self.company_name}"


# 3. Weekly Log Model
from django.conf import settings
class WeeklyLog(models.Model):

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
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
                condition=Q(week_number__gte=1) & Q(week_number__lte=52),
                name="week_number_valid_range"
            )
        ]

    def clean(self):
        old = None
        if self.pk:
            old = WeeklyLog.objects.filter(pk=self.pk).first()

        # 🔒 Rule 1: Lock after approval
        if old:
            if old.status == "approved":
                raise ValidationError("Approved logs cannot be edited.")

            if old.status == "submitted" and self.status == "draft":
                raise ValidationError("Submitted logs cannot be reverted to draft.")

        # ⏰ Rule 2: Submission deadline
        if self.status == "submitted":
            if self.created_at:
                deadline = self.created_at + timedelta(days=7)

                if timezone.now() > deadline:
                    raise ValidationError("Submission deadline passed!")

    def save(self, *args, **kwargs):
        # auto set submitted time
        if self.status == "submitted" and not self.submitted_at:
            self.submitted_at = timezone.now()

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.username} - Week {self.week_number}"


# 4. Evaluation Criteria Model
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=255, unique=True)
    max_score = models.IntegerField(default=10)
    description = models.TextField()

    def __str__(self):
        return self.name


# 5. Evaluation Model
class Evaluation(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    evaluator = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='evaluations_given',
        limit_choices_to={
            'role__in': ['academic_supervisor', 'workplace_supervisor']
        }
    )

    criteria = models.ManyToManyField(EvaluationCriteria)

    score = models.IntegerField(
        validators=[MinValueValidator(0)]
    )

    feedback = models.TextField()

    def __str__(self):
        return f"{self.student.username} - Score: {self.score}"