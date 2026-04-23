from django.urls import path
from .views import create_placement, view_placements, update_placement
from .views import register_user, login_user
from .views import (
    create_placement, view_placements, update_placement,
    create_log, view_logs, update_log, delete_log
)
urlpatterns = [
    path('placements/', view_placements),
    path('placements/create/', create_placement),
    path('placements/update/<int:pk>/', update_placement),
    path('register/', register_user),     #for email login
    path('login/', login_user),
    
    #ADDED
    path('logs/', view_logs),
    path('logs/create/', create_log),
    path('logs/update/<int:pk>/', update_log),
    path('logs/delete/<int:pk>/', delete_log),
]