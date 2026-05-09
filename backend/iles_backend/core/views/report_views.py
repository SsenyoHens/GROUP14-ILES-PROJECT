from django.db.models import Count, Avg, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import InternshipPlacement, WeeklyLog, Evaluation, CustomUser
from core.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_summary(request):
    user = request.user

    if user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    return Response({
        "total_students":    CustomUser.objects.filter(role='student').count(),
        "total_placements":  InternshipPlacement.objects.count(),
        "total_logs":        WeeklyLog.objects.count(),
        "total_evaluations": Evaluation.objects.count(),
        "placement_breakdown": {
            "pending":   InternshipPlacement.objects.filter(status='pending').count(),
            "active":    InternshipPlacement.objects.filter(status='active').count(),
            "completed": InternshipPlacement.objects.filter(status='completed').count(),
            "rejected":  InternshipPlacement.objects.filter(status='rejected').count(),
        },
        "log_breakdown": {
            "draft":     WeeklyLog.objects.filter(status='draft').count(),
            "submitted": WeeklyLog.objects.filter(status='submitted').count(),
            "approved":  WeeklyLog.objects.filter(status='approved').count(),
            "rejected":  WeeklyLog.objects.filter(status='rejected').count(),
        },
        "evaluation_breakdown": {
            "draft":     Evaluation.objects.filter(status='draft').count(),
            "submitted": Evaluation.objects.filter(status='submitted').count(),
            "approved":  Evaluation.objects.filter(status='approved').count(),
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def placement_trend(request):
    user = request.user

    if user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    # Group placements by month
    from django.db.models.functions import TruncMonth
    trend = (
        InternshipPlacement.objects
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    return Response([
        {
            "month": entry['month'].strftime('%Y-%m') if entry['month'] else None,
            "count": entry['count'],
        }
        for entry in trend
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_by_dept(request):
    user = request.user

    if user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    # Academic supervisor sees only their department
    if user.role == 'academic_supervisor':
        profile = getattr(user, 'academicsupervisorprofile', None)
        dept_filter = {'department': profile.department} if profile else {}
        students = CustomUser.objects.filter(role='student', **dept_filter)
    else:
        students = CustomUser.objects.filter(role='student')

    by_dept = (
        students
        .values('department')
        .annotate(
            total_students=Count('id'),
        )
        .order_by('department')
    )

    # Enrich with placement counts per department
    result = []
    for entry in by_dept:
        dept = entry['department']
        placements = InternshipPlacement.objects.filter(
            student__user__department=dept
        )
        result.append({
            "department":       dept or 'Unassigned',
            "total_students":   entry['total_students'],
            "total_placements": placements.count(),
            "active":           placements.filter(status='active').count(),
            "completed":        placements.filter(status='completed').count(),
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def status_breakdown(request):
    user = request.user

    if user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    # Filter by supervisor scope
    if user.role == 'academic_supervisor':
        placements = InternshipPlacement.objects.filter(
            academic_supervisor__user=user
        )
    elif user.role == 'workplace_supervisor':
        placements = InternshipPlacement.objects.filter(
            workplace_supervisor__user=user
        )
    else:
        placements = InternshipPlacement.objects.all()

    breakdown = (
        placements
        .values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )

    return Response(list(breakdown))