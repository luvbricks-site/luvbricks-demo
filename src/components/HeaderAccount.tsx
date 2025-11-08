'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

type Me = {
  isAuthenticated: boolean;
  userId?: string | null;
  firstName?: string | null;
  email?: string | null;
  points?: number | null;
};

const AUTH_PING_KEY = 'luvbricks:auth-ping';

export default function HeaderAccount() {
  const [me, setMe] = useState<Me | null>(null);
  const pathname = usePathname();

  const fetchMe = useCallback(async () => {
    try {
      const r = await fetch('/api/me', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const raw = await r.json();
      const payload: Me | null =
        raw?.isAuthenticated !== undefined
          ? raw
          : raw?.me?.isAuthenticated !== undefined
          ? raw.me
          : null;
      setMe(payload);
    } catch {
      setMe(null);
    }
  }, []);

  // Initial fetch + listeners for focus/visibility/storage (auth ping)
  useEffect(() => {
    fetchMe();

    const onFocus = () => fetchMe();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchMe();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_PING_KEY) fetchMe();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchMe]);

  // Refetch when the route changes (e.g., after sign-in redirects)
  useEffect(() => {
    fetchMe();
  }, [pathname, fetchMe]);

  const authed = !!me?.isAuthenticated;
  const points = Math.max(0, Number(me?.points ?? 0));

  // Friendly name
  const first = (me?.firstName ?? '').trim();
  const fallback = me?.email ? me.email.split('@')[0] : '';
  const hello = first || fallback;

  return (
    <div className="relative flex items-center gap-2">
      <Link
        href="/account"
        aria-label="Account"
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white hover:bg-slate-50"
        title="Account"
      >
        {/* account icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" className="text-slate-700">
          <path
            fill="currentColor"
            d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
          />
        </svg>

        {/* points badge (signed in & > 0) */}
        {authed && points > 0 && (
          <span
            className="absolute -top-1 -right-1 rounded-full bg-amber-500 text-white text-[10px] leading-[14px] px-1.5"
            aria-label={`${points} LuvPoints`}
          >
            {Math.min(points, 9999).toLocaleString()}
          </span>
        )}

        {/* hover pill (CSS only) */}
        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
          Account
        </span>
      </Link>

      {/* Welcome text (only when signed in) */}
      {authed && (
        <span className="hidden sm:block text-sm font-medium text-slate-900" aria-live="polite">
          {hello ? `Welcome, ${hello}` : 'Welcome'}
        </span>
      )}
    </div>
  );
}
