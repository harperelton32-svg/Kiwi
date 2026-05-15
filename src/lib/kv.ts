import { getRequestContext } from "@opennextjs/cloudflare";
import fs from 'fs';
import path from 'path';

export async function getKVData(key: string) {
  // Try Cloudflare KV first (Production/Preview)
  try {
    const ctx = getRequestContext();
    if (ctx && ctx.env && ctx.env.DATA) {
      const value = await ctx.env.DATA.get(key);
      return value ? JSON.parse(value) : null;
    }
  } catch (e) {
    // If not in Cloudflare environment, fall back to local FS
  }

  // Fallback to local file system (Local Development)
  try {
    const dataFilePath = path.join(process.cwd(), 'data', `${key}.json`);
    if (fs.existsSync(dataFilePath)) {
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileContents);
    }
  } catch (error) {
    console.error(`Error reading local data for ${key}:`, error);
  }
  return null;
}

export async function setKVData(key: string, value: any) {
  // Try Cloudflare KV first
  try {
    const ctx = getRequestContext();
    if (ctx && ctx.env && ctx.env.DATA) {
      await ctx.env.DATA.put(key, JSON.stringify(value));
      return;
    }
  } catch (e) {
    // Fall back to local FS
  }

  // Fallback to local file system
  try {
    const dataFilePath = path.join(process.cwd(), 'data', `${key}.json`);
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(value, null, 2));
  } catch (error) {
    console.error(`Error saving local data for ${key}:`, error);
  }
}
