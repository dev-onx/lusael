import { Router } from 'express';
import type { RecommendationsRequest, ScoredProperty } from '@lusael/shared';
import { properties } from './properties.js';
import { scoreProperty } from '../services/scoring.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { brief, offset = 0, mode = 'standard' }: RecommendationsRequest = req.body;

    if (!brief) {
      res.status(400).json({ error: 'brief required' });
      return;
    }

    const scored = await Promise.all(
      properties.map(async (p) => ({
        ...p,
        scores: await scoreProperty(p, brief),
      }))
    );

    scored.sort((a, b) => b.scores.combined_score - a.scores.combined_score);

    let results: ScoredProperty[];

    if (mode === 'wildcards') {
      const budgetMax = brief.budget_max;
      const budgetMin = brief.budget_min;
      const wildcards = scored
        .filter((p) => {
          const price = brief.intent === 'rent' ? p.rent_monthly_qar * 12 : p.price_qar;
          const outsideBudget = price > budgetMax * 1.2 || price < budgetMin * 0.8;
          const outsideBedrooms = brief.bedrooms !== null && p.bedrooms !== brief.bedrooms;
          return (outsideBudget || outsideBedrooms) && p.scores.lifestyle_score >= 60;
        })
        .slice(0, 5)
        .map((p) => ({ ...p, is_wildcard: true }));
      results = wildcards;
    } else {
      results = scored.slice(offset, offset + 5);
    }

    res.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
