from django.urls import path, include
from .views import login_view,register_view, get_current_user,update_student_profile

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('user/', get_current_user, name='get_current_user'),
    path('student-profile/', update_student_profile, name='update_student_profile'),
]
