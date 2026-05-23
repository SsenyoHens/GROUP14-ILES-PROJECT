from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import Evaluation, StudentProfile, CustomUser, WeeklyLog


# ── helpers ───────────────────────────────────────────────────────────────────

def _resolve_student_user(student_raw):
    """
    Accept student as:
      - user pk (int or numeric string)
      - StudentProfile pk
      - registration number string (e.g. 'CS/2026/003')
    Returns CustomUser or None.
    """
    if not student_raw:
        return None

    # Try as integer pk
    try:
        pk = int(student_raw)
        # Try user pk first
        user = CustomUser.objects.filter(pk=pk, role='student').first()
        if user:
            return user
        # Try StudentProfile pk
        profile = StudentProfile.objects.filter(pk=pk).first()
        if profile:
            return profile.user
    except (ValueError, TypeError):
        pass

    # Try as registration number string
    profile = StudentProfile.objects.filter(
        registration_number__iexact=str(student_raw).strip()
    ).first()
    if profile:
        return profile.user

    return None


def _serialize_evaluation(ev):
    """Return a safe dict from an Evaluation instance."""
    return {
        "id":              ev.id,
        "student":         ev.student_id,
        "student_email":   ev.student.email       if ev.student   else None,
        "evaluator":       ev.evaluator_id,
        "evaluator_email": ev.evaluator.email     if ev.evaluator else None,
        "weekly_log":      ev.weekly_log_id,
        "feedback":        ev.feedback,
        "grade":           ev.grade,
        "total_score":     ev.total_score,
        "status":          ev.status,
        "created_at":      ev.created_at.isoformat() if ev.created_at else None,
        "updated_at":      ev.updated_at.isoformat() if ev.updated_at else None,
    }


def _get_queryset_for_user(user):
    """Return the correct Evaluation queryset based on user role."""
    if user.role == 'student':
        return Evaluation.objects.filter(student=user)

    elif user.role == 'academic_supervisor':
        return Evaluation.objects.filter(
            student__studentprofile__internshipplacement__academic_supervisor__user=user
        )

    elif user.role == 'workplace_supervisor':
        return Evaluation.objects.filter(
            student__studentprofile__internshipplacement__workplace_supervisor__user=user
        )

    else:
        # admin sees all
        return Evaluation.objects.all()


# ── views ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_list(request):
    try:
        evals = _get_queryset_for_user(request.user).select_related(
            'student', 'evaluator', 'weekly_log'
        ).order_by('-created_at')
        return Response([_serialize_evaluation(e) for e in evals])
    except Exception as ex:
        return Response({'error': str(ex)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_detail(request, pk):
    try:
        ev = Evaluation.objects.select_related(
            'student', 'evaluator', 'weekly_log'
        ).get(pk=pk)
    except Evaluation.DoesNotExist:
        return Response({"error": "Evaluation not found"}, status=404)

    if request.user.role == 'student' and ev.student != request.user:
        return Response({"error": "Not authorized"}, status=403)

    return Response(_serialize_evaluation(ev))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_evaluation(request):
    if request.user.role == 'student':
        return Response({"error": "Students cannot create evaluations"}, status=403)

    # ── resolve student ───────────────────────────────────────────────────────
    student_raw = request.data.get('student')
    student     = _resolve_student_user(student_raw)
    if not student:
        return Response(
            {
                "error": (
                    f"Student not found for value: '{student_raw}'. "
                    f"Provide a user pk or registration number (e.g. CS/2026/003)."
                )
            },
            status=400
        )

    # ── optional weekly_log ───────────────────────────────────────────────────
    log_id  = request.data.get('weekly_log')
    log_obj = None
    if log_id:
        try:
            log_obj = WeeklyLog.objects.get(pk=log_id, student=student)
        except WeeklyLog.DoesNotExist:
            pass  # weekly_log is optional — silently ignore bad id

    # ── scalar fields ─────────────────────────────────────────────────────────
    feedback    = (request.data.get('feedback') or '').strip()
    grade       = (request.data.get('grade')    or '').strip()
    status      = request.data.get('status', 'draft')

    # Accept total_score or score interchangeably
    raw_score   = request.data.get('total_score') or request.data.get('score')
    total_score = None
    if raw_score is not None:
        try:
            total_score = float(raw_score)
        except (ValueError, TypeError):
            total_score = None

    # ── auto-compute grade from score if not provided ─────────────────────────
    if total_score is not None and not grade:
        if   total_score >= 80: grade = 'A'
        elif total_score >= 70: grade = 'B'
        elif total_score >= 60: grade = 'C'
        elif total_score >= 50: grade = 'D'
        else:                   grade = 'F'

    # ── validate status ───────────────────────────────────────────────────────
    allowed_statuses = ['draft', 'submitted', 'approved']
    if status not in allowed_statuses:
        status = 'draft'

    # ── create ────────────────────────────────────────────────────────────────
    try:
        ev = Evaluation(
            student     = student,
            evaluator   = request.user,
            weekly_log  = log_obj,
            feedback    = feedback,
            grade       = grade,
            total_score = total_score,
            status      = status,
        )
        ev.save()
    except Exception as ex:
        return Response({"error": str(ex)}, status=500)

    ev = Evaluation.objects.select_related(
        'student', 'evaluator', 'weekly_log'
    ).get(pk=ev.pk)

    return Response(_serialize_evaluation(ev), status=201)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_evaluation(request, pk):
    if request.user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    try:
        ev = Evaluation.objects.get(pk=pk)
    except Evaluation.DoesNotExist:
        return Response({"error": "Evaluation not found"}, status=404)

    if 'feedback' in request.data:
        ev.feedback = request.data['feedback']

    if 'grade' in request.data:
        ev.grade = request.data['grade']

    if 'status' in request.data:
        if request.data['status'] in ['draft', 'submitted', 'approved']:
            ev.status = request.data['status']

    if 'total_score' in request.data or 'score' in request.data:
        raw = request.data.get('total_score') or request.data.get('score')
        try:
            ev.total_score = float(raw)
        except (ValueError, TypeError):
            pass

    # Auto-compute grade if score changed but grade not explicitly set
    if ev.total_score is not None and not ev.grade:
        if   ev.total_score >= 80: ev.grade = 'A'
        elif ev.total_score >= 70: ev.grade = 'B'
        elif ev.total_score >= 60: ev.grade = 'C'
        elif ev.total_score >= 50: ev.grade = 'D'
        else:                      ev.grade = 'F'

    ev.save()

    ev = Evaluation.objects.select_related(
        'student', 'evaluator', 'weekly_log'
    ).get(pk=ev.pk)
    return Response(_serialize_evaluation(ev))


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def submit_evaluation(request, pk):
    if request.user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    try:
        ev = Evaluation.objects.get(pk=pk)
    except Evaluation.DoesNotExist:
        return Response({"error": "Evaluation not found"}, status=404)

    if ev.status != 'draft':
        return Response(
            {"error": f"Cannot submit — evaluation is already '{ev.status}'"},
            status=400
        )

    ev.status = 'submitted'
    ev.save()
    return Response({"message": "Evaluation submitted", "status": ev.status})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_summary(request):
    try:
        evals = _get_queryset_for_user(request.user)
        return Response({
            "total":     evals.count(),
            "draft":     evals.filter(status='draft').count(),
            "submitted": evals.filter(status='submitted').count(),
            "approved":  evals.filter(status='approved').count(),
        })
    except Exception as ex:
        return Response({'error': str(ex)}, status=500)