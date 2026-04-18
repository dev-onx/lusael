import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import type { Property } from '@lusael/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

export const properties: Property[] = JSON.parse(
  readFileSync(path.join(__dirname, '../data/properties.json'), 'utf-8')
);

router.get('/', (_req, res) => {
  res.json(properties);
});

export default router;
