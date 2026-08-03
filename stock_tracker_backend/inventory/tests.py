from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from inventory.models import Product
from inventory.services.stock import receive_stock, issue_stock


class StockServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="bryan", password="testpass123")
        self.product = Product.objects.create(
            name="Basmati Rice 5kg", sku="GRC-1042",
            buy_price=850, sell_price=1100,
            quantity=10, minimum_stock=15,
        )

    def test_receive_stock_increases_quantity_and_logs_transaction(self):
        txn = receive_stock(product_id=self.product.id, quantity=20, user=self.user, invoice_number="INV-001")
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 30)
        self.assertEqual(txn.balance_after, 30)
        self.assertEqual(txn.type, "IN")

    def test_issue_stock_decreases_quantity_and_logs_transaction(self):
        txn = issue_stock(product_id=self.product.id, quantity=4, user=self.user, issued_to="Front counter")
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 6)
        self.assertEqual(txn.balance_after, 6)

    def test_issue_stock_rejects_overdraw(self):
        with self.assertRaises(ValidationError):
            issue_stock(product_id=self.product.id, quantity=999, user=self.user)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 10)  # unchanged


class ExportReportsViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="exporter", password="testpass123")
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_csv_export_returns_download_response(self):
        response = self.client.get("/api/reports/export/?format=csv")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv")
        self.assertIn('filename="inventory_report.csv"', response["Content-Disposition"])
        self.assertIn("ID,SKU", response.content.decode("utf-8"))

    def test_export_accepts_export_format_query_parameter(self):
        response = self.client.get("/api/reports/export/?export_format=csv")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv")

    def test_pdf_and_excel_exports_return_file_responses(self):
        pdf_response = self.client.get("/api/reports/export/?format=pdf")
        excel_response = self.client.get("/api/reports/export/?format=excel")

        self.assertEqual(pdf_response.status_code, 200)
        self.assertEqual(pdf_response["Content-Type"], "application/pdf")
        self.assertIn('filename="inventory_report.pdf"', pdf_response["Content-Disposition"])

        self.assertEqual(excel_response.status_code, 200)
        self.assertEqual(excel_response["Content-Type"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        self.assertIn('filename="inventory_report.xlsx"', excel_response["Content-Disposition"])

