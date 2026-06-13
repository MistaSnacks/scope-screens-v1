"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { CheckoutTarget } from "@/lib/wix-checkout";
import { CheckoutModal } from "./checkout-modal";

interface CheckoutContextValue {
  openCheckout: (target: CheckoutTarget) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<CheckoutTarget | null>(null);
  const openCheckout = useCallback((t: CheckoutTarget) => setTarget(t), []);
  const value = useMemo(() => ({ openCheckout }), [openCheckout]);

  return (
    <CheckoutContext.Provider value={value}>
      {children}
      {target ? <CheckoutModal target={target} onClose={() => setTarget(null)} /> : null}
    </CheckoutContext.Provider>
  );
}
