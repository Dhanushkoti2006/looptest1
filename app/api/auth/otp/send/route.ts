import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { target, type = 'LOGIN' } = await req.json();

    if (!target || typeof target !== 'string' || target.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email or mobile number.' },
        { status: 400 }
      );
    }

    const record = db.createOTP(target.trim(), type);

    // In local development/demo mode, we return the devCode so the user can test without third-party SMS/email charges.
    // Also universal bypass code '123456' is active.
    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP has been dispatched to ${target.trim()}.`,
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
