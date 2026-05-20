from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import CustomUser, StudentProfile, InternshipPlacement, WeeklyLog, Evaluation


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_list(request):
    user = request.user
    try:
        if user.role == 'workplace_supervisor':
            placements = InternshipPlacement.objects.filter(
                workplace_supervisor__user=user
            ).select_related('student__user')
            student_users = [p.student.user for p in placements if p.student]

        elif user.role == 'academic_supervisor':
            placements = InternshipPlacement.objects.filter(
                academic_supervisor__user=user
            ).select_related('student__user')
            student_users = [p.student.user for p in placements if p.student]

        else:
            # Admin sees everyone with role=student
            student_users = list(CustomUser.objects.filter(role='student').select_related('studentprofile'))

        data = []
        for s in student_users:
            profile = getattr(s, 'studentprofile', None)
            data.append({
                "id":         s.id,
                "first_name": s.first_name,
                "last_name":  s.last_name,
                "email":      s.email,
                "phone":      s.phone,
                "department": s.department,
                "role":       s.role,
                "profile": {
                    "registration_number": profile.registration_number if profile else None,
                    "course":              profile.course               if profile else None,
                    "year_of_study":       profile.year_of_study        if profile else None,
                } if profile else {},
            })
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    try:
        student = CustomUser.objects.select_related('studentprofile').get(pk=pk, role='student')
    except CustomUser.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    profile = getattr(student, 'studentprofile', None)
    logs    = WeeklyLog.objects.filter(student=student)
    evals   = Evaluation.objects.filter(student=student)

    # Try to get their placement
    placement = None
    if profile:
        placement_obj = InternshipPlacement.objects.filter(student=profile).first()
        if placement_obj:
            placement = {
                "id":           placement_obj.id,
                "company_name": placement_obj.company_name,
                "position":     placement_obj.position,
                "status":       placement_obj.status,
                "start_date":   str(placement_obj.start_date) if placement_obj.start_date else None,
                "end_date":     str(placement_obj.end_date)   if placement_obj.end_date   else None,
            }

    return Response({
        "id":         student.id,
        "first_name": student.first_name,
        "last_name":  student.last_name,
        "email":      student.email,
        "phone":      student.phone,
        "department": student.department,
        "profile": {
            "registration_number": profile.registration_number if profile else None,
            "course":              profile.course               if profile else None,
            "year_of_study":       profile.year_of_study        if profile else None,
        } if profile else {},
        "placement": placement,
        "log_stats": {
            "total":     logs.count(),
            "submitted": logs.filter(status='submitted').count(),
            "approved":  logs.filter(status='approved').count(),
            "draft":     logs.filter(status='draft').count(),
            "rejected":  logs.filter(status='rejected').count(),
        },
        "evaluations_count": evals.count(),
    })