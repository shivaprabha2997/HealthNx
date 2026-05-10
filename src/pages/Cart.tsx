import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  ChevronLeft,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useState } from 'react';

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);

    try {
      await api.post('/orders', { items, total });
      clearCart();
      alert('Order placed successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
          <ShoppingBag className="h-12 w-12" />
        </div>

        <h2 className="mt-8 text-4xl font-black tracking-tight text-neutral-900">
          Your cart is empty
        </h2>

        <p className="mt-4 text-lg font-medium text-neutral-500">
          Add some medicines to your cart first!
        </p>

        <Link
          to="/pharmacy"
          className="mt-10 inline-flex items-center rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-700"
        >
          Browse Pharmacy
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl bg-brand-bg px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/pharmacy"
        className="mb-8 flex items-center text-[12px] font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-primary"
      >
        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
        Return to Inventory
      </Link>

      <div className="mb-10 flex items-baseline space-x-4">
        <h1 className="text-3xl font-black text-brand-text-main">Checkout</h1>
        <span className="text-[14px] font-bold text-brand-text-muted">
          Portal ID: CRT-5923
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between rounded-lg border border-brand-border bg-white px-6 py-4 text-[13px] font-bold uppercase tracking-wider text-brand-text-muted">
            <span>Itemized Selection</span>
            <span>{items.length} Unique SKUs</span>
          </div>

          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="card-polish flex items-center space-x-6 bg-white p-5 transition-all hover:border-brand-primary/30"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 rounded-lg border border-brand-border bg-[#f8fafc] p-2 object-contain"
              />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-brand-text-main">
                      {item.name}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted">
                      {item.category}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-brand-text-muted transition-colors hover:text-red-600"
                    aria-label="Remove item from cart"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-[17px] font-black text-brand-text-main">
                      ₹{item.price}
                    </span>
                    <span className="text-[11px] font-semibold text-brand-text-muted">
                      / unit
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 rounded-md border border-brand-border bg-[#f1f5f9] px-3 py-1">
                    <span className="text-[12px] font-bold text-brand-text-main">
                      QUANTITY: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-[96px] rounded-xl border border-brand-border bg-white p-8 shadow-brand">
            <h2 className="mb-8 border-b border-brand-border pb-4 text-xl font-black text-brand-text-main">
              Order Resolution
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-[13px] font-medium text-brand-text-muted">
                <span>Base Subtotal</span>
                <span className="font-bold text-brand-text-main">₹{total}</span>
              </div>

              <div className="flex justify-between text-[13px] font-medium text-brand-text-muted">
                <span>Shipping & Logistics</span>
                <span className="font-bold text-emerald-600">INCLUDED</span>
              </div>

              <div className="flex justify-between text-[13px] font-medium text-brand-text-muted">
                <span>Applied GST (18%)</span>
                <span className="font-bold text-brand-text-main">
                  ₹{Math.round(total * 0.18)}
                </span>
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-brand-border pt-6">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text-muted">
                    FINAL BILLING AMOUNT
                  </p>
                  <p className="text-3xl font-black text-brand-primary">
                    ₹{Math.round(total * 1.18)}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-10 flex w-full items-center justify-center rounded-lg bg-brand-primary py-4 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-brand-primary-hover active:scale-[0.99] disabled:opacity-50"
              aria-label="Place order"
              title="Place order"
            >
              {checkingOut ? 'Resolving Payment...' : 'Resolve Order'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            <div className="mt-8 space-y-3 border-t border-brand-border pt-6">
              <div className="flex items-center text-[12px] font-semibold text-brand-text-muted">
                <ShieldCheck className="mr-2 h-4 w-4 shrink-0 text-emerald-500" />
                Fully Encrypted Transaction
              </div>

              <div className="flex items-center text-[12px] font-semibold text-brand-text-muted">
                <Truck className="mr-2 h-4 w-4 shrink-0 text-brand-primary" />
                Professional logistics handling
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}