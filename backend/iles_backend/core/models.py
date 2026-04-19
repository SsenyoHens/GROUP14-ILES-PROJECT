from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator 
from django.core.exceptions import ValidationError 
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.core.exceptions import ValidationError

#1. Custom User Model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('admin', 'Admin'),
        
    ]
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='student')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
# Internship placement model
class InternshipPlacement(models.Model):
    student = models.OneToOneField('StudentProfile', on_delete=models.CASCADE)

    #Add both supervisor roles. that were defined under customuser
    academic_supervisor = models.ForeignKey(
        'AcademicSupervisorProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_supervised_students',
        limit_choices_to={'role': 'academic_supervisor'}
    )

    workplace_supervisor = models.ForeignKey(
        'WorkplaceSupervisorProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='workplace_supervised_students',
        limit_choices_to={'role': 'workplace_supervisor'}
    )

    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    
    #Date Validation esuring that end date is greater than start date
    def clean(self):
        if self.start_date>=self.end_date:
            raise ValidationError("End date must be after start date")
        
        #Overlap Check
        overlapping = InternshipPlacement.objects.filter(student=self.student
                                                         ).filter(
                                                             Q(start_date_lt=self.end_date) & 
                                                             Q(end_date__gt=self.start_date)
                                                         )
        if self.pk:
            overlapping=overlapping.exclude(pk=self.pk)
        if overlapping.exists():
            raise ValidationError("This placement overlaps with an existing one")
        
    #Forcing validation here
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

        
    def __str__(self):
        return f'{self.student} at {self.company_name}'

     
#3. weekly log model
class WeeklyLog(models.Model):
    student = models.ForeignKey('StudentProfile', on_delete=models.CASCADE)
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
     
    def __str__(self):
        return f'Week {self.week_number} Log for {self.student}'
    
#**Meta class to ensure a student can only have one log per week
    class Meta:
        unique_together = ('student', 'week_number')

#4. Evaluation Criteria model
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=255, unique=True)
    max_score = models.IntegerField(default=10)
    description = models.TextField()

    def __str__(self):
        return self.name

#5. Evaluation model
class Evaluation(models.Model):
    class Meta:
        unique_together = ('student', 'evaluator')  # Ensure one evaluation per student-evaluator pair
    
    student = models.ForeignKey('StudentProfile', on_delete=models.CASCADE)
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
    updated_at = models.DateTimeField(auto_now_add=True)   
    criteria = models.ManyToManyField(
    EvaluationCriteria,
    through='EvaluationScore'
    )
    def __str__(self):
        return f'Evaluation for {self.student} by {self.evaluator}' 

class EvaluationScore(models.Model):
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE)
    
    score = models.FloatField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ]
    )
    def clean(self):
        if self.score < 0 or self.score > self.criteria.max_score:
            raise ValidationError(f'Score must be between 0 and {self.criteria.max_score}')
        
    def save(self, *args, **kwargs):
        self.clean()  # Ensure validation is called before saving
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f'{self.criteria.name}: {self.score}'

#6. Student Profile model
class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    registration_number = models.CharField(max_length=20, unique=True)
    course = models.CharField(max_length=100)
    year_of_study = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    phone_number = models.CharField(max_length=25, blank=False, null=False)

    def __str__(self):
        return self.user.email

#Academic Supervisor Profile model
class AcademicSupervisorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    department = models.CharField(max_length=100)
    office_number = models.CharField(max_length=20)

    def __str__(self):
        return self.user.email  

#Workplace Supervisor Profile model
class WorkplaceSupervisorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=25, blank=False, null=False)

    def __str__(self):
        return self.user.email

#Auto-create profiles when a user is created based on their role using Django signals
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'student':
            StudentProfile.objects.create(user=instance)
        elif instance.role == 'academic_supervisor':
            AcademicSupervisorProfile.objects.create(user=instance)
        elif instance.role == 'workplace_supervisor':
            WorkplaceSupervisorProfile.objects.create(user=instance)
