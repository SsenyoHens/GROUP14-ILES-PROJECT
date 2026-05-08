from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.models import InternshipPlacement
from core.serializers import PlacementSerializer
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import InternshipPlacement
from core.serializers import PlacementSerializer

#View placement API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_placements(request):

    placements = InternshipPlacement.objects.all()

    serializer = PlacementSerializer(
        placements,
        many=True
    )

    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_placement(request):

    serializer = PlacementSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

#Update Placement API
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_placement(request, pk):

    try:
        placement = InternshipPlacement.objects.get(pk=pk)

    except InternshipPlacement.DoesNotExist:

        return Response(
            {"error": "Placement not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = PlacementSerializer(
        placement,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )