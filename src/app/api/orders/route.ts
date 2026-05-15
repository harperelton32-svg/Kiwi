import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'data', 'orders.json');

// Helper to ensure the file exists and return its contents
function getOrders() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      // Ensure directory exists
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify([]));
      return [];
    }
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    try {
      return JSON.parse(fileContents);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const orders = getOrders();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Read existing orders
    const orders = getOrders();

    // Add new order
    const newOrder = {
      ...orderData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    // Write back to file
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2));

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const orders = getOrders();
    const orderIndex = orders.findIndex((o: any) => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[orderIndex].status = status;
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2));

    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const orders = getOrders();
    const filteredOrders = orders.filter((o: any) => o.id !== id);

    if (orders.length === filteredOrders.length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(filteredOrders, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
