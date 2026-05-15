import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Initial settings if file doesn't exist
const DEFAULT_SETTINGS = {
  shippingCharge: 0,
  taxRate: 10, // percentage
};

function getSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    return DEFAULT_SETTINGS;
  }
  const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
  return JSON.parse(data);
}

export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const newSettings = await request.json();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    return NextResponse.json(newSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
