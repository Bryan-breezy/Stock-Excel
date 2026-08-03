from django.urls import path, include
from rest_framework.routers import DefaultRouter

from inventory.views import (
    ProductViewSet, SupplierViewSet, TransactionViewSet,
    DashboardView, ReportsView, ExportReportsView,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
router.register("suppliers", SupplierViewSet, basename="supplier")
router.register("transactions", TransactionViewSet, basename="transaction")

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("reports/export/", ExportReportsView.as_view(), name="reports-export"),
    path("reports/", ReportsView.as_view(), name="reports"),
    path("", include(router.urls)),
]


