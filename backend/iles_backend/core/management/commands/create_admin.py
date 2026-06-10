from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        email = "admin@example.com"

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password="Admin123!",
                first_name="Admin",
                last_name="User",
                role="admin",
            )
            self.stdout.write("Superuser created")
        else:
            self.stdout.write("Superuser already exists")