from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Notification
from core.serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):

    notifications = Notification.objects.filter(
        recipient=request.user
    )

    serializer = NotificationSerializer(
        notifications,
        many=True
    )

    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, pk):

    try:
        notification = Notification.objects.get(
            pk=pk,
            recipient=request.user
        )

        notification.is_read = True
        notification.save()

        return Response({
            'message': 'Notification marked as read'
        })

    except Notification.DoesNotExist:

        return Response(
            {'error': 'Notification not found'},
            status=404
        )