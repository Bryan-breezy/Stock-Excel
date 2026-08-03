from django.db import transaction as db_transaction
from rest_framework.exceptions import ValidationError

from inventory.models import Product, Transaction


def receive_stock(*, product_id, quantity, user, supplier=None, invoice_number="", purchase_cost=None, remarks=""):
    """Stock in: locks the product row, adds quantity, and logs the transaction."""
    with db_transaction.atomic():
        product = Product.objects.select_for_update().get(pk=product_id)
        product.quantity = product.quantity + quantity
        product.save(update_fields=["quantity", "updated_at"])

        return Transaction.objects.create(
            product=product,
            type=Transaction.Type.IN,
            quantity=quantity,
            balance_after=product.quantity,
            supplier=supplier or product.supplier,
            invoice_number=invoice_number,
            purchase_cost=purchase_cost,
            remarks=remarks,
            created_by=user,
        )


def issue_stock(*, product_id, quantity, user, issued_to="", reason="", remarks=""):
    """Stock out: locks the product row, subtracts quantity, and logs the transaction.

    Raises ValidationError if there isn't enough stock on hand, rather than
    allowing quantity to go negative.
    """
    with db_transaction.atomic():
        product = Product.objects.select_for_update().get(pk=product_id)
        if quantity > product.quantity:
            raise ValidationError(
                {"quantity": f"Only {product.quantity} {product.unit} of {product.name} left in stock."}
            )
        product.quantity = product.quantity - quantity
        product.save(update_fields=["quantity", "updated_at"])

        return Transaction.objects.create(
            product=product,
            type=Transaction.Type.OUT,
            quantity=quantity,
            balance_after=product.quantity,
            issued_to=issued_to,
            reason=reason,
            remarks=remarks,
            created_by=user,
        )
