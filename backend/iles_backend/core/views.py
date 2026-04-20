#from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer
from rest_framework.permissions import IsAuthenticated

# CREATE placement
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_placement(request):
    serializer = InternshipPlacementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# VIEW placements
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_placements(request):
    placements = InternshipPlacement.objects.all()
    serializer = InternshipPlacementSerializer(placements, many=True)
    return Response(serializer.data)


# UPDATE placement
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_placement(request, pk):
    try:
        placement = InternshipPlacement.objects.get(id=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    serializer = InternshipPlacementSerializer(placement, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)