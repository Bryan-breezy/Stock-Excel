from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from inventory.models import Product, Supplier, Transaction, Profile
from inventory.services import excel_sync


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile_for_new_user(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=Product)
def sync_product_on_save(sender, instance, **kwargs):
    excel_sync.upsert_product_row(instance)


@receiver(post_delete, sender=Product)
def sync_product_on_delete(sender, instance, **kwargs):
    excel_sync.remove_product_row(instance.id)


@receiver(post_save, sender=Transaction)
def sync_transaction_on_save(sender, instance, created, **kwargs):
    if created:
        excel_sync.append_transaction_row(instance)


@receiver(post_save, sender=Supplier)
def sync_supplier_on_save(sender, instance, **kwargs):
    excel_sync.upsert_supplier_row(instance)
