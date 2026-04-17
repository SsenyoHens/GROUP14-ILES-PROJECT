from django.db import models
from django.contrib.auth.models import AbstractUser
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
    week_number = models.IntegerField()     
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),   
    ]

    content = models.TextField() 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

#**Meta class to ensure a student can only have one log per week
    class Meta:
        unique_together = ('student', 'week_number')

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