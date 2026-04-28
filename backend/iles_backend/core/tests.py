import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from core.models import CustomUser


@pytest.mark.django_db
def test_register_user():
    client = APIClient()

    response = client.post(reverse("register"), {
        "email": "newuser@test.com",
        "password": "testpass123",
        "first_name": "New",
        "last_name": "User",
        "role": "student"
    }, format="json")

    assert response.status_code in [200, 201]


@pytest.mark.django_db
def test_login_user():
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
def test_login_invalid_credentials():
    client = APIClient()

    response = client.post(reverse("login"), {
        "email": "wrong@test.com",
        "password": "wrongpass"
    }, format="json")

    assert response.status_code in [400, 401]
