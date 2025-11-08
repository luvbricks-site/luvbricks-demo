'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

type RegisterResponse = {
  ok?: boolean;
  userId?: string;
  error?: string;
};

export default function CreateAccountPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    email: '',
    password: '',
    confirm: '',
    newsletter: true, // default opt-in (adjust to your preference)
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!form.firstName.trim()) return setMsg('Please enter your first name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setMsg('Please enter a valid email.');
    if (form.password.length < 6) return setMsg('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setMsg('Passwords do not match.');

    try {
      setBusy(true);

      const payload = {
        firstName: form.firstName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        // IMPORTANT: matches what /api/auth/register expects
        newsletterOptIn: Boolean(form.newsletter),
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j: RegisterResponse = await res.json().catch(() => ({} as RegisterResponse));
      if (!res.ok) throw new Error(j?.error || 'Could not create account.');
      
      try { localStorage.setItem('luvbricks:auth-ping', String(Date.now())); } catch {}
      // Server sets session cookie; head to /account and refresh UI
      router.push('/account');
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Sorry—could not create your account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">
        Track orders, manage addresses, and earn LuvPoints.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => set('firstName', e.target.value)}
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Confirm password"
          type="password"
          value={form.confirm}
          onChange={(e) => set('confirm', e.target.value)}
        />

        {/* Newsletter opt-in → needed to award the 125 pts */}
        <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.newsletter}
            onChange={(e) => set('newsletter', e.target.checked)}
          />
          I’d like LuvBricks emails (earn 125 pts on signup).
        </label>

        {msg && <p className="text-sm text-rose-600">{msg}</p>}

        <div className="mt-3 flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create Account'}
          </button>
          <Link
            href="/account/sign-in"
            className="rounded-md border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Have an account? Sign in
          </Link>
        </div>
      </form>
    </main>
  );
}
