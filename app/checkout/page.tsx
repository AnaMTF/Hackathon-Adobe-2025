"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
// rewards will be fetched from the API so we can reflect DB-backed items & stock

type CartItem = { id: string; qty: number };

export default function CheckoutPage() {
  const { user, refreshUser } = useAuth();
  
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

  const refundItem = async (id: string) => {
    console.log('[refundItem] Starting refund for item:', id);
    
    if (!user) {
      window.alert("You must be logged in to refund items.");
      return;
    }

    const item = findReward(id);
    console.log('[refundItem] Found reward item:', item);
    
    if (!item) {
      console.error('[refundItem] Item not found in rewards list');
      window.alert("Item not found. Please refresh the page and try again.");
      return;
    }

    const cartItem = cart.find((c) => c.id === id);
    console.log('[refundItem] Found cart item:', cartItem);
    
    if (!cartItem) {
      console.error('[refundItem] Item not found in cart');
      return;
    }

    try {
      // Calculate refund
      const refund = item.price * cartItem.qty;
      console.log('[refundItem] Refund amount:', refund, 'Current points:', user.points, 'New points:', user.points + refund);

      // Update points in database
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies for authentication
        body: JSON.stringify({
          points: user.points + refund
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update points:', errorData);
        throw new Error(errorData.message || 'Failed to update points');
      }

      console.log('[refundItem] Points updated successfully');

      // Remove from cart
      setCart((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((c) => c.id === id);
        if (idx >= 0) {
          copy.splice(idx, 1);
        }
        return copy;
      });

      console.log('[refundItem] Item removed from cart');

      // Refresh user data
      await refreshUser();
      
      console.log('[refundItem] User data refreshed');
      window.alert(`Item refunded! ${refund} points returned to your account.`);

    } catch (error) {
      console.error('Error refunding item:', error);
      window.alert('Failed to refund item. Please try again.');
    }
  };

  const clearCart = async () => {
    if (!user) {
      window.alert("You must be logged in to clear the cart.");
      return;
    }

    try {
      // Calculate total refund
      const totalRefund = cart.reduce((s, it) => {
        const m = findReward(it.id);
        return s + (m ? m.price * it.qty : 0);
      }, 0);

      // Update points in database
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies for authentication
        body: JSON.stringify({
          points: user.points + totalRefund
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update points:', errorData);
        throw new Error(errorData.message || 'Failed to update points');
      }

      // Clear cart
      setCart([]);

      // Refresh user data
      await refreshUser();

    } catch (error) {
      console.error('Error clearing cart:', error);
      window.alert('Failed to clear cart. Please try again.');
    }
  };

  const confirmPurchase = () => {
    if (!user) {
      window.alert("You must be logged in to complete the purchase.");
      return;
    }

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

        window.alert('🎉 Purchase confirmed! Your items will be shipped soon. Thank you for your order!');
        
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
    return { ...m, cartId: it.id, qty: it.qty } as any;
  });

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm">Items: <strong>{cart.reduce((s,i)=>s+(i.qty||0),0)}</strong></div>
      </div>

      {items.length === 0 ? (
        <div className="alert">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {items.map((it: any) => (
            <div key={it.cartId || it.id} className="card bg-base-100 shadow">
              <div className="card-body flex items-center gap-4">
                <img src={it.img} alt={it.title} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-semibold">{it.title}</h3>
                      <p className="text-sm opacity-80">{it.description}</p>
                      <div className="text-sm mt-2">Price: <strong>{it.price} pts</strong> × {it.qty}</div>
                      <div className="text-sm mt-1">Stock: <strong>{it.stock ?? 0}</strong></div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => refundItem(it.cartId || it.id)}>Remove (refund)</button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-2 mt-6">
            <button className="btn btn-outline" onClick={clearCart}>Clear cart (refund all)</button>
            <button className="btn btn-primary" onClick={confirmPurchase}>Confirm Purchase</button>
          </div>
        </div>
      )}
    </main>
  );
}
