from django.contrib import admin
from .models import User, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation

admin.site.register(User)
admin.site.register(InternshipPlacement)
admin.site.register(WeeklyLog)
admin.site.register(EvaluationCriteria) 
admin.site.register(Evaluation)


# Register your models here.
