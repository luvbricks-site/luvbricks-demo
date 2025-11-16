// src/components/checkout/ShippingForm.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import type { ShipTo } from "@/lib/shipTo";

type Props = {
  onSaved?: (shipTo: ShipTo) => void;
};

const empty: ShipTo = {
  fullName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  phone: "",
  updatedAt: 0,
};

// helper: coerce possibly null/undefined into a string
function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export default function ShippingForm({ onSaved }: Props) {
  const [form, setForm] = useState<ShipTo>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load any previously saved ship-to
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/ship-to", { cache: "no-store", credentials: "same-origin" });
        const j = await r.json();
        if (!alive) return;

        const raw = j?.shipTo ?? {};
        // Normalize to strings so inputs are always controlled
        setForm({
          fullName: asString(raw.fullName),
          address1: asString(raw.address1),
          address2: asString(raw.address2),
          city: asString(raw.city),
          state: asString(raw.state),
          postalCode: asString(raw.postalCode),
          country: asString(raw.country, "US"),
          phone: asString(raw.phone),
          updatedAt: Number(raw.updatedAt ?? 0),
        });
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  function update<K extends keyof ShipTo>(key: K, val: ShipTo[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // Stable save function (so effects can depend on it without lint warnings)
  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/ship-to", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "same-origin",
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Could not save shipping");
      setForm(j.shipTo);
      onSaved?.(j.shipTo);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save shipping");
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, onSaved]);

  // Expose the save hook globally so payment buttons can call it (typed via global.d.ts)
  useEffect(() => {
    window.luvbricks_saveShipTo = save;
    return () => {
      delete window.luvbricks_saveShipTo;
    };
  }, [save]);

  if (loading) return <div className="text-sm text-slate-600">Loading shipping…</div>;

  return (
    <div id="shipping" className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Shipping address</h3>
        <button
          onClick={save}
          disabled={saving}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Full name" value={form.fullName} onChange={(v) => update("fullName", v)} required />
        <Field label="Phone (optional)" value={form.phone} onChange={(v) => update("phone", v)} />
        <Field
          label="Address line 1"
          value={form.address1}
          onChange={(v) => update("address1", v)}
          required
          className="sm:col-span-2"
        />
        <Field
          label="Address line 2"
          value={form.address2}
          onChange={(v) => update("address2", v)}
          className="sm:col-span-2"
        />
        <Field label="City" value={form.city} onChange={(v) => update("city", v)} required />
        <Field label="State" value={form.state} onChange={(v) => update("state", v)} required />
        <Field label="Postal code" value={form.postalCode} onChange={(v) => update("postalCode", v)} required />
        <Field label="Country" value={form.country} onChange={(v) => update("country", v)} required />
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-slate-500">
        We’ll prefill this next time you order. You can edit or delete it from your Account page.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  className,
}: {
  label: string;
  value: string | null | undefined;           // allow null/undefined coming in
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="mb-1 block text-xs font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <input
        value={value ?? ""}                     // always feed a string to the input
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}
