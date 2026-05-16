import { NextResponse } from 'next/server';
import { getKVData, setKVData } from '@/lib/kv';

const DEFAULT_SETTINGS = {
  shippingCharge: 0,
  taxRate: 10, // percentage
};

export async function GET() {
  const settings = await getKVData('settings') || DEFAULT_SETTINGS;
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const newSettings = await request.json() as Record<string, any>;
    await setKVData('settings', newSettings);
    return NextResponse.json(newSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
