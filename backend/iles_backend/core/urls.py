from django.urls import path
from .views import (
    # Auth
   # login_view,
   # register_view,
    get_current_user,
   # update_student_profile,

    # Placement
    create_placement,
    view_placements,
    update_placement,

    # Weekly Logs
    create_log,
    view_logs,
    update_log,
    delete_log,
)

urlpatterns = [
    # 🔐 AUTH
   # path('login/', login_view, name='login'),
   # path('register/', register_view, name='register'),
    path('user/', get_current_user, name='get_current_user'),
   # path('student-profile/', update_student_profile, name='update_student_profile'),

    # 🏢 INTERNSHIP PLACEMENTS
    path('placements/', view_placements, name='view_placements'),
    path('placements/create/', create_placement, name='create_placement'),
    path('placements/update/<int:pk>/', update_placement, name='update_placement'),

    # 📘 WEEKLY LOGS
    path('logs/', view_logs, name='view_logs'),
    path('logs/create/', create_log, name='create_log'),
    path('logs/update/<int:pk>/', update_log, name='update_log'),
    path('logs/delete/<int:pk>/', delete_log, name='delete_log'),
]