import { Router } from 'express';
import type { Property } from '@lusael/shared';
import propertiesData from '../data/properties.json' with { type: 'json' };

const router = Router();
export const properties = propertiesData as Property[];

router.get('/', (_req, res) => {
  res.json(properties);
});

export default router;
