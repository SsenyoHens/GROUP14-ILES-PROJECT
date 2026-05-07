from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.models import StudentProfile
from core.serializers import StudentProfileSerializer


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_student_profile(request):

    try:
        profile = StudentProfile.objects.get(
            user=request.user
        )

    except StudentProfile.DoesNotExist:

        return Response(
            {"error": "Student profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = StudentProfileSerializer(
        profile,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )