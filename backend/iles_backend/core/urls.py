from django.urls import path
from .views import create_placement, view_placements, update_placement

urlpatterns = [
    path('placements/', view_placements),
    path('placements/create/', create_placement),
    path('placements/update/<int:pk>/', update_placement),
]