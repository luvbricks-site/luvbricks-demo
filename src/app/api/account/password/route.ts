// src/app/api/account/password/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  
  // TODO: send password reset email via your auth system
  return NextResponse.json({ status: 'sent' });
}
