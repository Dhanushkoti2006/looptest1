import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateInvoicePDF } from '@/lib/invoice';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = db.getOrderById(params.id);
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
