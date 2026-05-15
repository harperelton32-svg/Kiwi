import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'data', 'products.json');

function getProducts() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify([]));
      return [];
    }
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

function saveProducts(products: any[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2));
}

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const products = getProducts();
    
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    
    products.push(newProduct);
    saveProducts(products);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const updatedProduct = await request.json();
    const products = getProducts();
    
    const index = products.findIndex((p: any) => p.id === updatedProduct.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    products[index] = { ...products[index], ...updatedProduct };
    saveProducts(products);
    
    return NextResponse.json(products[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const products = getProducts();
    
    const filteredProducts = products.filter((p: any) => p.id !== id);
    saveProducts(filteredProducts);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
