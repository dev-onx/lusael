import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { UserBrief, ScoreResult } from '@lusael/shared';

const CACHE_FILE = path.join(process.cwd(), 'score-cache.json');

type CacheStore = Record<string, ScoreResult>;

function load(): CacheStore {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch {
    // corrupted cache — start fresh
  }
  return {};
}

function save(store: CacheStore): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2));
  } catch {
    // non-fatal
  }
}

export function briefHash(brief: UserBrief): string {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(brief))
    .digest('hex')
    .slice(0, 8);
}

export function getCached(brief: UserBrief, propertyId: string): ScoreResult | null {
  const store = load();
  const key = `${briefHash(brief)}:${propertyId}`;
  return store[key] ?? null;
}

export function setCached(brief: UserBrief, propertyId: string, score: ScoreResult): void {
  const store = load();
  const key = `${briefHash(brief)}:${propertyId}`;
  store[key] = score;
  save(store);
}
