from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.models import InternshipPlacement
from core.serializers import PlacementSerializer
from core.permissions import IsStudent, IsSupervisor, IsAdmin, IsAdminOrSupervisor


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_placements(request):
    user = request.user

    if user.role == 'student':
        # Students only see their own placement
        placements = InternshipPlacement.objects.filter(student=user)

    elif user.role == 'workplace_supervisor':
        # Workplace supervisors see placements at their company
        placements = InternshipPlacement.objects.filter(
            workplace_supervisor__user=user
        )

    elif user.role == 'academic_supervisor':
        # Academic supervisors see placements they supervise
        placements = InternshipPlacement.objects.filter(
            academic_supervisor__user=user
        )

    else:
        # Admin sees all
        placements = InternshipPlacement.objects.all()

    serializer = PlacementSerializer(placements, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def placement_detail(request, pk):
    try:
        placement = InternshipPlacement.objects.get(pk=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    # Students can only view their own
    if request.user.role == 'student' and placement.student != request.user:
        return Response({"error": "Not authorized"}, status=403)

    serializer = PlacementSerializer(placement)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def create_placement(request):
    # Check student doesn't already have a placement
    existing = InternshipPlacement.objects.filter(
        student=request.user.studentprofile
    ).first()
    if existing:
        return Response(
            {"error": "You already have an active placement"},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = PlacementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            student=request.user.studentprofile
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_placement(request, pk):
    try:
        placement = InternshipPlacement.objects.get(pk=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    user = request.user

    # Only admin or assigned supervisors can update
    if user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    serializer = PlacementSerializer(placement, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_placement_status(request, pk):
    try:
        placement = InternshipPlacement.objects.get(pk=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    user = request.user

    # Only admin and supervisors can change status
    if user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    new_status = request.data.get('status')
    allowed_statuses = ['pending', 'active', 'completed', 'rejected']

    if new_status not in allowed_statuses:
        return Response(
            {"error": f"Invalid status. Must be one of: {allowed_statuses}"},
            status=400
        )

    placement.status = new_status
    placement.save()
    return Response({"message": "Status updated", "status": placement.status})