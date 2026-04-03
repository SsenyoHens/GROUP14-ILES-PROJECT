from django.db import models
from django.contrib.auth.models import AbstractUser
#1. Custom User Model
class User(AbstractUser):
    email = models.EmailField(unique=True)
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('admin', 'Admin'),
        
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
# Internship placement model
class InternshipPlacement(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()

#3. weekly log model
class WeeklyLog(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    week_number = models.IntegerField()     
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),   
    ]

    content = models.TextField(null=False, blank=False) 
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
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE)
    score = models.IntegerField(null=False)
    feedback = models.TextField()    