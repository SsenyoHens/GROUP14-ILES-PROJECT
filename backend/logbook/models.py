"""
Student Logbook Models for Issue #3
Allows students to log weekly activities and submit for supervisor review
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class LogbookEntry(models.Model):
    """
    Model to store individual logbook entries for students
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='logbook_entries')
    activity_description = models.TextField(
        help_text="Describe the activities completed this week"
    )
    date_logged = models.DateField(auto_now_add=True)
    week_start = models.DateField(help_text="Start date of the week")
    week_end = models.DateField(help_text="End date of the week")
    hours_spent = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text="Total hours spent on activities"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    supervisor_feedback = models.TextField(
        blank=True,
        null=True,
        help_text="Feedback from academic supervisor"
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_logbook_entries',
        help_text="The supervisor who approved this entry"
    )
    approval_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-week_start']
        verbose_name = 'Logbook Entry'
        verbose_name_plural = 'Logbook Entries'
        unique_together = ['student', 'week_start']  # One entry per student per week

    def __str__(self):
        return f"{self.student.username} - Week of {self.week_start}"

    def submit(self):
        """Change status from draft to submitted"""
        if self.status == 'draft':
            self.status = 'submitted'
            self.save()

    def approve(self, supervisor, feedback=''):
        """Approve the logbook entry"""
        self.status = 'approved'
        self.approved_by = supervisor
        self.supervisor_feedback = feedback
        self.approval_date = models.DateTimeField(auto_now=True)
        self.save()

    def reject(self, supervisor, feedback=''):
        """Reject the logbook entry with feedback"""
        self.status = 'rejected'
        self.approved_by = supervisor
        self.supervisor_feedback = feedback
        self.save()
