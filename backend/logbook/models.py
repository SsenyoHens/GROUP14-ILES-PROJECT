from django.db import models
from django.conf import settings


class LogbookEntry(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    week_number = models.IntegerField()
    activities = models.TextField()
    date_logged = models.DateTimeField(auto_now_add=True)
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Week {self.week_number} - {self.student.username}"
