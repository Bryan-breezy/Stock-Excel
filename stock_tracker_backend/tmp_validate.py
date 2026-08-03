import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.conf import settings
settings.ALLOWED_HOSTS = ['*']
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

user, _ = User.objects.get_or_create(username='tmp-export-6')
user.set_password('pw')
user.save()
token, _ = Token.objects.get_or_create(user=user)
client = APIClient()
client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
for fmt in ['csv', 'pdf', 'excel']:
    r = client.get(f'/api/reports/export/?format={fmt}', follow=True)
    print(fmt, r.status_code, r.get('Content-Type'), len(r.content))
