// src/app/gift-guide/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

type GiftGuideProduct = {
  id: string;
  slug: string;
  setNumber: number;
  name: string;
  msrpCents: number;
  imageUrl?: string | null;
  themeSlug?: string;
  qty?: number | null;
  inStock?: boolean | null;
};

const AGE_OPTIONS = [
  { value: 'under-5', label: 'A young child (under 5)', ageMin: 1 },
  { value: '5-8', label: 'A kid (5–8)', ageMin: 5 },
  { value: '9-12', label: 'A tween (9–12)', ageMin: 9 },
  { value: '13-17', label: 'A teen (13–17)', ageMin: 13 },
  { value: '18+', label: 'An adult (18+)', ageMin: 18 },
] as const;

const THEMES = [
  { slug: 'star-wars', label: 'Star Wars' },
  { slug: 'harry-potter', label: 'Harry Potter' },
  { slug: 'marvel', label: 'Marvel or superheroes' },
  { slug: 'friends', label: 'Cute, silly, or colorful stuff' },
  { slug: 'duplo', label: 'Animals or nature' },
  { slug: 'city', label: 'Buildings and cities' },
  { slug: 'fantasy', label: 'Fantasy or magic' },
  { slug: 'vehicles', label: 'Vehicles or machines' },
  { slug: 'creator', label: 'Creative building and mixing' },
] as const;

const EXPERIENCE = [
  'Yes, they love it!',
  "They've built a few",
  "I'm not sure",
  'No, this would be their first',
] as const;

const BUDGET = [
  { range: [2000, 3000] as const, label: '$20–30' },
  { range: [3000, 5000] as const, label: '$30–50' },
  { range: [5000, 7500] as const, label: '$50–75' },
  { range: [7500, 10000] as const, label: '$75–100' },
  { range: [10000, 100000] as const, label: '$100+' },
] as const;

export default function GiftGuidePage() {
  const [form, setForm] = useState<{
    age: string;
    themes: string[];
    experience: string;
    budget: string;
  }>({ age: '', themes: [], experience: '', budget: '' });

  const [results, setResults] = useState<GiftGuideProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const ageMin = AGE_OPTIONS.find((x) => x.value === form.age)?.ageMin ?? 1;
    const priceRange =
      BUDGET.find((x) => x.label === form.budget)?.range ?? [0, 100000];

    // build a friendly summary now, based on answers
    const ageLabel = AGE_OPTIONS.find((x) => x.value === form.age)?.label ?? '';
    const themesLabel =
      form.themes.length > 0
        ? THEMES.filter((t) => form.themes.includes(t.slug))
            .map((t) => t.label)
            .join(', ')
        : 'any theme';
    const expLabel = form.experience || 'unsure';
    const budgetLabel = form.budget || 'any budget';

    setSummary(
      `Great! For ${ageLabel.toLowerCase()} who ${
        expLabel === 'unsure' ? "you're not sure builds LEGO yet" : expLabel.toLowerCase()
      }, and is into ${themesLabel.toLowerCase()}, here are picks around ${budgetLabel}.`
    );

    try {
      const res = await fetch('/api/gift-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageMin,
          themeSlugs: form.themes, // string[]
          priceMin: priceRange[0],
          priceMax: priceRange[1],
          experience: form.experience, // optional for backend heuristics
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = (await res.json()) as { products: GiftGuideProduct[] };
      setResults(data.products || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Gift Buyer’s Guide</h1>
      <p className="mt-2 text-slate-600">
        Not sure where to start? Answer a few quick questions and we’ll suggest LEGO sets that match.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Q1: Age */}
        <div>
          <label className="block font-medium mb-2">Who are you buying for?</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            required
          >
            <option value="">Select age range</option>
            {AGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Q2: Interests */}
        <div>
          <label className="block font-medium mb-2">What are they into? (Pick 1–3)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const checked = form.themes.includes(t.slug);
              return (
                <label key={t.slug} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={t.slug}
                    checked={checked}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setForm((f) => {
                        const next = checked
                          ? f.themes.filter((s) => s !== slug)
                          : [...f.themes, slug];
                        // limit to 3
                        return { ...f, themes: next.slice(0, 3) };
                      });
                    }}
                  />
                  {t.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* Q3: Experience */}
        <div>
          <label className="block font-medium mb-2">Do they already build LEGO?</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.experience}
            onChange={(e) =>
              setForm((f) => ({ ...f, experience: e.target.value }))
            }
            required
          >
            <option value="">Select an option</option>
            {EXPERIENCE.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Q4: Budget */}
        <div>
          <label className="block font-medium mb-2">How much would you like to spend?</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            required
          >
            <option value="">Select a budget</option>
            {BUDGET.map((b) => (
              <option key={b.label}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Finding sets…' : 'Show Matching Sets'}
        </button>
      </form>

      {/* Results */}
      {(results.length > 0 || summary) && (
        <section className="mt-8">
          {summary && (
            <p className="text-slate-700 mb-4">
              {summary}
            </p>
          )}

          {results.length === 0 ? (
            <p className="text-slate-600">
              We couldn’t find exact matches, but we’d love to help.{' '}
              <Link
                href="/customer-service/contact"
                className="text-blue-700 hover:underline"
              >
                Reach out to our support team
              </Link>{' '}
              and we’ll guide you.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.slice(0, 6).map((p) => (
                <ProductCard
                  key={p.id}
                  p={{
                    slug: p.slug,
                    setNumber: p.setNumber,
                    name: p.name,
                    msrpCents: p.msrpCents,
                    imageUrl: p.imageUrl,
                    themeSlug: p.themeSlug,
                    qty: p.qty ?? null,
                    inStock: p.inStock ?? null,
                  }}
                />
              ))}
            </div>
          )}

          <p className="mt-6 text-sm text-slate-600">
            Still unsure?{' '}
            <Link
              href="/customer-service/contact"
              className="text-blue-700 hover:underline"
            >
              Contact our team
            </Link>{' '}
            — we’ll help you pick a perfect gift.
          </p>
        </section>
      )}
    </main>
  );
}
