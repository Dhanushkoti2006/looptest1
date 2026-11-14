import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-6">
      <h1 className="font-serif text-3xl font-bold text-brand-900">Privacy Policy & Terms of Service</h1>
      <div className="bg-white p-8 rounded-3xl border border-canvas-border shadow-cozy text-xs text-gray-700 leading-relaxed space-y-4">
        <p><strong>Your Privacy is Sacred to Us</strong></p>
        <p>
          Loop & Love operates with strict data protection guidelines. We only collect customer names, phone numbers, delivery addresses, and emails solely for order fulfillment, OTP authentication, and delivery communication.
        </p>
        <h3 className="font-serif font-bold text-base text-brand-900 pt-2">1. Payment Security</h3>
        <p>
          We never store debit card numbers, credit card CVVs, or bank credentials. All transactions are securely processed through Razorpay using industry standard 256-bit SSL encryption.
        </p>
        <h3 className="font-serif font-bold text-base text-brand-900 pt-2">2. OTP and Authentication</h3>
        <p>
          One-Time Passwords (OTPs) are generated with cryptographic security, expire in 10 minutes, and are never exposed publicly or shared with third parties.
        </p>
      </div>
    </div>
  );
}
