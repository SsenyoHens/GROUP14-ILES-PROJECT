from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.models import (
    StudentProfile,
    AcademicSupervisorProfile,
    WorkplaceSupervisorProfile,
)

from core.serializers import (
    StudentProfileSerializer,
)

# =========================================================
# UPDATE STUDENT PROFILE
# =========================================================

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_student_profile(request):

    try:
        profile = StudentProfile.objects.get(user=request.user)

    except StudentProfile.DoesNotExist:

        return Response(
            {"error": "Student profile not found."},
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


# =========================================================
# VIEW SUPERVISORS
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_supervisors(request):

    academic_supervisors = AcademicSupervisorProfile.objects.all()

    workplace_supervisors = WorkplaceSupervisorProfile.objects.all()

    academic_data = []

    for supervisor in academic_supervisors:

        academic_data.append({
            "id": supervisor.id,
            "email": supervisor.user.email,
            "username": supervisor.user.username,
            "department": supervisor.department,
            "staff_id": supervisor.staff_id,
            "phone_number": supervisor.phone_number,
        })

    workplace_data = []

    for supervisor in workplace_supervisors:

        workplace_data.append({
            "id": supervisor.id,
            "email": supervisor.user.email,
            "username": supervisor.user.username,
            "organization": supervisor.organization,
            "job_title": supervisor.job_title,
            "phone_number": supervisor.phone_number,
        })

    return Response({

        "academic_supervisors": academic_data,

        "workplace_supervisors": workplace_data

    }, status=status.HTTP_200_OK)