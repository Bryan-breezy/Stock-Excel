"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export function StockMoveSheet({
  open,
  direction,
  product,
  onClose,
  onSaved,
}: {
  open: boolean;
  direction: "in" | "out";
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isIn = direction === "in";
  const [quantity, setQuantity] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setQuantity("");
    setInvoiceNumber("");
    setPurchaseCost("");
    setIssuedTo("");
    setReason("");
    setRemarks("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!product) return;
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isIn) {
        await api.products.stockIn(product.id, {
          quantity: qty,
          invoice_number: invoiceNumber,
          purchase_cost: purchaseCost ? Number(purchaseCost) : null,
          remarks,
        });
      } else {
        await api.products.stockOut(product.id, {
          quantity: qty,
          issued_to: issuedTo,
          reason,
          remarks,
        });
      }
      onSaved();
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't record this movement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={handleClose}
      title={isIn ? "Stock in" : "Stock out"}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {isIn ? "Receive stock" : "Issue stock"}
          </Button>
        </>
      }
    >
      {error && <div className="font-body text-xs text-danger">{error}</div>}

      <Field label="Product">
        <div className="font-body text-sm font-semibold text-ink py-2">{product?.name}</div>
      </Field>
      <Field label={isIn ? "Quantity received" : "Quantity"} required>
        <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} autoFocus />
      </Field>

      {isIn ? (
        <div className="flex gap-2.5">
          <Field label="Invoice number">
            <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </Field>
          <Field label="Purchase cost">
            <Input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} />
          </Field>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <Field label="Issued to">
            <Input value={issuedTo} onChange={(e) => setIssuedTo(e.target.value)} />
          </Field>
          <Field label="Reason">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      )}

      <Field label="Remarks">
        <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </Field>

      {!isIn && product && (
        <div className="font-mono text-[11px] text-sub">
          {product.quantity} {product.unit} currently in stock
        </div>
      )}
    </Sheet>
  );
}
