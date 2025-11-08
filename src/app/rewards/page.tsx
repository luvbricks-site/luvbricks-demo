/// src/app/rewards/page.tsx
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

/* ---------- Inline icons (no extra deps) ---------- */
function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.86 6.48 1.86 12.07c0 5.02 3.66 9.19 8.44 9.93v-7.02H7.9v-2.9h2.4V9.83c0-2.37 1.41-3.68 3.57-3.68 1.03 0 2.11.18 2.11.18v2.32h-1.19c-1.17 0-1.54.72-1.54 1.46v1.76h2.63l-.42 2.9h-2.21V22c4.78-.74 8.44-4.91 8.44-9.93z"
      />
    </svg>
  );
}
function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.2a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 6.2z"
      />
    </svg>
  );
}
function IconTikTok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M14.5 3c.6 1.8 2 3.2 3.8 3.8v3a7.7 7.7 0 0 1-3.8-1.1v6.7a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.1a2.7 2.7 0 1 0 2.2 2.7V3h2.7z"
      />
    </svg>
  );
}
function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.3 0 12 0 12s0 3.7.5 5.8a3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.7 24 12 24 12s0-3.7-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"
      />
    </svg>
  );
}

/* ---------- Page ---------- */
type ActionKey =
  | "account_create_join_email"
  | "social_follow_tiktok"
  | "social_follow_instagram"
  | "social_follow_facebook"
  | "share_store_social"
  | "social_subscribe_youtube";

export default function RewardsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  // Track if the user clicked the CTA for each action (enables Verify)
  const [ctaClicked, setCtaClicked] = useState<Record<ActionKey, boolean>>({
    account_create_join_email: false,
    social_follow_tiktok: false,
    social_follow_instagram: false,
    social_follow_facebook: false,
    share_store_social: false,
    social_subscribe_youtube: false,
  });

  // Track which actions are already awarded/complete
  const [completed, setCompleted] = useState<Record<ActionKey, boolean>>({
    account_create_join_email: false,
    social_follow_tiktok: false,
    social_follow_instagram: false,
    social_follow_facebook: false,
    share_store_social: false,
    social_subscribe_youtube: false,
  });

  function markClicked(action: ActionKey) {
    setCtaClicked((m) => ({ ...m, [action]: true }));
  }

  // Check if the user has an account
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        setHasAccount(Boolean(data?.isAuthenticated));
      } catch {
        if (!alive) return;
        setHasAccount(false);
      } finally {
        if (!alive) return;
        setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch completed/awarded actions so buttons show as Completed on load
  useEffect(() => {
    let alive = true;
    (async () => {
      // base map
      const base: Record<ActionKey, boolean> = {
        account_create_join_email: false,
        social_follow_tiktok: false,
        social_follow_instagram: false,
        social_follow_facebook: false,
        share_store_social: false,
        social_subscribe_youtube: false,
      };

      if (!hasAccount) {
        setCompleted(base);
        return;
      }

      // Treat signup as completed for any signed-in user (fallback if status API missing)
      base.account_create_join_email = true;

      try {
        const r = await fetch("/api/rewards/status", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;

        (j?.completed ?? []).forEach((a: ActionKey) => {
          base[a] = true;
        });

        setCompleted(base);
      } catch {
        if (!alive) return;
        // still set the fallback (signup completed when signed in)
        setCompleted(base);
      }
    })();
    return () => {
      alive = false;
    };
  }, [hasAccount]);

  async function verifyAction(action: ActionKey, extra?: { sourceId?: string }) {
    if (!hasAccount) {
      setMessage("Please create an account first to earn Social points.");
      return;
    }
    try {
      setLoading(action);
      setMessage("");
      const res = await fetch("/api/rewards/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(extra ?? {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not submit verification");
      if (data.status === "posted" || data.status === "already_posted") {
        setCompleted((prev) => ({ ...prev, [action]: true }));
        setMessage(
          data.status === "posted"
            ? "Verified! Points have been awarded."
            : "Already completed—thanks!"
        );
      } else {
        setMessage("Submitted. We’ll verify within 24 hours.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessage(msg);
    } finally {
      setLoading(null);
    }
  }

  // style helper
  const verifyBtnClass = (isSubmitting: boolean, extraDisabled = false) =>
    [
      "rounded-md px-3 py-1.5 font-medium",
      isSubmitting
        ? "bg-slate-900 text-white opacity-60 cursor-not-allowed"
        : "bg-slate-900 text-white hover:bg-slate-800",
      (!hasAccount || extraDisabled) ? "opacity-60 cursor-not-allowed" : "",
    ].join(" ");

  // Derived: consider signup done if either rewards status says so OR user is signed in
  const signupCompleted = completed.account_create_join_email || hasAccount;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <header className="max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900">LuvPoints Rewards</h1>
        <p className="mt-2 text-slate-700">
          Earn points when you shop and for a few quick actions—then redeem for money
          off your next build. It’s simple, transparent, and collector-friendly. LuvPoints are stackable with
          bundle discounts, so you can combine your rewards with our best prices.
        </p>
      </header>

      {/* Account prompt banner */}
      {!checking && !hasAccount && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm">
            <strong>Create Account first</strong> to earn points. Without an account,
            points can’t be awarded. Complete all tasks and earn{" "}
            <strong>300 points</strong> (worth <strong>$10 off</strong> your first order!).
          </p>
          <div className="mt-3">
            <Link
              href="/account/create"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Snapshot cards */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Earn</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1.5">
            <li><strong>Purchases:</strong> 1 point per $1 (net spend after bundle discounts and any redemptions).</li>
            <li>Bonus actions (one-time per account or per platform) listed below.</li>
            <li>Points post after your order ships or an action is verified.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Redeem</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1.5">
            <li>Redeem <strong>150 points</strong> for <strong>$5 off</strong> at checkout.</li>
            <li>Stacks with Bundle Discounts—MSRP stays intact; savings show at checkout.</li>
            <li>No blackout dates or expiration dates (until account is deleted). Points never reduce taxes or shipping.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Fair & Transparent</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1.5">
            <li>One account per person; simple verification prevents point-farming.</li>
            <li>U.S. accounts only.</li>
            <li>Bonuses are <strong>one-time</strong> offers</li>
          </ul>
        </div>
      </section>

      {/* Earning Points table */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900">Earning Points</h3>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
                <th className="px-4 py-2 text-left font-semibold">Points</th>
                <th className="px-4 py-2 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Purchases</td>
                <td className="px-4 py-3">1 point per $1</td>
                <td className="px-4 py-3">Points accrue on net spend after bundle discounts and any redemptions</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Create account + join email</td>
                <td className="px-4 py-3">125</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Follow TikTok</td>
                <td className="px-4 py-3">25</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Follow Instagram</td>
                <td className="px-4 py-3">25</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Follow Facebook</td>
                <td className="px-4 py-3">25</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Share our store on social</td>
                <td className="px-4 py-3">50</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Subscribe to YouTube channel</td>
                <td className="px-4 py-3">50</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Actions grid */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
        {/* Left: action cards */}
        <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Do the things. Get the points.</h3>
          <p className="mt-2 text-sm text-slate-700">
            Each bonus below is labeled with the exact points you’ll earn. Most are one-time per account
            (or per platform where noted). Tap <strong>Verify</strong> after you complete the action.
          </p>

          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Account + email (125) */}
            <li className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900">Create account + join email</div>
                <div className="flex items-center gap-2">
                  {signupCompleted && (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">Completed</span>
                  )}
                  <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5">+125</span>
                </div>
              </div>

              <p className="text-slate-600 mt-1">Sign up and opt into our emails.</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {/* Create account CTA */}
                <Link
                  href={signupCompleted ? "#" : "/account/create"}
                  onClick={(e) => {
                    if (signupCompleted) { e.preventDefault(); return; }
                    markClicked("account_create_join_email");
                  }}
                  aria-disabled={signupCompleted}
                  className={[
                    "rounded-md border px-3 py-1.5 text-slate-700",
                    signupCompleted ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50",
                  ].join(" ")}
                  title={signupCompleted ? "Already completed." : undefined}
                >
                  Create account
                </Link>

                {/* Join email CTA */}
                <Link
                  href={signupCompleted ? "#" : "/newsletter"}
                  onClick={(e) => {
                    if (signupCompleted) { e.preventDefault(); return; }
                    markClicked("account_create_join_email");
                  }}
                  aria-disabled={signupCompleted}
                  className={[
                    "rounded-md border px-3 py-1.5 text-slate-700",
                    signupCompleted ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50",
                  ].join(" ")}
                  title={signupCompleted ? "Already completed." : undefined}
                >
                  Join email
                </Link>

                {/* Verify */}
                <button
                  onClick={() => verifyAction("account_create_join_email")}
                  disabled={
                    signupCompleted ||
                    !hasAccount ||
                    !ctaClicked["account_create_join_email"] ||
                    loading === "account_create_join_email"
                  }
                  className={verifyBtnClass(
                    loading === "account_create_join_email",
                    signupCompleted || !ctaClicked["account_create_join_email"]
                  )}
                  aria-disabled={
                    signupCompleted ||
                    !hasAccount ||
                    !ctaClicked["account_create_join_email"]
                  }
                  title={
                    signupCompleted
                      ? "Already completed."
                      : !hasAccount
                        ? "Create an account first to earn points."
                        : undefined
                  }
                >
                  {signupCompleted
                    ? "Completed"
                    : loading === "account_create_join_email"
                      ? "Submitting…"
                      : "Verify"}
                </button>
              </div>

              {signupCompleted && (
                <p className="mt-2 text-xs text-slate-500">
                  Thanks! This bonus is one-time per account. You’re all set.
                </p>
              )}
            </li>


            {/* TikTok follow (25) */}
            <li className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900">Follow us on TikTok</div>
                <div className="flex items-center gap-2">
                  {completed.social_follow_tiktok ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">Completed</span>
                  ) : null}
                  <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5">+25</span>
                </div>
              </div>
              <p className="text-slate-600 mt-1">Open TikTok, follow our account, then verify here.</p>
              <div className="mt-3 flex gap-2">
                <a
                  href="https://tiktok.com/@luvbricks_store"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markClicked("social_follow_tiktok")}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <IconTikTok className="h-4 w-4" /> Open TikTok
                </a>
                <button
                  onClick={() => verifyAction("social_follow_tiktok")}
                  disabled={
                    !hasAccount ||
                    !ctaClicked["social_follow_tiktok"] ||
                    completed.social_follow_tiktok ||
                    loading === "social_follow_tiktok"
                  }
                  className={verifyBtnClass(
                    loading === "social_follow_tiktok",
                    !ctaClicked["social_follow_tiktok"] || completed.social_follow_tiktok
                  )}
                  aria-disabled={!hasAccount}
                  title={!hasAccount ? "Create an account first to earn points." : undefined}
                >
                  {completed.social_follow_tiktok
                    ? "Completed"
                    : loading === "social_follow_tiktok"
                    ? "Submitting…"
                    : "Verify"}
                </button>
              </div>
            </li>

            {/* Instagram follow (25) */}
            <li className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900">Follow us on Instagram</div>
                <div className="flex items-center gap-2">
                  {completed.social_follow_instagram ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">Completed</span>
                  ) : null}
                  <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5">+25</span>
                </div>
              </div>
              <p className="text-slate-600 mt-1">Open Instagram, follow our account, then verify here.</p>
              <div className="mt-3 flex gap-2">
                <a
                  href="https://instagram.com/luvbricks_store"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markClicked("social_follow_instagram")}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <IconInstagram className="h-4 w-4" /> Open Instagram
                </a>
                <button
                  onClick={() => verifyAction("social_follow_instagram")}
                  disabled={
                    !hasAccount ||
                    !ctaClicked["social_follow_instagram"] ||
                    completed.social_follow_instagram ||
                    loading === "social_follow_instagram"
                  }
                  className={verifyBtnClass(
                    loading === "social_follow_instagram",
                    !ctaClicked["social_follow_instagram"] || completed.social_follow_instagram
                  )}
                  aria-disabled={!hasAccount}
                  title={!hasAccount ? "Create an account first to earn points." : undefined}
                >
                  {completed.social_follow_instagram
                    ? "Completed"
                    : loading === "social_follow_instagram"
                    ? "Submitting…"
                    : "Verify"}
                </button>
              </div>
            </li>

            {/* Facebook follow (25) */}
            <li className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900">Follow us on Facebook</div>
                <div className="flex items-center gap-2">
                  {completed.social_follow_facebook ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">Completed</span>
                  ) : null}
                  <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5">+25</span>
                </div>
              </div>
              <p className="text-slate-600 mt-1">Open Facebook, follow our page, then verify here.</p>
              <div className="mt-3 flex gap-2">
                <a
                  href="https://facebook.com/profile.php?id=61582921312265"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markClicked("social_follow_facebook")}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <IconFacebook className="h-4 w-4" /> Open Facebook
                </a>
                <button
                  onClick={() => verifyAction("social_follow_facebook")}
                  disabled={
                    !hasAccount ||
                    !ctaClicked["social_follow_facebook"] ||
                    completed.social_follow_facebook ||
                    loading === "social_follow_facebook"
                  }
                  className={verifyBtnClass(
                    loading === "social_follow_facebook",
                    !ctaClicked["social_follow_facebook"] || completed.social_follow_facebook
                  )}
                  aria-disabled={!hasAccount}
                  title={!hasAccount ? "Create an account first to earn points." : undefined}
                >
                  {completed.social_follow_facebook
                    ? "Completed"
                    : loading === "social_follow_facebook"
                    ? "Submitting…"
                    : "Verify"}
                </button>
              </div>
            </li>

            {/* Share store (50) */}
            <li className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900">Share our store on social</div>
                <div className="flex items-center gap-2">
                  {completed.share_store_social ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">Completed</span>
                  ) : null}
                  <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5">+50</span>
                </div>
              </div>
              <p className="text-slate-600 mt-1">
                Share a link to our shop on your favorite platform, then verify.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href="https://www.facebook.com/sharer/sharer.php?u=https://luvbricks.com"
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => markClicked("share_store_social")}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <IconFacebook className="h-4 w-4" /> Share on Facebook
                </a>
                <a
                  href="https://instagram.com/luvbricks_store"
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => markClicked("share_store_social")}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <IconInstagram className="h-4 w-4" /> Share on Instagram
                </a>
                <a
                  href="https://tiktok.com/@luvbricks_store"
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => markClicked("share_store_social")}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <IconTikTok className="h-4 w-4" /> Share on TikTok
                </a>
                <button
                  onClick={() => verifyAction("share_store_social")}
                  disabled={
                    !hasAccount ||
                    !ctaClicked["share_store_social"] ||
                    completed.share_store_social ||
                    loading === "share_store_social"
                  }
                  className={verifyBtnClass(
                    loading === "share_store_social",
                    !ctaClicked["share_store_social"] || completed.share_store_social
                  )}
                  aria-disabled={!hasAccount}
                  title={!hasAccount ? "Create an account first to earn points." : undefined}
                >
                  {completed.share_store_social
                    ? "Completed"
                    : loading === "share_store_social"
                    ? "Submitting…"
                    : "Verify Share"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Instagram and TikTok don’t support a direct web share link.
                Feel free to post our URL: <span className="font-medium">https://luvbricks.com</span>
              </p>
            </li>

            {/* YouTube subscribe (50) */}
            <li className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900">Subscribe to our YouTube channel</div>
                <div className="flex items-center gap-2">
                  {completed.social_subscribe_youtube ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">Completed</span>
                  ) : null}
                  <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5">+50</span>
                </div>
              </div>
              <p className="text-slate-600 mt-1">Subscribe, then verify here.</p>
              <div className="mt-3 flex gap-2">
                <a
                  href="https://youtube.com/@luvbricks"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markClicked("social_subscribe_youtube")}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <IconYouTube className="h-4 w-4" /> Open YouTube
                </a>
                <button
                  onClick={() => verifyAction("social_subscribe_youtube")}
                  disabled={
                    !hasAccount ||
                    !ctaClicked["social_subscribe_youtube"] ||
                    completed.social_subscribe_youtube ||
                    loading === "social_subscribe_youtube"
                  }
                  className={verifyBtnClass(
                    loading === "social_subscribe_youtube",
                    !ctaClicked["social_subscribe_youtube"] || completed.social_subscribe_youtube
                  )}
                  aria-disabled={!hasAccount}
                  title={!hasAccount ? "Create an account first to earn points." : undefined}
                >
                  {completed.social_subscribe_youtube
                    ? "Completed"
                    : loading === "social_subscribe_youtube"
                    ? "Submitting…"
                    : "Verify Subscribe"}
                </button>
              </div>
            </li>
          </ul>

          {message && (
            <p className="mt-4 text-sm text-slate-700" role="status">
              {message}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-500">
            Verification is required to prevent farming. All bonuses above are one-time per account
            (per platform where indicated).
          </p>
        </div>

        {/* Right: snapshot (unchanged) */}
        <aside className="rounded-2xl border border-slate-200 p-5 bg-slate-50 shadow-sm h-fit">
          <h4 className="text-base font-semibold text-slate-900">Program Snapshot</h4>
          <ul className="mt-3 text-sm text-slate-700 space-y-1.5">
            <li>1 point per $1 on eligible purchases.</li>
            <li>150 points = $5 off (redeem at checkout).</li>
            <li>Points post when orders ship or actions are verified.</li>
            <li>U.S. accounts only. One account per person.</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Questions? Visit{" "}
            <Link href="/customer-service" className="underline hover:no-underline">
              Customer Service
            </Link>.
          </p>
        </aside>
      </section>
    </main>
  );
}
