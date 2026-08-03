from django.contrib import admin

from inventory.models import Product, Supplier, Transaction, Profile


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "sku", "category", "quantity", "minimum_stock", "sell_price", "supplier"]
    list_filter = ["category", "supplier"]
    search_fields = ["name", "sku", "barcode"]


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ["name", "contact_person", "phone", "email"]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["created_at", "product", "type", "quantity", "balance_after", "created_by"]
    list_filter = ["type"]
    date_hierarchy = "created_at"


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "role"]
