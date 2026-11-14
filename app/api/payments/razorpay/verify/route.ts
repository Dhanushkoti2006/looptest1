import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!orderId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing payment details.' },
        { status: 400 }
      );
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpayOrderId || order.razorpayOrderId || '',
      razorpayPaymentId,
      razorpaySignature || 'simulated_signature'
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, message: 'Payment signature verification failed.' },
        { status: 400 }
      );
    }

    // Update order with verified payment details
    order.paymentStatus = 'SUCCESS';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.orderStatus = 'Payment Verified';

    order.statusHistory.push({
      status: 'Payment Verified',
      timestamp: new Date().toISOString(),
      note: `Payment of Rs. ${order.totalAmount} successfully verified via Razorpay ID: ${razorpayPaymentId}`,
    });

    order.statusHistory.push({
      status: 'Order Confirmed',
      timestamp: new Date().toISOString(),
      note: 'Order confirmed and queued for artisan crafting.',
    });

    // Reduce inventory for each item
    for (const item of order.items) {
      db.reduceStock(item.productId, item.quantity);
    }

    db.updateOrderStatus(order.id, 'Order Confirmed', 'Payment verified and inventory reserved.');

    return NextResponse.json({
      success: true,
      message: 'Payment successfully verified and order confirmed!',
      order,
    });
  } catch (error) {
    console.error('Payment verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
