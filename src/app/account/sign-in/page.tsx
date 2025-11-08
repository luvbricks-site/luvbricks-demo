'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

type LoginResponse = {
  ok?: boolean;
  error?: string;
};

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setMsg('Please enter a valid email.');
    if (!form.password) return setMsg('Please enter your password.');

    try {
      setBusy(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      try { localStorage.setItem('luvbricks:auth-ping', String(Date.now())); } catch {}

      const j: LoginResponse = await res.json().catch(() => ({} as LoginResponse));
      if (!res.ok) throw new Error(j?.error || 'Could not sign in.');

      // Session cookie is set by the server
      router.push('/account');
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Sorry—could not sign you in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">Welcome back.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
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

        {msg && <p className="text-sm text-rose-600">{msg}</p>}

        <div className="mt-3 flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-slate-900 px-4 py-2 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
          <Link
            href="/account/create"
            className="rounded-md border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Create account
          </Link>
        </div>
      </form>
    </main>
  );
}
