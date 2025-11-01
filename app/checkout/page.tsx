"use client";

import React, { useEffect, useState } from "react";
// rewards will be fetched from the API so we can reflect DB-backed items & stock

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

  const [rewards, setRewards] = useState<any[]>([]);

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/rewards');
        if (!res.ok) throw new Error('Failed to fetch rewards');
        const data = await res.json();
        if (data.success && data.data && data.data.rewards) {
          if (!mounted) return;
          setRewards(data.data.rewards);
        }
      } catch (err) {
        console.error('Failed to load rewards', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const findReward = (id: string) => {
    return rewards.find((r) => r.id === id || r.slug === id);
  };

  const refundItem = (id: string) => {
  const item = findReward(id);
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
      const m = findReward(it.id);
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
    // Call the checkout API to decrement stock server-side
    (async () => {
      try {
        const res = await fetch('/api/rewards/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          window.alert('Checkout failed: ' + (data?.message || 'Unknown error'));
          return;
        }

        // On success, clear cart (points were already deducted when items were added)
        setCart([]);
        try {
          localStorage.setItem('cart_items', JSON.stringify([]));
          window.dispatchEvent(new CustomEvent('cart_updated'));
        } catch {}

        window.alert('Purchase confirmed — your items will be processed!');
        // refresh local rewards to reflect new stock
        const refreshed = await fetch('/api/rewards');
        if (refreshed.ok) {
          const d = await refreshed.json();
          if (d.success && d.data && d.data.rewards) setRewards(d.data.rewards);
        }
      } catch (err) {
        console.error('Checkout error', err);
        window.alert('Checkout failed — see console for details.');
      }
    })();
  };

  const items = cart.map((it) => {
    const m = findReward(it.id);
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
                      <p className="text-sm opacity-80">{it.description}</p>
                      <div className="text-sm mt-2">Price: <strong>{it.price} pts</strong> × {it.qty}</div>
                      <div className="text-sm mt-1">Stock: <strong>{it.stock ?? 0}</strong></div>
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
