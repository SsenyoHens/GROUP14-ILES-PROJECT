from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import (
    InternshipPlacement,
    StudentProfile,
    AcademicSupervisorProfile,
    WorkplaceSupervisorProfile,
    CustomUser,
)


# ─── helpers ──────────────────────────────────────────────────────────────────

def _serialize_placement(p):
    """Serialize a placement with all related names included."""
    student_user = p.student.user if p.student else None
    acad         = p.academic_supervisor
    work         = p.workplace_supervisor

    return {
        "id":           p.id,
        "student":      p.student.id if p.student else None,
        "student_name": (
            f"{student_user.first_name} {student_user.last_name}".strip()
            or student_user.email
        ) if student_user else f"Student #{p.student_id}",
        "student_email": student_user.email if student_user else None,
        "company_name":  p.company_name,
        "position":      p.position,
        "status":        p.status,
        "start_date":    str(p.start_date) if p.start_date else None,
        "end_date":      str(p.end_date)   if p.end_date   else None,
        "academic_supervisor": {
            "id":    acad.id,
            "name":  f"{acad.user.first_name} {acad.user.last_name}".strip() or acad.user.email,
            "email": acad.user.email,
        } if acad else None,
        "workplace_supervisor": {
            "id":    work.id,
            "name":  f"{work.user.first_name} {work.user.last_name}".strip() or work.user.email,
            "email": work.user.email,
        } if work else None,
    }


def _resolve_student(student_id):
    """
    Accept student as either StudentProfile pk or CustomUser pk.
    Returns StudentProfile or None.
    """
    if not student_id:
        return None

    # Try StudentProfile pk first
    profile = StudentProfile.objects.filter(pk=student_id).first()
    if profile:
        return profile

    # Fall back to user pk
    user_obj = CustomUser.objects.filter(pk=student_id, role='student').first()
    if user_obj:
        return StudentProfile.objects.filter(user=user_obj).first()

    return None


def _resolve_academic(supervisor_id):
    """
    Accept academic supervisor as AcademicSupervisorProfile pk or user pk.
    Returns AcademicSupervisorProfile or None.
    """
    if not supervisor_id:
        return None

    profile = AcademicSupervisorProfile.objects.filter(pk=supervisor_id).first()
    if profile:
        return profile

    user_obj = CustomUser.objects.filter(pk=supervisor_id).first()
    if user_obj:
        return AcademicSupervisorProfile.objects.filter(user=user_obj).first()

    return None


def _resolve_workplace(supervisor_id):
    """
    Accept workplace supervisor as WorkplaceSupervisorProfile pk or user pk.
    Returns WorkplaceSupervisorProfile or None.
    """
    if not supervisor_id:
        return None

    profile = WorkplaceSupervisorProfile.objects.filter(pk=supervisor_id).first()
    if profile:
        return profile

    user_obj = CustomUser.objects.filter(pk=supervisor_id).first()
    if user_obj:
        return WorkplaceSupervisorProfile.objects.filter(user=user_obj).first()

    return None


# ─── views ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_placements(request):
    user = request.user
    try:
        if user.role == 'student':
            profile    = StudentProfile.objects.filter(user=user).first()
            placements = (
                InternshipPlacement.objects.filter(student=profile)
                if profile else InternshipPlacement.objects.none()
            )

        elif user.role == 'workplace_supervisor':
            placements = InternshipPlacement.objects.filter(
                workplace_supervisor__user=user
            )

        elif user.role == 'academic_supervisor':
            placements = InternshipPlacement.objects.filter(
                academic_supervisor__user=user
            )

        else:
            # admin — see everything
            placements = InternshipPlacement.objects.all()

        placements = placements.select_related(
            'student__user',
            'academic_supervisor__user',
            'workplace_supervisor__user',
        )

        return Response([_serialize_placement(p) for p in placements])

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def placement_detail(request, pk):
    try:
        p = InternshipPlacement.objects.select_related(
            'student__user',
            'academic_supervisor__user',
            'workplace_supervisor__user',
        ).get(pk=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    # Students can only view their own placement
    if request.user.role == 'student':
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile or p.student != profile:
            return Response({"error": "Not authorized"}, status=403)

    return Response(_serialize_placement(p))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_placement(request):
    # Only admin (Internship Administrator) creates placements
    if request.user.role != 'admin':
        return Response(
            {"error": "Only administrators can create placements"},
            status=403
        )

    student_id   = request.data.get('student')
    academic_id  = request.data.get('academic_supervisor')
    workplace_id = request.data.get('workplace_supervisor')

    # ── resolve student ──────────────────────────────────────────────────────
    student = _resolve_student(student_id)
    if not student:
        return Response({"error": "Student not found"}, status=404)

    if InternshipPlacement.objects.filter(student=student).exists():
        return Response(
            {"error": "This student already has a placement"},
            status=400
        )

    # ── resolve supervisors (optional) ───────────────────────────────────────
    acad = _resolve_academic(academic_id)
    work = _resolve_workplace(workplace_id)

    if academic_id and not acad:
        return Response({"error": "Academic supervisor not found"}, status=404)

    if workplace_id and not work:
        return Response({"error": "Workplace supervisor not found"}, status=404)

    # ── create ───────────────────────────────────────────────────────────────
    p = InternshipPlacement.objects.create(
        student              = student,
        academic_supervisor  = acad,
        workplace_supervisor = work,
        company_name         = request.data.get('company_name', '').strip(),
        position             = request.data.get('position', '').strip(),
        start_date           = request.data.get('start_date') or None,
        end_date             = request.data.get('end_date')   or None,
        status               = request.data.get('status', 'pending'),
    )

    # Re-fetch with related data so the serializer has everything
    p.refresh_from_db()
    p = InternshipPlacement.objects.select_related(
        'student__user',
        'academic_supervisor__user',
        'workplace_supervisor__user',
    ).get(pk=p.pk)

    return Response(_serialize_placement(p), status=201)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_placement(request, pk):
    if request.user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    try:
        p = InternshipPlacement.objects.get(pk=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    # Simple scalar fields
    scalar_fields = ['company_name', 'position', 'start_date', 'end_date', 'status']
    for field in scalar_fields:
        if field in request.data:
            value = request.data[field]
            setattr(p, field, value if value not in ('', None) or field == 'status' else None)

    # Supervisor FKs (resolve same as create)
    if 'academic_supervisor' in request.data:
        acad = _resolve_academic(request.data['academic_supervisor'])
        if request.data['academic_supervisor'] and not acad:
            return Response({"error": "Academic supervisor not found"}, status=404)
        p.academic_supervisor = acad

    if 'workplace_supervisor' in request.data:
        work = _resolve_workplace(request.data['workplace_supervisor'])
        if request.data['workplace_supervisor'] and not work:
            return Response({"error": "Workplace supervisor not found"}, status=404)
        p.workplace_supervisor = work

    p.save()

    p = InternshipPlacement.objects.select_related(
        'student__user',
        'academic_supervisor__user',
        'workplace_supervisor__user',
    ).get(pk=p.pk)

    return Response(_serialize_placement(p))


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_placement_status(request, pk):
    if request.user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    try:
        p = InternshipPlacement.objects.get(pk=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    allowed    = ['pending', 'active', 'completed', 'rejected']
    new_status = request.data.get('status')

    if new_status not in allowed:
        return Response(
            {"error": f"Status must be one of: {', '.join(allowed)}"},
            status=400
        )

    p.status = new_status
    p.save()

    return Response({"message": "Status updated", "status": p.status})