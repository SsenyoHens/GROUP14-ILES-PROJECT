from django.urls import path
from .views import create_placement, view_placements, update_placement

urlpatterns = [
    path('placements/', view_placements),
    path('placements/create/', create_placement),
    path('placements/update/<int:pk>/', update_placement),
]
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]