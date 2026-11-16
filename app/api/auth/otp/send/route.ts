import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { target, type = 'LOGIN' } = await req.json();

    // Normalise target (trim spaces and collapse internal whitespace)
    const cleanTarget = target.trim().replace(/\s+/g, '');
    if (!cleanTarget) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email or mobile number.' },
        { status: 400 }
      );
    }

    // Rate‑limit: one OTP per target per 30 seconds
    const recent = db.getRecentOTP(cleanTarget);
    if (recent && Date.now() - new Date(recent.createdAt).getTime() < 30_000) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please wait a few seconds before requesting another OTP.',
        },
        { status: 429 }
      );
    }

    const record = db.createOTP(cleanTarget, type);
    // Return dev code for testing environments
    return NextResponse.json({
      success: true,
      message: `A 6‑digit OTP has been dispatched to ${cleanTarget}.`,
      devCode: record.code,
      expiresAt: record.expiresAt,
    });
  } catch (error) {
    console.error('OTP Send error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP.' },
      { status: 500 }
    );
  }
}
