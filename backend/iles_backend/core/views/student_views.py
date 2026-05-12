from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.models import CustomUser, InternshipPlacement, WeeklyLog
from core.serializers import StudentProfileSerializer
from core.permissions import IsAdmin, IsAcademicSupervisor, IsSupervisor


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_list(request):
    students = CustomUser.objects.filter(role='student')

    # Optional filters
    department = request.query_params.get('department')
    search     = request.query_params.get('search')

    if department:
        students = students.filter(department=department)
    if search:
        students = students.filter(
            first_name__icontains=search
        ) | students.filter(
            last_name__icontains=search
        ) | students.filter(
            email__icontains=search
        )

    serializer = StudentProfileSerializer(students, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    try:
        student = CustomUser.objects.get(pk=pk, role='student')
    except CustomUser.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    if request.method == 'GET':
        placement = InternshipPlacement.objects.filter(
            student=student.studentprofile
        ).first()
        logs      = WeeklyLog.objects.filter(student=student)

        serializer = StudentProfileSerializer(student)
        return Response({
            **serializer.data,
            "placement": {
                "id":      placement.id      if placement else None,
                "company": placement.company_name if placement else None,
                "status":  placement.status  if placement else None,
            },
            "log_stats": {
                "total":     logs.count(),
                "submitted": logs.filter(status='submitted').count(),
                "approved":  logs.filter(status='approved').count(),
            }
        })

    if request.method == 'PUT':
        serializer = StudentProfileSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)