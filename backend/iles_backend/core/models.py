from django.db import models
from django.db.models import Q
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.core.validators import MinValueValidator, MaxValueValidator


#1. Custom User Model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('admin', 'Admin'),
        
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
# Internship placement model
class InternshipPlacement(models.Model):
    student = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    #Add both supervisor roles. that were defined under customuser
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
     
#3. weekly log model
class WeeklyLog(models.Model):

    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    week_number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(52)])   #Ensuring no zero weeks and negative weeks and more than 52 weeks  
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),   
    ]

    content = models.TextField() 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)

#**Meta class to ensure a student can only have one log per week
    
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
        if self.pk:
            old=WeeklyLog.objects.get(pk=self.pk)
            if old.status == "approved":
                raise ValidationError("Approved logs cannot be edited.")
            
            # Prevent revert
            if old.status == "submitted" and self.status == "draft":
                raise ValidationError("Submitted logs cannot be reverted to draft.")
            
    #Rule 2: Deadline for submission: A student cannot submit a log for a week that has already passed
        if self.status == "submitted":
            
            deadline = self.submitted_at + timedelta(days=7)
            if timezone.now() > deadline:
                raise ValidationError("Submission Deadline Passed!")

            
    def save(self, *args, **kwargs):

        #auto set submited time
        if self.status == "submitted" and not self.submitted_at:
            self.submitted_at = timezone.now()

        self.full_clean()
        super().save(*args, **kwargs)

#4. Evaluation Criteria model
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=255, unique=True)
    max_score = models.IntegerField(default=10)
    description = models.TextField()

#5. Evaluation model
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
    score = models.IntegerField(null=False)
    feedback = models.TextField()    