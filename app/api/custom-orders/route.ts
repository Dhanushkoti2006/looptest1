import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (id) {
      const order = db.getCustomOrderById(id);
      if (!order) {
        return NextResponse.json({ success: false, message: 'Custom order request not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, customOrder: order });
    }

    let customOrders = db.getCustomOrders();
    if (userId) {
      customOrders = customOrders.filter((c) => c.userId === userId || c.email === userId);
    }

    return NextResponse.json({ success: true, count: customOrders.length, customOrders });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch custom orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      email,
      phone,
      productType,
      description,
      preferredColors,
      preferredSize,
      quantity = 1,
      budgetRange,
      requiredDeliveryDate,
      referenceImages = [],
      additionalNotes,
    } = body;

    if (!customerName || !email || !productType || !description) {
      return NextResponse.json(
        { success: false, message: 'Customer name, email, product type, and description are required.' },
        { status: 400 }
      );
    }

    const newRequest = db.createCustomOrder({
      userId,
      customerName,
      email,
      phone: phone || '',
      productType,
      description,
      preferredColors: preferredColors || 'Artist choice pastel palette',
      preferredSize: preferredSize || 'Standard',
      quantity: Number(quantity) || 1,
      budgetRange: budgetRange || 'Flexible',
      requiredDeliveryDate: requiredDeliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      referenceImages,
      additionalNotes,
    });

    return NextResponse.json({
      success: true,
      message: 'Your custom crochet request has been submitted! Our artisan team will review it and send a custom quote.',
      customOrder: newRequest,
    });
  } catch (error) {
    console.error('Custom order POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit custom order request' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, quotation, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Request ID is required' }, { status: 400 });
    }

    let updated;
    if (quotation) {
      updated = db.updateCustomOrderQuotation(id, quotation, adminNotes);
    } else if (status) {
      updated = db.updateCustomOrderStatus(id, status);
    }

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Custom order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customOrder: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update custom order' }, { status: 500 });
  }
}
