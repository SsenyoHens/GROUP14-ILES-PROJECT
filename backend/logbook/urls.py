from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LogbookEntryViewSet

router = DefaultRouter()
router.register(r'entries', LogbookEntryViewSet, basename='logbook-entry')

urlpatterns = [
    path('', include(router.urls)),
]
