from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import LogbookEntry
from .serializers import LogbookEntrySerializer


class LogbookEntryViewSet(viewsets.ModelViewSet):
    serializer_class = LogbookEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LogbookEntry.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        entry = self.get_object()
        if entry.is_submitted:
            return Response({'error': 'Already submitted'}, status=status.HTTP_400_BAD_REQUEST)
        entry.is_submitted = True
        entry.submitted_at = timezone.now()
        entry.save()
        return Response({'message': 'Logbook submitted successfully'})
