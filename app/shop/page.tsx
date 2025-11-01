"use client";

import React, { useEffect, useState } from "react";
import { MERCH, type Merch } from "./data";
import Image from "next/image";

type CartItem = { id: string; qty: number };

export default function ShopPage() {
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

  // keep local cart in sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(cart));
      // notify other parts of the app (header) that cart changed
      window.dispatchEvent(new CustomEvent("cart_updated"));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (item: Merch) => {
    setCart((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((c) => c.id === item.id);
      if (idx >= 0) {
        copy[idx].qty += 1;
      } else {
        copy.push({ id: item.id, qty: 1 });
      }
      return copy;
    });
  };

  const totalCartItems = cart.reduce((s, i) => s + (i.qty || 0), 0);

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">XIAT Shop</h1>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full border border-base-300 bg-base-100 text-sm flex items-center gap-2">
            <span className="text-xs opacity-70">Your points</span>
            <span className="font-semibold">{points}</span>
          </div>
          <div className="badge badge-outline">{totalCartItems} items</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MERCH.map((m) => (
          <article key={m.id} className="card card-compact bg-base-100 shadow">
            <figure className="h-44 w-full overflow-hidden">
              {/* using regular img for simplicity */}
              <img src={m.img} alt={m.title} className="object-cover w-full h-full" />
            </figure>
            <div className="card-body">
              <div className="flex items-start justify-between">
                <h2 className="card-title">{m.title}</h2>
                <span className="badge badge-primary">{m.price} pts</span>
              </div>
              <p className="text-sm opacity-80">{m.desc}</p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addToCart(m)}
                  aria-label={`Add ${m.title} to cart`}
                >
                  Add to cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
