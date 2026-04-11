from django.urls import path, include
from .views import login_view,register_view, get_current_user

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('user/', get_current_user, name='get_current_user'),
]