import { NextResponse } from 'next/server';
import { getKVData, setKVData } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orders = await getKVData('orders') || [];
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json() as any;
    const orders = await getKVData('orders') || [];

    const newOrder = {
      ...orderData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    await setKVData('orders', orders);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json() as any;
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const orders = await getKVData('orders') || [];
    const orderIndex = orders.findIndex((o: any) => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[orderIndex].status = status;
    await setKVData('orders', orders);

    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json() as any;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const orders = await getKVData('orders') || [];
    const filteredOrders = orders.filter((o: any) => o.id !== id);

    if (orders.length === filteredOrders.length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await setKVData('orders', filteredOrders);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
