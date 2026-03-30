from django.db import models

# Create your models here.
class LogbookEntry(models.Model):
    activity = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.activity
