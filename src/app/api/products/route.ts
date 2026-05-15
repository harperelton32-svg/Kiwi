import { NextResponse } from 'next/server';
import { getKVData, setKVData } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getKVData('products') || [];
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const products = await getKVData('products') || [];
    
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    
    products.push(newProduct);
    await setKVData('products', products);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const updatedProduct = await request.json();
    const products = await getKVData('products') || [];
    
    const index = products.findIndex((p: any) => p.id === updatedProduct.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    products[index] = { ...products[index], ...updatedProduct };
    await setKVData('products', products);
    
    return NextResponse.json(products[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const products = await getKVData('products') || [];
    
    const filteredProducts = products.filter((p: any) => p.id !== id);
    await setKVData('products', filteredProducts);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
