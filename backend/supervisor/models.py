"""
Supervisor Models for Issue #4
Allows workplace supervisors to manage and assess student work
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class SupervisorProfile(models.Model):
    """
    Profile for workplace supervisors
    Links a user to their supervisor role and assigned students
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='supervisor_profile')
    company_name = models.CharField(max_length=255, help_text="Name of the company/workplace")
    department = models.CharField(max_length=255, help_text="Department within the company")
    phone = models.CharField(max_length=20, blank=True)
    assigned_students = models.ManyToManyField(User, related_name='workplace_supervisors', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Supervisor Profile'
        verbose_name_plural = 'Supervisor Profiles'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.company_name}"


class WorkplaceAssessment(models.Model):
    """
    Assessment of student's practical application and work performance
    Supervisor evaluates student's knowledge and practical skills
    """
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Below Average'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workplace_assessments')
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='given_assessments', limit_choices_to={'groups__name': 'Supervisors'})
    supervisor_profile = models.ForeignKey(SupervisorProfile, on_delete=models.CASCADE, related_name='assessments')
    
    # Assessment Details
    assessment_date = models.DateField(auto_now_add=True)
    assessment_period_start = models.DateField(help_text="Start date of assessment period")
    assessment_period_end = models.DateField(help_text="End date of assessment period")
    
    # Ratings
    technical_skills_rating = models.IntegerField(
        choices=RATING_CHOICES,
        help_text="Rating of technical/practical skills"
    )
    knowledge_application_rating = models.IntegerField(
        choices=RATING_CHOICES,
        help_text="Rating of knowledge application in workplace"
    )
    communication_rating = models.IntegerField(
        choices=RATING_CHOICES,
        help_text="Rating of communication and teamwork"
    )
    overall_rating = models.IntegerField(
        choices=RATING_CHOICES,
        help_text="Overall assessment rating"
    )
    
    # Comments and Feedback
    strengths = models.TextField(
        help_text="Student's strengths demonstrated during work"
    )
    areas_for_improvement = models.TextField(
        help_text="Areas where student can improve"
    )
    recommendations = models.TextField(
        blank=True,
        help_text="Recommendations for academic program"
    )
    
    # Status
    is_approved = models.BooleanField(default=False)
    approved_by_academic = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_assessments',
        help_text="Academic supervisor who approved this assessment"
    )
    approval_date = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-assessment_date']
        verbose_name = 'Workplace Assessment'
        verbose_name_plural = 'Workplace Assessments'
        unique_together = ['student', 'supervisor_profile', 'assessment_period_start']

    def __str__(self):
        return f"{self.student.username} - Assessment by {self.supervisor_profile.company_name}"

    @property
    def average_rating(self):
        """Calculate average rating"""
        ratings = [
            self.technical_skills_rating,
            self.knowledge_application_rating,
            self.communication_rating,
            self.overall_rating
        ]
        return sum(ratings) / len(ratings)

    def approve(self, academic_supervisor):
        """Mark assessment as approved by academic supervisor"""
        self.is_approved = True
        self.approved_by_academic = academic_supervisor
        self.approval_date = models.DateTimeField(auto_now=True)
        self.save()
