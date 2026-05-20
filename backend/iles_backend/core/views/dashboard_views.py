from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from core.models import InternshipPlacement, WeeklyLog, Evaluation, CustomUser, StudentProfile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user

    try:
        if user.role == 'student':
            
            profile  = StudentProfile.objects.filter(user=user).first()
            placement = InternshipPlacement.objects.filter(student=profile).first() if profile else None
            logs     = WeeklyLog.objects.filter(student=user)
            evals    = Evaluation.objects.filter(student=user)

            return Response({
                "role":              "student",
                "placement_status":  placement.status if placement else None,
                "company":           placement.company_name if placement else None,
                "total_logs":        logs.count(),
                "submitted_logs":    logs.filter(status='submitted').count(),
                "approved_logs":     logs.filter(status='approved').count(),
                "rejected_logs":     logs.filter(status='rejected').count(),
                "pending_logs":      logs.filter(status='draft').count(),
                "total_evaluations": evals.count(),
            })

        elif user.role == 'academic_supervisor':
            placements = InternshipPlacement.objects.filter(
                academic_supervisor__user=user
            )
            students = CustomUser.objects.filter(
                studentprofile__internshipplacement__academic_supervisor__user=user
            ).distinct()
            logs  = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__academic_supervisor__user=user
            )
            evals = Evaluation.objects.filter(
                student__studentprofile__internshipplacement__academic_supervisor__user=user
            )
            return Response({
                "role":              "academic_supervisor",
                "total_students":    students.count(),
                "active_placements": placements.filter(status='active').count(),
                "pending_logs":      logs.filter(status='submitted').count(),
                "approved_logs":     logs.filter(status='approved').count(),
                "total_evaluations": evals.count(),
            })

        elif user.role == 'workplace_supervisor':
            placements = InternshipPlacement.objects.filter(
                workplace_supervisor__user=user
            )
            students = CustomUser.objects.filter(
                studentprofile__internshipplacement__workplace_supervisor__user=user
            ).distinct()
            logs = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__workplace_supervisor__user=user
            )
            return Response({
                "role":           "workplace_supervisor",
                "total_students": students.count(),
                "active_placements": placements.filter(status='active').count(),
                "pending_logs":   logs.filter(status='submitted').count(),
                "approved_logs":  logs.filter(status='approved').count(),
            })

        else:
            # Admin
            return Response({
                "role":              "admin",
                "total_students":    CustomUser.objects.filter(role='student').count(),
                "total_placements":  InternshipPlacement.objects.count(),
                "active_placements": InternshipPlacement.objects.filter(status='active').count(),
                "pending_logs":      WeeklyLog.objects.filter(status='submitted').count(),
                "submitted_logs":    WeeklyLog.objects.filter(status='submitted').count(),
                "total_evaluations": Evaluation.objects.count(),
                "total_supervisors": CustomUser.objects.filter(
                    role__in=['academic_supervisor', 'workplace_supervisor']
                ).count(),
            })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activity(request):
    user = request.user

    try:
        if user.role == 'student':
            logs  = WeeklyLog.objects.filter(student=user).order_by('-created_at')[:5]
            evals = Evaluation.objects.filter(student=user).order_by('-created_at')[:5]
        elif user.role == 'academic_supervisor':
            logs  = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__academic_supervisor__user=user
            ).order_by('-created_at')[:5]
            evals = Evaluation.objects.filter(
                student__studentprofile__internshipplacement__academic_supervisor__user=user
            ).order_by('-created_at')[:5]
        elif user.role == 'workplace_supervisor':
            logs  = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__workplace_supervisor__user=user
            ).order_by('-created_at')[:5]
            evals = Evaluation.objects.none()
        else:
            logs  = WeeklyLog.objects.order_by('-created_at')[:5]
            evals = Evaluation.objects.order_by('-created_at')[:5]

        activity = []
        for log in logs:
            activity.append({
                "type":        "log",
                "id":          log.id,
                "description": f"Weekly log – Week {log.week_number}",
                "student":     log.student.get_full_name(),
                "status":      log.status,
                "date":        log.created_at,
            })
        for ev in evals:
            activity.append({
                "type":        "evaluation",
                "id":          ev.id,
                "description": f"Evaluation – {ev.student.get_full_name()}",
                "status":      ev.status,
                "date":        ev.created_at,
            })

        activity.sort(key=lambda x: x['date'], reverse=True)
        return Response(activity[:10])

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_deadlines(request):
    user     = request.user
    today    = timezone.now().date()
    in_7days = today + timedelta(days=7)

    try:
        if user.role == 'student':
            profile = StudentProfile.objects.filter(user=user).first()
            placements = InternshipPlacement.objects.filter(
                student=profile,
                end_date__range=[today, in_7days]
            ) if profile else InternshipPlacement.objects.none()
        elif user.role == 'academic_supervisor':
            placements = InternshipPlacement.objects.filter(
                academic_supervisor__user=user,
                end_date__range=[today, in_7days]
            )
        elif user.role == 'workplace_supervisor':
            placements = InternshipPlacement.objects.filter(
                workplace_supervisor__user=user,
                end_date__range=[today, in_7days]
            )
        else:
            placements = InternshipPlacement.objects.filter(
                end_date__range=[today, in_7days]
            )

        deadlines = [
            {
                "id":        p.id,
                "type":      "placement",
                "student":   p.student.user.get_full_name(),
                "company":   p.company_name,
                "deadline":  p.end_date,
                "days_left": (p.end_date - today).days,
            }
            for p in placements
        ]
        return Response(deadlines)

    except Exception as e:
        return Response({'error': str(e)}, status=500)