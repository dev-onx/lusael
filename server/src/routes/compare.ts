import { Router } from 'express';
import type { CompareRequest, ScoredProperty } from '@lusael/shared';
import { properties } from './properties.js';
import { scoreProperty } from '../services/scoring.js';
import { callClaude } from '../services/anthropic.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { property_ids, brief }: CompareRequest = req.body;

    if (!property_ids || property_ids.length < 2 || property_ids.length > 3) {
      res.status(400).json({ error: '2-3 property IDs required' });
      return;
    }
    if (!brief) {
      res.status(400).json({ error: 'brief required' });
      return;
    }

    const selected = property_ids
      .map((id) => properties.find((p) => p.id === id))
      .filter(Boolean);

    if (selected.length !== property_ids.length) {
      res.status(404).json({ error: 'One or more properties not found' });
      return;
    }

    const scored: ScoredProperty[] = await Promise.all(
      selected.map(async (p) => ({
        ...p!,
        scores: await scoreProperty(p!, brief),
      }))
    );

    const names = scored.map((p) => p.title).join(', ');
    const tradeoffPrompt = `You are a Lusail property concierge. Write a focused 3-paragraph tradeoff analysis comparing these properties for this specific buyer. Be concrete, reference scores and facts, and end with a clear recommendation.

PROPERTIES BEING COMPARED:
${scored.map((p) => `${p.title}: lifestyle ${p.scores.lifestyle_score}/100, investment ${p.scores.investment_score}/100, QAR ${p.price_qar.toLocaleString()}, ${p.bedrooms}BR ${p.district}`).join('\n')}

USER BRIEF: ${JSON.stringify(brief)}

Write three paragraphs: (1) how each fits their lifestyle, (2) investment merit comparison, (3) your recommendation and why. Under 200 words total.`;

    const tradeoff = await callClaude(
      [{ role: 'user', content: `Compare ${names} for me.` }],
      tradeoffPrompt,
      512
    );

    res.json({ properties: scored, tradeoff });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
