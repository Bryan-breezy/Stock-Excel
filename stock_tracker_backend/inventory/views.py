from datetime import timedelta

from django.db.models import Sum, Count, F, DecimalField, ExpressionWrapper
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import Product, Supplier, Transaction
from inventory.permissions import IsManagerOrAdmin, IsAdmin
from inventory.serializers import (
    ProductSerializer, SupplierSerializer, TransactionSerializer,
    StockInSerializer, StockOutSerializer,
)
from inventory.services.stock import receive_stock, issue_stock


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsManagerOrAdmin]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("supplier").all()
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "supplier"]
    search_fields = ["name", "sku", "barcode"]
    ordering_fields = ["name", "quantity", "updated_at", "sell_price"]

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        stock_filter = self.request.query_params.get("stock_status")
        if stock_filter == "low":
            qs = qs.filter(quantity__gt=0, quantity__lt=F("minimum_stock"))
        elif stock_filter == "out":
            qs = qs.filter(quantity=0)
        return qs

    @action(detail=True, methods=["post"], url_path="stock-in")
    def stock_in(self, request, pk=None):
        product = self.get_object()
        serializer = StockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        txn = receive_stock(
            product_id=product.id,
            user=request.user,
            **serializer.validated_data,
        )
        return Response(TransactionSerializer(txn).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="stock-out")
    def stock_out(self, request, pk=None):
        product = self.get_object()
        serializer = StockOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        txn = issue_stock(
            product_id=product.id,
            user=request.user,
            **serializer.validated_data,
        )
        return Response(TransactionSerializer(txn).data, status=status.HTTP_201_CREATED)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """Transactions are only ever created through Product.stock_in / stock_out,
    so this viewset is read-only — it's the "Transaction History" screen's data source.
    """

    queryset = Transaction.objects.select_related("product", "created_by").all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["product", "type"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        period = self.request.query_params.get("period")
        now = timezone.now()
        if period == "today":
            qs = qs.filter(created_at__date=now.date())
        elif period == "week":
            qs = qs.filter(created_at__gte=now - timedelta(days=7))
        elif period == "month":
            qs = qs.filter(created_at__gte=now - timedelta(days=30))
        return qs


class DashboardView(APIView):
    """Powers the Dashboard screen's summary cards."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.all()
        total_products = products.count()
        out_of_stock = products.filter(quantity=0).count()
        low_stock = products.filter(quantity__gt=0, quantity__lt=F("minimum_stock")).count()
        in_stock = total_products - out_of_stock - low_stock

        inventory_value = products.aggregate(
            value=Sum(
                ExpressionWrapper(F("quantity") * F("sell_price"), output_field=DecimalField(max_digits=14, decimal_places=2))
            )
        )["value"] or 0

        today_sales = Transaction.objects.filter(
            type=Transaction.Type.OUT, created_at__date=timezone.now().date()
        ).aggregate(
            value=Sum(
                ExpressionWrapper(F("quantity") * F("product__sell_price"), output_field=DecimalField(max_digits=14, decimal_places=2))
            )
        )["value"] or 0

        return Response({
            "total_products": total_products,
            "in_stock": in_stock,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "inventory_value": inventory_value,
            "today_sales": today_sales,
        })


class ReportsView(APIView):
    """Powers the Reports screen's summary section."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.all()

        fast_moving = (
            Transaction.objects.filter(type=Transaction.Type.OUT)
            .values("product__name")
            .annotate(total_out=Sum("quantity"))
            .order_by("-total_out")[:5]
        )
        slow_moving = (
            Transaction.objects.filter(type=Transaction.Type.OUT)
            .values("product__name")
            .annotate(total_out=Sum("quantity"))
            .order_by("total_out")[:5]
        )

        return Response({
            "current_inventory_units": products.aggregate(total=Sum("quantity"))["total"] or 0,
            "inventory_value": products.aggregate(
                value=Sum(ExpressionWrapper(F("quantity") * F("sell_price"), output_field=DecimalField(max_digits=14, decimal_places=2)))
            )["value"] or 0,
            "low_stock_count": products.filter(quantity__gt=0, quantity__lt=F("minimum_stock")).count(),
            "out_of_stock_count": products.filter(quantity=0).count(),
            "fast_moving": list(fast_moving),
            "slow_moving": list(slow_moving),
        })


import csv
import io
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from inventory.services.excel_sync import _get_or_create_workbook, _workbook_path


class ExportReportsView(APIView):
    """Exports inventory data in Excel, CSV, or PDF formats."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        export_format = (
            request.query_params.get("export_format")
            or request.query_params.get("format", "excel")
        ).lower()

        if export_format == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = 'attachment; filename="inventory_report.csv"'
            writer = csv.writer(response)
            writer.writerow(["ID", "SKU", "Product Name", "Category", "Quantity", "Buy Price", "Sell Price", "Min Stock", "Stock Status", "Supplier"])
            for p in Product.objects.select_related("supplier").all():
                writer.writerow([
                    p.id, p.sku, p.name, p.category, p.quantity,
                    float(p.buy_price), float(p.sell_price), p.minimum_stock, p.stock_status,
                    p.supplier.name if p.supplier else ""
                ])
            return response

        elif export_format == "pdf":
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            elements = []
            styles = getSampleStyleSheet()

            title_style = ParagraphStyle(
                'ReportTitle',
                parent=styles['Heading1'],
                fontSize=18,
                leading=22,
                textColor=colors.HexColor("#0F172A"),
                spaceAfter=8
            )
            elements.append(Paragraph("Stock & Inventory Summary Report", title_style))
            elements.append(Paragraph(f"Generated on: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
            elements.append(Spacer(1, 14))

            products = Product.objects.all()
            total_qty = products.aggregate(total=Sum("quantity"))["total"] or 0
            total_val = products.aggregate(
                val=Sum(ExpressionWrapper(F("quantity") * F("sell_price"), output_field=DecimalField(max_digits=14, decimal_places=2)))
            )["val"] or 0
            low_cnt = products.filter(quantity__gt=0, quantity__lt=F("minimum_stock")).count()
            out_cnt = products.filter(quantity=0).count()

            summary_data = [
                ["Total Units", "Inventory Value", "Low Stock Items", "Out of Stock Items"],
                [str(total_qty), f"KES {total_val:,.2f}", str(low_cnt), str(out_cnt)]
            ]
            t_summary = Table(summary_data, colWidths=[120, 150, 130, 130])
            t_summary.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]))
            elements.append(t_summary)
            elements.append(Spacer(1, 16))

            elements.append(Paragraph("Product Inventory List", styles['Heading2']))
            elements.append(Spacer(1, 8))

            table_data = [["SKU", "Name", "Category", "Qty", "Sell Price", "Status"]]
            for p in products.select_related("supplier"):
                table_data.append([
                    p.sku,
                    p.name[:25],
                    p.category,
                    str(p.quantity),
                    f"KES {p.sell_price:,.2f}",
                    p.stock_status.replace("_", " ").title()
                ])

            t_products = Table(table_data, colWidths=[90, 170, 90, 45, 75, 70])
            t_products.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (3, 0), (4, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]))
            elements.append(t_products)

            doc.build(elements)
            buffer.seek(0)
            return HttpResponse(buffer.getvalue(), content_type="application/pdf", headers={'Content-Disposition': 'attachment; filename="inventory_report.pdf"'})

        else:
            # Excel format — write to an in-memory buffer to avoid Windows file-lock issues
            wb = _get_or_create_workbook()
            excel_buffer = io.BytesIO()
            wb.save(excel_buffer)
            excel_buffer.seek(0)
            response = HttpResponse(
                excel_buffer.getvalue(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response['Content-Disposition'] = 'attachment; filename="inventory_report.xlsx"'
            return response

