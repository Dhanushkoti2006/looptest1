import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay';
import { OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const orderNumber = searchParams.get('orderNumber');

    if (orderNumber) {
      const order = db.getOrderById(orderNumber);
      if (!order) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    if (userId) {
      const orders = db.getOrdersByUserId(userId);
      return NextResponse.json({ success: true, count: orders.length, orders });
    }

    const orders = db.getOrders();
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Orders API GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      shippingAddress,
      couponCode,
      specialInstructions,
      paymentMethod = 'Razorpay UPI/Cards',
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart items are required' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.pincode) {
      return NextResponse.json({ success: false, message: 'Complete delivery address is required' }, { status: 400 });
    }

    // SERVER-SIDE REVALIDATION: Re-calculate item prices & verify inventory
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product "${item.productName}" no longer exists.` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Sorry, "${product.name}" only has ${product.stock} pieces remaining in stock.`,
          },
          { status: 400 }
        );
      }

      const unitPrice = product.discountPrice || product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        image: product.images[0] || '/images/loop-and-love-logo.jpg',
        color: item.color || 'Standard',
        size: item.size || 'Standard',
        unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    // Free shipping above 999
    const shippingCharge = subtotal >= 999 ? 0 : 99;

    // Coupon verification
    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(coupon.maxDiscount, discountAmount);
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const taxAmount = Math.round((subtotal - discountAmount) * 0.05 * 100) / 100;
    const totalAmount = Math.round((subtotal - discountAmount + shippingCharge + taxAmount) * 100) / 100;

    // Create Razorpay payment order
    const rzpOrder = await createRazorpayOrder({
      amount: totalAmount * 100, // paise
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      notes: {
        customerName,
        customerEmail,
      },
    });

    // Save order in database
    const newOrder = db.createOrder({
      userId: userId || 'guest',
      customerName,
      customerEmail,
      customerPhone,
      items: validatedItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      taxAmount,
      discountAmount,
      couponCode,
      totalAmount,
      paymentStatus: 'PENDING',
      paymentMethod,
      razorpayOrderId: rzpOrder.id,
      orderStatus: 'Order Placed',
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: 'Order initiated, awaiting verified payment.',
        },
      ],
      specialInstructions,
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      razorpay: {
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_LoopAndLove2026',
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, note, trackingNumber, courierPartner } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: 'Order ID and status are required' }, { status: 400 });
    }

    const updated = db.updateOrderStatus(
      orderId,
      status as OrderStatus,
      note,
      trackingNumber,
      courierPartner
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update order status' }, { status: 500 });
  }
}
