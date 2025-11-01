"use client";

import React, { useEffect, useState } from "react";
import { MERCH } from "../shop/data";

type CartItem = { id: string; qty: number };

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cart_items");
        return raw ? JSON.parse(raw) : [];
      }
    } catch {
      return [];
    }
    return [];
  });

  const [points, setPoints] = useState<number>(() => {
    try {
      if (typeof window !== "undefined") {
        const p = localStorage.getItem("user_points");
        if (p) return Number(p);
        localStorage.setItem("user_points", String(5000));
        return 5000;
      }
    } catch {
      return 0;
    }
    return 0;
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("cart_updated"));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const findMerch = (id: string) => MERCH.find((m) => m.id === id);

  const refundItem = (id: string) => {
    const item = findMerch(id);
    if (!item) return;
    setCart((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((c) => c.id === id);
      if (idx >= 0) {
        const qty = copy[idx].qty;
        copy.splice(idx, 1);
        const refund = item.price * qty;
        const newPoints = points + refund;
        setPoints(newPoints);
        try {
          localStorage.setItem("user_points", String(newPoints));
          window.dispatchEvent(new CustomEvent("points_updated"));
        } catch {}
      }
      return copy;
    });
  };

  const clearCart = () => {
    // refund all items
    const totalRefund = cart.reduce((s, it) => {
      const m = findMerch(it.id);
      return s + (m ? m.price * it.qty : 0);
    }, 0);
    const newPoints = points + totalRefund;
    setPoints(newPoints);
    try {
      localStorage.setItem("user_points", String(newPoints));
      window.dispatchEvent(new CustomEvent("points_updated"));
    } catch {}
    setCart([]);
  };

  const confirmPurchase = () => {
    // Items already deducted from points on add; confirming finalizes and clears the cart
    setCart([]);
    try {
      localStorage.setItem("cart_items", JSON.stringify([]));
      window.dispatchEvent(new CustomEvent("cart_updated"));
    } catch {}
    window.alert("Purchase confirmed — your items will be processed!");
  };

  const items = cart.map((it) => {
    const m = findMerch(it.id);
    return { ...m, qty: it.qty } as any;
  });

  const totalPrice = items.reduce((s, it) => s + (it?.price || 0) * (it?.qty || 0), 0);

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm">Your points: <strong>{points}</strong></div>
        <div className="text-sm">Items: <strong>{cart.reduce((s,i)=>s+(i.qty||0),0)}</strong></div>
      </div>

      {items.length === 0 ? (
        <div className="alert">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {items.map((it: any) => (
            <div key={it.id} className="card bg-base-100 shadow">
              <div className="card-body flex items-center gap-4">
                <img src={it.img} alt={it.title} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-semibold">{it.title}</h3>
                  <p className="text-sm opacity-80">{it.desc}</p>
                  <div className="text-sm mt-2">Price: <strong>{it.price} pts</strong> × {it.qty}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => refundItem(it.id)}>Remove (refund)</button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <div className="text-lg">Total points reserved: <strong>{totalPrice}</strong></div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline" onClick={clearCart}>Clear cart (refund all)</button>
              <button className="btn btn-primary" onClick={confirmPurchase}>Confirm Purchase</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
