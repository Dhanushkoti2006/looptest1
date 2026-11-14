import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateInvoicePDF } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('orderId') || searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    const order = db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const pdfDoc = generateInvoicePDF(order);
    const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ success: false, message: 'Invoice generation failed' }, { status: 500 });
  }
}
