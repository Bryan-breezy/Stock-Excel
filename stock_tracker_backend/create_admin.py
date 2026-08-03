import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Profile

User = get_user_model()
user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@stocktracker.local',
        'is_staff': True,
        'is_superuser': True,
    },
)
user.set_password('adminpassword123')
user.save()
profile, _ = Profile.objects.get_or_create(user=user)
profile.role = Profile.Role.ADMIN
profile.save()
print('created' if created else 'updated', user.username)
