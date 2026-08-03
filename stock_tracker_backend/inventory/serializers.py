from rest_framework import serializers

from inventory.models import Product, Supplier, Transaction


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "contact_person", "phone", "email", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True, default="")
    stock_status = serializers.CharField(read_only=True)
    inventory_value = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "sku", "barcode", "category", "supplier", "supplier_name",
            "buy_price", "sell_price", "quantity", "minimum_stock", "unit",
            "image", "description", "stock_status", "inventory_value",
            "created_at", "updated_at",
        ]
        read_only_fields = ["quantity"]  # quantity only changes via stock-in / stock-out


class TransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True, default="")

    class Meta:
        model = Transaction
        fields = [
            "id", "product", "product_name", "type", "quantity", "balance_after",
            "supplier", "invoice_number", "purchase_cost",
            "issued_to", "reason", "remarks",
            "created_by", "created_by_username", "created_at",
        ]
        read_only_fields = ["balance_after", "created_by"]


class StockInSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all(), required=False, allow_null=True)
    invoice_number = serializers.CharField(required=False, allow_blank=True, default="")
    purchase_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, default="")


class StockOutSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    issued_to = serializers.CharField(required=False, allow_blank=True, default="")
    reason = serializers.CharField(required=False, allow_blank=True, default="")
    remarks = serializers.CharField(required=False, allow_blank=True, default="")
