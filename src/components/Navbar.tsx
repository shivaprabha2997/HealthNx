import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="sticky top-0 z-50 h-[72px] border-b border-brand-border bg-white">
      <div className="mx-auto flex h-full w-full items-center justify-between px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-brand-primary">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>

          <span className="text-xl font-extrabold tracking-tight text-neutral-900">
            HealthNx
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          <Link
            to="/doctors"
            className="text-sm font-semibold text-brand-text-muted transition-colors hover:text-brand-primary"
          >
            Find Doctors
          </Link>

          <Link
            to="/pharmacy"
            className="text-sm font-semibold text-brand-text-muted transition-colors hover:text-brand-primary"
          >
            Pharmacy
          </Link>

          <div className="mx-2 h-6 w-px bg-brand-border" />

          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden text-right lg:block">
                <p className="text-[13px] font-bold leading-tight text-brand-text-main">
                  {user.name}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-text-muted">
                  {user.role}
                </p>
              </div>

              <Link
                to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-white"
              >
                <User className="h-5 w-5" />
              </Link>

              <Link
                to="/cart"
                className="relative p-2 text-brand-text-muted transition-colors hover:text-brand-primary"
              >
                <ShoppingCart className="h-5 w-5" />

                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-brand-text-muted transition-colors hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-sm font-bold text-brand-text-muted hover:text-brand-text-main"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-primary-hover"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-700 md:hidden"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-100 bg-white md:hidden"
          >
            <div className="space-y-2 px-4 pb-6 pt-4">
              <Link
                to="/doctors"
                onClick={() => setIsOpen(false)}
                className="block py-3 text-base font-medium text-neutral-700"
              >
                Find Doctors
              </Link>

              <Link
                to="/pharmacy"
                onClick={() => setIsOpen(false)}
                className="block py-3 text-base font-medium text-neutral-700"
              >
                Pharmacy
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block py-3 text-base font-medium text-neutral-700"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block py-3 text-base font-medium text-neutral-700"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center py-3 text-base font-medium text-red-600"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-900"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}