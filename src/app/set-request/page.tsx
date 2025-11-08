// src/app/set-request/page.tsx
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { computeProgress, money } from "@/lib/requests";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

type RequestWithSupports = Prisma.SetRequestGetPayload<{
  include: { supports: true }
}>;


export const revalidate = 30;

async function getOrCreateUserToken() {
  const c = await cookies();                     // 👈 await here
  let token = c.get("sr_token")?.value;
  if (!token) {
    token = crypto.randomUUID();
    c.set("sr_token", token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }
  return token;
}

/* ------------------------ SERVER ACTIONS ------------------------ */
async function voteAction(setRequestId: string, kind: "vote" | "deposit") {
  "use server";
  const token = await getOrCreateUserToken();

  // Create support (unique on [setRequestId, token, type])
  await prisma.setSupport.upsert({
    where: {
      setRequestId_userToken_type: { setRequestId, userToken: token, type: kind },
    },
    create: {
      setRequestId,
      userToken: token,
      type: kind,
      amountCents: kind === "deposit" ? 500 : null, // track $5 deposit
    },
    update: {}, // no-op if it exists
  });

  // Recompute progress and flip to INCOMING if target met
  const req = await prisma.setRequest.findUnique({
    where: { id: setRequestId },
    include: { supports: true },
  });
  if (req) {
    const { weighted, target } = computeProgress(req);
    if (weighted >= target && req.status === "collecting") {
      await prisma.setRequest.update({
        where: { id: setRequestId },
        data: { status: "incoming" },
      });
      // TODO: enqueue email / internal notification to place order
    }
  }

  revalidatePath("/set-request");
}

async function createRequestAction(formData: FormData) {
  "use server";
  const token = await getOrCreateUserToken();

  const setNumber = Number((formData.get("setNumber") ?? "").toString().trim());
  if (!Number.isFinite(setNumber)) return;

  // Try to prefill from your existing Product table if present
  const prod = await prisma.product.findFirst({
    where: { setNumber, isActive: true },
    include: { theme: true },
  });

  const name = (formData.get("name") || prod?.name || `Set #${setNumber}`).toString().slice(0, 120);
  const msrpCents = prod?.msrpCents ?? Number((formData.get("msrpCents") || "0").toString());
  const tier = msrpCents > 0 ? tierFromMsrp(msrpCents / 100) : guessTierFromOpenForm(formData);

  // If a request for this set already exists, just add a vote
  const existing = await prisma.setRequest.findFirst({ where: { setNumber, status: { in: ["collecting", "incoming"] } } });
  const reqId = existing?.id ?? (await prisma.setRequest.create({
    data: {
      setNumber,
      name,
      theme: prod?.theme?.name ?? (formData.get("theme")?.toString() || null),
      msrpCents: msrpCents || 0,
      tier,
      source: "open",
      status: "collecting",
      // Default thresholds by tier (free-vote / deposit). Adjust as desired.
      thresholdVotes: [0, 100, 35, 23, 12, 6][tier] || 20,
      thresholdDepos: [0, 45, 15, 10, 5, 3][tier] || 10,
    },
  })).id;

  // First vote by the creator
  await prisma.setSupport.upsert({
    where: {
      setRequestId_userToken_type: { setRequestId: reqId, userToken: token, type: "vote" },
    },
    create: { setRequestId: reqId, userToken: token, type: "vote" },
    update: {},
  });

  revalidatePath("/set-request");
}

/* --- helpers for tier from dollars (matches your tiers.ts ranges) --- */
function tierFromMsrp(price: number) {
  if (price >= 151) return 5;
  if (price >= 101) return 4;
  if (price >= 61) return 3;
  if (price >= 26) return 2;
  return 1;
}
function guessTierFromOpenForm(fd: FormData) {
  const msrp = Number((fd.get("msrpGuess") || "0").toString());
  return tierFromMsrp(msrp || 0);
}

/* ---------------------------- PAGE ----------------------------- */
export default async function SetRequestPage() {
  // Show top curated poll (limit 10), then “open” newest
  const poll: RequestWithSupports[] = await prisma.setRequest.findMany({
  where: { source: "poll", status: { in: ["collecting", "incoming"] } },
  orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  include: { supports: true },
  take: 10,
});

const open: RequestWithSupports[] = await prisma.setRequest.findMany({
  where: { source: "open", status: { in: ["collecting", "incoming"] } },
  orderBy: [{ createdAt: "desc" }],
  include: { supports: true },
  take: 6,
});


  const cookieStore = await cookies();           // 👈 await
  const token = cookieStore.get("sr_token")?.value ?? "";
  // ...


  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Set Request</h1>
      <p className="mt-2 text-slate-600">
        Vote on this week’s picks or request a specific set. When a request meets its supporter target, we move it to{" "}
        <span className="font-medium">Incoming</span> and place it on our next purchase order.
      </p>

      {/* ---- Curated Poll ---- */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Weekly Poll</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {poll.map((r) => (
            <RequestCard key={r.id} req={r} viewerToken={token} />
          ))}
        </div>
      </section>

      {/* ---- Open Requests (recent) ---- */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Recent Open Requests</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((r) => (
            <RequestCard key={r.id} req={r} viewerToken={token} />
          ))}
        </div>
      </section>

      {/* ---- Create New Request ---- */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">Request a Specific Set</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tip: paste the set number. If it already exists, you’ll see it above—open it and add your vote.
        </p>

        <form action={createRequestAction} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="setNumber" className="block text-sm font-medium text-slate-700">Set #</label>
            <input id="setNumber" name="setNumber" required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="75336" />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name (optional)</label>
            <input id="name" name="name" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="msrpCents" className="block text-sm font-medium text-slate-700">MSRP (optional)</label>
            <input id="msrpCents" name="msrpCents" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="$99.99 or cents" />
            <p className="mt-1 text-xs text-slate-500">You can enter cents (9999) or leave blank—we’ll try to look it up.</p>
          </div>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-slate-700">Theme (optional)</label>
            <input id="theme" name="theme" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

/* ------------------------- Card component ------------------------- */

async function MaybeProductLink({ setNumber }: { setNumber: number }) {
  const p = await prisma.product.findFirst({
    where: { setNumber, isActive: true },
    select: { slug: true },
  });
  if (!p) return null;

  return (
    <div className="mt-3 text-sm">
      <Link
        href={`/product/${p.slug}`}  // ✅ no stray backticks / braces
        className="text-blue-700 hover:underline"
      >
        View details
      </Link>
    </div>
  );
}

function RequestCard(props: { req: RequestWithSupports; viewerToken: string }) {
  const { req, viewerToken } = props;

  const progress = computeProgress(req);
  const alreadyVoted = req.supports.some(
    (s) => s.userToken === viewerToken && s.type === "vote"
  );
  const alreadyDeposited = req.supports.some(
    (s) => s.userToken === viewerToken && s.type === "deposit"
  );
  const isIncoming = req.status === "incoming";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">#{req.setNumber}</div>
          <h3 className="text-lg font-semibold text-slate-900">{req.name}</h3>
          <div className="mt-0.5 text-sm text-slate-600">
            {req.theme ? `${req.theme} • ` : ""}
            {req.msrpCents ? money(req.msrpCents) : "MSRP TBA"} • Tier {req.tier}
          </div>
        </div>
        <StatusPill incoming={isIncoming} />
      </div>
      

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{progress.weighted} supporters</span>
          <span>Goal: {progress.target}</span>
        </div>
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <form action={voteAction.bind(null, req.id, "vote")}>
          <button
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            disabled={alreadyVoted || isIncoming}
          >
            {alreadyVoted ? "Voted ✓" : "Add Vote"}
          </button>
        </form>

        <form action={voteAction.bind(null, req.id, "deposit")}>
          <button
            className="rounded-md border border-blue-600 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            disabled={alreadyDeposited || isIncoming}
            title="$5 deposit – applied as store credit when stocked (refundable if not stocked in time)"
          >
            {alreadyDeposited ? "Deposited ✓" : "Add $5 Deposit"}
          </button>
        </form>
      </div>

      <MaybeProductLink setNumber={req.setNumber} />
    </div>
  );
}

function StatusPill({ incoming }: { incoming: boolean }) {
  if (!incoming) {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
        Collecting
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      Incoming
    </span>
  );
}



// Async child is f
