import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from core.models import CustomUser

@pytest.mark.django_db
def test_login():
    user = CustomUser.objects.create_user(
        email="test@example.com",
        password="testpass123"
    )

    client = APIClient()
    response = client.post(reverse("login"), {
        "email": "test@example.com",
        "password": "testpass123"
    }, format="json")

    assert response.status_code == 200
    assert "access" in response.data

@pytest.mark.django_db
def test_weekly_log_stats_authenticated():
    user = CustomUser.objects.create_user(
        email="stats@test.com",
        password="testpass123"
    )

    client = APIClient()
    response = client.post(reverse("login"), {
        "email": "stats@test.com",
        "password": "testpass123"
    }, format="json")

    token = response.data["access"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    stats_response = client.get(reverse("weeklylog-stats"))

    assert stats_response.status_code == 200