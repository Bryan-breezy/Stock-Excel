import { create } from "zustand";
import type { Product } from "@/lib/types";

export type SheetKind = "product" | "stock-in" | "stock-out" | null;

interface UIState {
  sheet: SheetKind;
  activeProduct: Product | null;
  openSheet: (kind: SheetKind, product?: Product | null) => void;
  closeSheet: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sheet: null,
  activeProduct: null,
  openSheet: (kind, product = null) => set({ sheet: kind, activeProduct: product }),
  closeSheet: () => set({ sheet: null, activeProduct: null }),
}));
