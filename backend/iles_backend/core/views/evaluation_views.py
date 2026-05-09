from django.db.models import Count, Avg
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.models import Evaluation
from core.permissions import IsAdmin, IsSupervisor


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_list(request):
    user = request.user

    if user.role == 'student':
        evals = Evaluation.objects.filter(student=user)

    elif user.role == 'academic_supervisor':
        evals = Evaluation.objects.filter(
            student__internshipplacement__academic_supervisor__user=user
        )

    elif user.role == 'workplace_supervisor':
        evals = Evaluation.objects.filter(
            student__internshipplacement__workplace_supervisor__user=user
        )

    else:
        # Admin sees all
        evals = Evaluation.objects.all()

    from core.serializers import EvaluationSerializer
    serializer = EvaluationSerializer(evals, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_detail(request, pk):
    try:
        ev = Evaluation.objects.get(pk=pk)
    except Evaluation.DoesNotExist:
        return Response({"error": "Evaluation not found"}, status=404)

    if request.user.role == 'student' and ev.student != request.user:
        return Response({"error": "Not authorized"}, status=403)

    from core.serializers import EvaluationSerializer
    return Response(EvaluationSerializer(ev).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_evaluation(request):
    # Only supervisors and admin can create evaluations
    if request.user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    from core.serializers import EvaluationSerializer
    serializer = EvaluationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(evaluator=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_evaluation(request, pk):
    try:
        ev = Evaluation.objects.get(pk=pk)
    except Evaluation.DoesNotExist:
        return Response({"error": "Evaluation not found"}, status=404)

    if request.user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    from core.serializers import EvaluationSerializer
    serializer = EvaluationSerializer(ev, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def submit_evaluation(request, pk):
    try:
        ev = Evaluation.objects.get(pk=pk)
    except Evaluation.DoesNotExist:
        return Response({"error": "Evaluation not found"}, status=404)

    if request.user.role == 'student':
        return Response({"error": "Not authorized"}, status=403)

    ev.status = 'submitted'
    ev.save()
    return Response({"message": "Evaluation submitted", "status": ev.status})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_summary(request):
    user = request.user

    if user.role == 'student':
        evals = Evaluation.objects.filter(student=user)
    elif user.role == 'academic_supervisor':
        evals = Evaluation.objects.filter(
            student__internshipplacement__academic_supervisor__user=user
        )
    elif user.role == 'workplace_supervisor':
        evals = Evaluation.objects.filter(
            student__internshipplacement__workplace_supervisor__user=user
        )
    else:
        evals = Evaluation.objects.all()

    stats = evals.aggregate(
        total_evaluations=Count('id'),
    )

    return Response({
        **stats,
        "submitted": evals.filter(status='submitted').count(),
        "pending":   evals.filter(status='pending').count(),
    })