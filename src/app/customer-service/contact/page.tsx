export default function Page() {
  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
      <p className="mt-2 text-sm text-slate-700">We reply within 1 business day.</p>

      <form className="mt-6 grid grid-cols-1 gap-4">
        <input required className="rounded-md border border-slate-300 px-3 py-2" placeholder="Your email" />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Subject (optional)" />
        <textarea rows={6} className="rounded-md border border-slate-300 px-3 py-2" placeholder="How can we help?" />
        <button type="submit" className="w-fit rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
}
