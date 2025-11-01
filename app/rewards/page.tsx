"use client";

import React, { useEffect, useState } from "react";

type CartItem = { id: string; qty: number };

type RewardItem = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  price: number;
  img?: string | null;
  stock?: number;
};

export default function RewardsPage() {
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

  const [items, setItems] = useState<RewardItem[]>([]);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchRewards = async () => {
      try {
        const res = await fetch('/api/rewards');
        if (!res.ok) throw new Error('Failed to fetch rewards');
        const data = await res.json();
        if (data.success && data.data && data.data.rewards) {
          if (mounted) setItems(data.data.rewards.map((r: any) => ({
            id: r.id,
            slug: r.slug ?? null,
            title: r.title,
            description: r.description,
            price: r.price,
            img: r.img,
            stock: r.stock ?? 0,
          })));
        }
      } catch (err) {
        console.error('Error loading rewards', err);
      }
    };

    fetchRewards();
    return () => { mounted = false; };
  }, []);

  const addToCart = (item: RewardItem) => {
    const key = item.slug ?? item.id;
    // guard against double clicks / race: if already processing this id, ignore
    if (processingIds.includes(key)) return;
    setProcessingIds((s) => [...s, key]);

    // if user doesn't have enough points, show an alert
    // if item is out of stock, show an alert
    if ((item.stock ?? 0) <= 0) {
      window.alert("This item is out of stock.");
      // release processing lock
      setProcessingIds((s) => s.filter((x) => x !== key));
      return;
    }

    if (points < item.price) {
      window.alert("Not enough points to redeem this item.");
      // release processing lock
      setProcessingIds((s) => s.filter((x) => x !== key));
      return;
    }

    // prevent accidental double clicks by ensuring we update state only once per invocation
    setCart((prev) => {
      const copy = [...prev];
      // prefer slug for stable string id, otherwise use UUID
      const idx = copy.findIndex((c) => c.id === key);
      if (idx >= 0) {
        copy[idx].qty = (copy[idx].qty || 0) + 1;
      } else {
        copy.push({ id: key, qty: 1 });
      }
      return copy;
    });

    // deduct points immediately
    const newPoints = points - item.price;
    setPoints(newPoints);
    try {
      localStorage.setItem("user_points", String(newPoints));
      window.dispatchEvent(new CustomEvent("points_updated"));
    } catch {}
    // release processing lock after short delay to avoid accidental duplicates
    setTimeout(() => setProcessingIds((s) => s.filter((x) => x !== key)), 300);

  };

  const totalCartItems = cart.reduce((s, i) => s + (i.qty || 0), 0);

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Rewards (Merch)</h1>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full border border-base-300 bg-base-100 text-sm flex items-center gap-2">
            <span className="text-xs opacity-70">Your points</span>
            <span className="font-semibold">{points}</span>
          </div>
          <div className="badge badge-outline">{totalCartItems} items</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((m) => (
          <article key={m.id} className="card card-compact bg-base-100 shadow">
            <figure className="h-44 w-full overflow-hidden">
              <img src={m.img ?? '/assets/placeholder.png'} alt={m.title} className="object-cover w-full h-full" />
            </figure>
            <div className="card-body">
              <div className="flex items-start justify-between">
                <h2 className="card-title">{m.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">{m.price} pts</span>
                  <span className={`badge ${ (m.stock ?? 0) <= 0 ? 'badge-error' : 'badge-outline' }`}>{m.stock ?? 0} left</span>
                </div>
              </div>
              <p className="text-sm opacity-80">{m.description}</p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addToCart(m)}
                  aria-label={`Redeem ${m.title}`}
                  disabled={processingIds.includes(m.slug ?? m.id) || (m.stock ?? 0) <= 0}
                >
                  {processingIds.includes(m.slug ?? m.id) ? 'Adding…' : 'Redeem'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
