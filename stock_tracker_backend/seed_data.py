import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Profile, Supplier, Product, Transaction

User = get_user_model()

# 1. Create superuser/admin user
admin_user, created = User.objects.get_or_create(
    username="admin",
    defaults={
        "email": "admin@stocktracker.local",
        "is_staff": True,
        "is_superuser": True
    }
)
if created:
    admin_user.set_password("adminpassword123")
    admin_user.save()
    print("Created superuser: admin / adminpassword123")

# Ensure profile role is admin
profile, _ = Profile.objects.get_or_create(user=admin_user)
profile.role = Profile.Role.ADMIN
profile.save()

# 2. Sample Suppliers
s1, _ = Supplier.objects.get_or_create(name="TechDistro Ltd", contact_person="Alice Smith", phone="+1 555-0192", email="alice@techdistro.com")
s2, _ = Supplier.objects.get_or_create(name="Global Supplies Co", contact_person="Bob Johnson", phone="+1 555-0143", email="bob@globalsupplies.com")

# 3. Sample Products & Transactions
products_data = [
    {"name": "Wireless Ergonomic Mouse", "sku": "TECH-MSE-001", "category": "Electronics", "buy_price": 15.00, "sell_price": 29.99, "quantity": 45, "minimum_stock": 10, "supplier": s1},
    {"name": "Mechanical Keyboard RGB", "sku": "TECH-KBD-002", "category": "Electronics", "buy_price": 45.00, "sell_price": 89.99, "quantity": 12, "minimum_stock": 15, "supplier": s1}, # Low stock
    {"name": "USB-C Hub Multiport", "sku": "TECH-HUB-003", "category": "Accessories", "buy_price": 12.50, "sell_price": 24.99, "quantity": 0, "minimum_stock": 5, "supplier": s2}, # Out of stock
    {"name": "Noise Cancelling Headphones", "sku": "AUDIO-HDP-004", "category": "Audio", "buy_price": 70.00, "sell_price": 149.99, "quantity": 28, "minimum_stock": 8, "supplier": s2},
    {"name": "27-inch 4K Monitor", "sku": "DISP-MON-005", "category": "Electronics", "buy_price": 180.00, "sell_price": 329.99, "quantity": 8, "minimum_stock": 5, "supplier": s1},
]

for p_data in products_data:
    initial_qty = p_data.pop("quantity")
    prod, p_created = Product.objects.get_or_create(sku=p_data["sku"], defaults={**p_data, "quantity": initial_qty})
    if p_created and initial_qty > 0:
        Transaction.objects.create(
            product=prod,
            type=Transaction.Type.IN,
            quantity=initial_qty,
            balance_after=initial_qty,
            supplier=prod.supplier,
            remarks="Initial stock setup",
            created_by=admin_user
        )

print("Seeding completed successfully!")
