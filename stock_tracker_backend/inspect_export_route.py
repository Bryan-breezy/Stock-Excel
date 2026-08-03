import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.urls import resolve, get_resolver
from django.test import Client

print('patterns:')
for p in get_resolver().url_patterns:
    print(type(p).__name__, getattr(p, 'pattern', None), getattr(p, 'name', None))

match = resolve('/api/reports/export/', urlconf=None)
print('resolved:', match)
print('view_name:', match.view_name)
print('func:', match.func)

c = Client()
r = c.get('/api/reports/export/', {'format':'csv'})
print('status', r.status_code)
print('content-type', r.headers.get('Content-Type'))
print('body', r.content[:500])
