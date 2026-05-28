'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

/**
 * Admin Login — Simple, elegant password gate.
 * Sets the nhg_admin cookie on success (read by middleware).
 * In a future iteration we can upgrade to proper sessions + rate limiting.
 */
export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const search = useSearchParams();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Success — middleware will now allow access
        const from = search.get('from') || '/admin';
        router.push(from);
        router.refresh();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-accent text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tighter">Admin Back Door</h1>
          <p className="mt-2 text-text-secondary">North Hanover Grille • Staff Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input text-lg tracking-widest"
              placeholder="••••••••••••"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="btn btn-primary w-full text-base py-6 disabled:opacity-70"
          >
            {loading ? 'Verifying…' : 'Enter Admin Panel'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-text-muted tracking-[2px]">
          ALL CHANGES ARE SAVED INSTANTLY
        </div>
      </div>
    </div>
  );
}
