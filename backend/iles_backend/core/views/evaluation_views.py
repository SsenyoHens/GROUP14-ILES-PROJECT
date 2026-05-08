from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Evaluation


# =========================================================
# EVALUATION SUMMARY
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_summary(request):

    evaluations = Evaluation.objects.filter(
        student=request.user
    )

    return Response({
        "total_evaluations": evaluations.count()
    })