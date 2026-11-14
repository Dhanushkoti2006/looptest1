import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { target, code, type = 'LOGIN', name, phone } = await req.json();

    if (!target || !code) {
      return NextResponse.json(
        { success: false, message: 'Target and OTP are required.' },
        { status: 400 }
      );
    }

    const verification = db.verifyOTP(target.trim(), code.trim(), type);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    // Check if user exists
    let user =
      db.getUserByEmail(target.trim()) || db.getUserByPhone(target.trim());

    if (!user) {
      // Auto-register
      const isEmail = target.includes('@');
      user = db.createUser({
        name: name || (isEmail ? target.split('@')[0] : 'Handmade Lover'),
        email: isEmail ? target.trim() : `${target.replace(/[^0-9]/g, '')}@loopandlove.customer`,
        phone: !isEmail ? target.trim() : (phone || '+91 99999 00000'),
        role: target.toLowerCase() === 'admin@loopandlove.com' ? 'SUPER_ADMIN' : 'CUSTOMER',
        isEmailVerified: isEmail,
        isPhoneVerified: !isEmail,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user,
    });
  } catch (error) {
    console.error('OTP Verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification processing error.' },
      { status: 500 }
    );
  }
}
