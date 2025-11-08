// src/app/api/account/password/route.ts
import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demoMode';

export async function POST() {
  if (DEMO_MODE) {
    return NextResponse.json(
      {
        error:
          'Demo mode: reorder is disabled in this preview environment.',
      },
      { status: 403 }
    );
  }
  // TODO: send password reset email via your auth system
  return NextResponse.json({ status: 'sent' });
}
