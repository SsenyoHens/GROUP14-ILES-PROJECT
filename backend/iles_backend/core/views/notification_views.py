from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from core.models import (
    CustomUser, WeeklyLog, Evaluation,
    InternshipPlacement, StudentProfile,
)


def _get_notifications_for_user(user):
    notifications = []
    now = timezone.now()

    # ── STUDENT ───────────────────────────────────────────────────────────────
    if user.role == 'student':
        # Log status changes
        logs = WeeklyLog.objects.filter(
            student=user
        ).order_by('-created_at')[:20]

        for log in logs:
            if log.status == 'approved':
                notifications.append({
                    "id":      f"log_approved_{log.id}",
                    "type":    "log_approved",
                    "title":   f"Logbook Week {log.week_number} Approved",
                    "message": "Your weekly log has been approved by your supervisor.",
                    "time":    log.submitted_at or log.created_at,
                    "read":    False,
                    "icon":    "check",
                    "color":   "green",
                })
            elif log.status == 'rejected':
                notifications.append({
                    "id":      f"log_rejected_{log.id}",
                    "type":    "log_rejected",
                    "title":   f"Logbook Week {log.week_number} Needs Revision",
                    "message": "Your weekly log was returned. Please revise and resubmit.",
                    "time":    log.submitted_at or log.created_at,
                    "read":    False,
                    "icon":    "warning",
                    "color":   "red",
                })

        # New evaluations received
        evals = Evaluation.objects.filter(
            student=user
        ).select_related('evaluator').order_by('-created_at')[:10]

        for ev in evals:
            evaluator_name = (
                f"{ev.evaluator.first_name} {ev.evaluator.last_name}".strip()
                if ev.evaluator else 'Your supervisor'
            )
            notifications.append({
                "id":      f"eval_{ev.id}",
                "type":    "new_evaluation",
                "title":   "New Evaluation Received",
                "message": (
                    f"{evaluator_name} submitted an evaluation for you."
                    + (f" Score: {ev.total_score}/100" if ev.total_score else '')
                ),
                "time":    ev.created_at,
                "read":    False,
                "icon":    "star",
                "color":   "purple",
            })

        # Placement status notification
        profile = StudentProfile.objects.filter(user=user).first()
        if profile:
            placement = InternshipPlacement.objects.filter(student=profile).first()
            if placement:
                if placement.status == 'active':
                    notifications.append({
                        "id":      f"placement_active_{placement.id}",
                        "type":    "placement_active",
                        "title":   "Placement Activated",
                        "message": f"Your placement at {placement.company_name} is now active.",
                        "time":    placement.created_at,
                        "read":    False,
                        "icon":    "work",
                        "color":   "brand",
                    })
                elif placement.status == 'rejected':
                    notifications.append({
                        "id":      f"placement_rejected_{placement.id}",
                        "type":    "placement_rejected",
                        "title":   "Placement Application Update",
                        "message": "Your placement was not approved. Contact your coordinator.",
                        "time":    placement.created_at,
                        "read":    False,
                        "icon":    "warning",
                        "color":   "red",
                    })
                elif placement.status == 'pending':
                    notifications.append({
                        "id":      f"placement_pending_{placement.id}",
                        "type":    "placement_pending",
                        "title":   "Placement Pending Approval",
                        "message": f"Your placement at {placement.company_name} is awaiting approval.",
                        "time":    placement.created_at,
                        "read":    False,
                        "icon":    "schedule",
                        "color":   "orange",
                    })

        # Reminder: draft logs older than 3 days
        old_drafts = WeeklyLog.objects.filter(
            student=user,
            status='draft',
            created_at__lt=now - timedelta(days=3),
        ).count()
        if old_drafts > 0:
            notifications.append({
                "id":      "draft_reminder",
                "type":    "reminder",
                "title":   f"{old_drafts} Draft Log{'s' if old_drafts > 1 else ''} Pending",
                "message": "You have draft logbook entries that haven't been submitted yet.",
                "time":    now,
                "read":    False,
                "icon":    "schedule",
                "color":   "orange",
            })

    # ── ACADEMIC SUPERVISOR ───────────────────────────────────────────────────
    elif user.role == 'academic_supervisor':
        # Logs submitted for review
        pending_logs = WeeklyLog.objects.filter(
            student__studentprofile__internshipplacement__academic_supervisor__user=user,
            status='submitted',
        ).select_related('student').order_by('-submitted_at')[:20]

        for log in pending_logs:
            student_name = (
                f"{log.student.first_name} {log.student.last_name}".strip()
                or log.student.email
            )
            notifications.append({
                "id":      f"log_pending_{log.id}",
                "type":    "log_submitted",
                "title":   "New Logbook Entry to Review",
                "message": f"{student_name} submitted Week {log.week_number} log for review.",
                "time":    log.submitted_at or log.created_at,
                "read":    False,
                "icon":    "book",
                "color":   "orange",
            })

        # Students placed under this supervisor (last 30 days)
        recent_placements = InternshipPlacement.objects.filter(
            academic_supervisor__user=user,
            created_at__gte=now - timedelta(days=30),
        ).select_related('student__user').order_by('-created_at')[:10]

        for p in recent_placements:
            if p.student:
                student_name = (
                    f"{p.student.user.first_name} {p.student.user.last_name}".strip()
                    or p.student.user.email
                )
                notifications.append({
                    "id":      f"placement_assigned_{p.id}",
                    "type":    "student_assigned",
                    "title":   "New Student Assigned",
                    "message": f"{student_name} has been placed at {p.company_name}.",
                    "time":    p.created_at,
                    "read":    False,
                    "icon":    "person",
                    "color":   "brand",
                })

        # Evaluations submitted on my students by others
        new_evals = Evaluation.objects.filter(
            student__studentprofile__internshipplacement__academic_supervisor__user=user,
            status='submitted',
        ).exclude(evaluator=user).select_related('student', 'evaluator').order_by('-created_at')[:10]

        for ev in new_evals:
            student_name = (
                f"{ev.student.first_name} {ev.student.last_name}".strip()
                or ev.student.email
            )
            notifications.append({
                "id":      f"eval_submitted_{ev.id}",
                "type":    "evaluation_submitted",
                "title":   "Evaluation Submitted",
                "message": f"An evaluation was submitted for {student_name}.",
                "time":    ev.created_at,
                "read":    False,
                "icon":    "assignment",
                "color":   "purple",
            })

        # Overdue log reviews (submitted > 7 days ago)
        overdue = WeeklyLog.objects.filter(
            student__studentprofile__internshipplacement__academic_supervisor__user=user,
            status='submitted',
            submitted_at__lt=now - timedelta(days=7),
        ).count()
        if overdue > 0:
            notifications.append({
                "id":      "overdue_reviews",
                "type":    "reminder",
                "title":   f"{overdue} Overdue Log Review{'s' if overdue > 1 else ''}",
                "message": (
                    f"You have {overdue} log submission{'s' if overdue > 1 else ''} "
                    f"waiting more than 7 days for review."
                ),
                "time":    now,
                "read":    False,
                "icon":    "warning",
                "color":   "red",
            })

    # ── WORKPLACE SUPERVISOR ──────────────────────────────────────────────────
    elif user.role == 'workplace_supervisor':
        # Logs submitted for review
        pending_logs = WeeklyLog.objects.filter(
            student__studentprofile__internshipplacement__workplace_supervisor__user=user,
            status='submitted',
        ).select_related('student').order_by('-submitted_at')[:20]

        for log in pending_logs:
            student_name = (
                f"{log.student.first_name} {log.student.last_name}".strip()
                or log.student.email
            )
            notifications.append({
                "id":      f"log_pending_{log.id}",
                "type":    "log_submitted",
                "title":   "New Logbook Entry to Review",
                "message": f"{student_name} submitted Week {log.week_number} for review.",
                "time":    log.submitted_at or log.created_at,
                "read":    False,
                "icon":    "book",
                "color":   "orange",
            })

        # New interns assigned (last 30 days)
        recent_placements = InternshipPlacement.objects.filter(
            workplace_supervisor__user=user,
            created_at__gte=now - timedelta(days=30),
        ).select_related('student__user').order_by('-created_at')[:10]

        for p in recent_placements:
            if p.student:
                student_name = (
                    f"{p.student.user.first_name} {p.student.user.last_name}".strip()
                    or p.student.user.email
                )
                notifications.append({
                    "id":      f"student_assigned_{p.id}",
                    "type":    "student_assigned",
                    "title":   "New Intern Assigned",
                    "message": f"{student_name} has been assigned to your supervision.",
                    "time":    p.created_at,
                    "read":    False,
                    "icon":    "person",
                    "color":   "brand",
                })

        # Students with no evaluation yet (reminder)
        students_without_eval = []
        for p in InternshipPlacement.objects.filter(
            workplace_supervisor__user=user,
            status='active',
        ).select_related('student__user'):
            if p.student:
                has_eval = Evaluation.objects.filter(
                    student=p.student.user,
                    evaluator=user,
                ).exists()
                if not has_eval:
                    name = (
                        f"{p.student.user.first_name} {p.student.user.last_name}".strip()
                        or p.student.user.email
                    )
                    students_without_eval.append(name)

        if students_without_eval:
            count = len(students_without_eval)
            notifications.append({
                "id":      "eval_reminder",
                "type":    "reminder",
                "title":   f"{count} Student{'s' if count > 1 else ''} Awaiting Evaluation",
                "message": (
                    f"You haven't submitted an evaluation for: "
                    f"{', '.join(students_without_eval[:3])}"
                    + ('…' if count > 3 else '')
                ),
                "time":    now,
                "read":    False,
                "icon":    "star",
                "color":   "purple",
            })

    # ── ADMIN ─────────────────────────────────────────────────────────────────
    else:
        # New student registrations (last 7 days)
        new_students = CustomUser.objects.filter(
            role='student',
            date_joined__gte=now - timedelta(days=7),
        ).order_by('-date_joined')[:10]

        for s in new_students:
            full_name = f"{s.first_name} {s.last_name}".strip() or s.email
            notifications.append({
                "id":      f"new_student_{s.id}",
                "type":    "new_student",
                "title":   "New Student Registered",
                "message": f"{full_name} ({s.email}) joined the system.",
                "time":    s.date_joined,
                "read":    False,
                "icon":    "person",
                "color":   "brand",
            })

        # Pending placements
        pending_placements = InternshipPlacement.objects.filter(
            status='pending',
        ).select_related('student__user').order_by('-created_at')[:10]

        for p in pending_placements:
            student_name = (
                f"{p.student.user.first_name} {p.student.user.last_name}".strip()
                or p.student.user.email
            ) if p.student else 'A student'
            notifications.append({
                "id":      f"placement_pending_{p.id}",
                "type":    "placement_pending",
                "title":   "Placement Awaiting Approval",
                "message": f"{student_name}'s placement at {p.company_name} needs approval.",
                "time":    p.created_at,
                "read":    False,
                "icon":    "work",
                "color":   "orange",
            })

        # Total logs pending review system-wide
        total_pending = WeeklyLog.objects.filter(status='submitted').count()
        if total_pending > 0:
            notifications.append({
                "id":      "admin_pending_logs",
                "type":    "reminder",
                "title":   f"{total_pending} Log{'s' if total_pending > 1 else ''} Pending Review",
                "message": (
                    f"{total_pending} student log submission{'s' if total_pending > 1 else ''} "
                    f"awaiting supervisor review."
                ),
                "time":    now,
                "read":    False,
                "icon":    "schedule",
                "color":   "orange",
            })

        # New supervisors (last 7 days)
        new_supervisors = CustomUser.objects.filter(
            role__in=['academic_supervisor', 'workplace_supervisor'],
            date_joined__gte=now - timedelta(days=7),
        ).order_by('-date_joined')[:5]

        for s in new_supervisors:
            role_label = (
                'Academic Supervisor' if s.role == 'academic_supervisor'
                else 'Workplace Supervisor'
            )
            full_name = f"{s.first_name} {s.last_name}".strip() or s.email
            notifications.append({
                "id":      f"new_supervisor_{s.id}",
                "type":    "new_supervisor",
                "title":   f"New {role_label} Added",
                "message": f"{full_name} ({s.email}) was added to the system.",
                "time":    s.date_joined,
                "read":    False,
                "icon":    "person",
                "color":   "blue",
            })

        # Evaluations awaiting approval
        pending_evals = Evaluation.objects.filter(status='submitted').count()
        if pending_evals > 0:
            notifications.append({
                "id":      "admin_pending_evals",
                "type":    "reminder",
                "title":   f"{pending_evals} Evaluation{'s' if pending_evals > 1 else ''} to Approve",
                "message": (
                    f"{pending_evals} submitted evaluation{'s' if pending_evals > 1 else ''} "
                    f"awaiting approval."
                ),
                "time":    now,
                "read":    False,
                "icon":    "assignment",
                "color":   "purple",
            })

    # ── Sort by time desc, limit 30 ───────────────────────────────────────────
    notifications.sort(key=lambda x: x['time'], reverse=True)

    for n in notifications:
        if n['time']:
            try:
                n['time'] = n['time'].isoformat()
            except AttributeError:
                n['time'] = str(n['time'])

    return notifications[:30]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        notifications = _get_notifications_for_user(request.user)
        unread_count  = len([n for n in notifications if not n['read']])
        return Response({
            "notifications": notifications,
            "unread_count":  unread_count,
            "total":         len(notifications),
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    try:
        notifications = _get_notifications_for_user(request.user)
        return Response({
            "unread_count": len([n for n in notifications if not n['read']])
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)