"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export function ProductFormSheet({
  open,
  product,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(() => ({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? "",
    category: product?.category ?? "",
    buy_price: product?.buy_price ?? "",
    sell_price: product?.sell_price ?? "",
    minimum_stock: product?.minimum_stock ?? 0,
    unit: product?.unit ?? "pcs",
    description: product?.description ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (isEdit && product) {
        await api.products.update(product.id, form);
      } else {
        await api.products.create(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this item. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    setSaving(true);
    try {
      await api.products.remove(product.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete this item.");
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit item" : "Add item"}
      footer={
        <>
          {isEdit && (
            <Button variant="danger" onClick={handleDelete} disabled={saving}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {isEdit ? "Update" : "Save item"}
          </Button>
        </>
      }
    >
      {error && <div className="font-body text-xs text-danger">{error}</div>}

      <Field label="Product name" required>
        <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
      </Field>
      <div className="flex gap-2.5">
        <Field label="SKU" required>
          <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} />
        </Field>
        <Field label="Barcode">
          <Input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-2.5">
        <Field label="Category">
          <Input value={form.category} onChange={(e) => update("category", e.target.value)} />
        </Field>
        <Field label="Unit">
          <Input value={form.unit} onChange={(e) => update("unit", e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-2.5">
        <Field label="Buying price">
          <Input
            type="number"
            value={form.buy_price}
            onChange={(e) => update("buy_price", e.target.value)}
          />
        </Field>
        <Field label="Selling price">
          <Input
            type="number"
            value={form.sell_price}
            onChange={(e) => update("sell_price", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Minimum stock level">
        <Input
          type="number"
          value={form.minimum_stock}
          onChange={(e) => update("minimum_stock", Number(e.target.value))}
        />
      </Field>
      <Field label="Description">
        <Textarea rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} />
      </Field>
    </Sheet>
  );
}
