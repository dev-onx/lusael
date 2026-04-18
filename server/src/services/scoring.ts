import type { Property, UserBrief, ScoreResult } from '@lusael/shared';
import { callClaude } from './anthropic.js';
import { getCached, setCached } from './cache.js';

const DISTRICT_WEIGHTS: Record<string, number> = {
  'Marina District': 90,
  'Qetaifan Island': 85,
  'Energy City': 70,
  'Fox Hills': 65,
  'Al Erkyah': 60,
};

function calcInvestmentScore(property: Property): number {
  const yieldScore = Math.min(100, (property.rental_yield_pct / 10) * 100) * 0.4;
  const trendRaw = Math.max(0, Math.min(15, property.price_trend_1yr_pct));
  const trendScore = (trendRaw / 15) * 100 * 0.3;
  const districtScore = (DISTRICT_WEIGHTS[property.district] ?? 60) * 0.2;
  const amenityScore = Math.min(100, property.amenities.length * 10) * 0.1;
  return Math.round(yieldScore + trendScore + districtScore + amenityScore);
}

async function calcLifestyleScore(
  property: Property,
  brief: UserBrief
): Promise<{ score: number; justification: string }> {
  const prompt = `You are a property scoring engine. Score how well this property matches the user brief.

PROPERTY:
${JSON.stringify(property, null, 2)}

USER BRIEF:
${JSON.stringify(brief, null, 2)}

Respond with ONLY valid JSON in this exact format:
{"score": <integer 0-100>, "justification": "<exactly 2 sentences explaining the score>"}

Consider: budget fit, bedroom count, lifestyle tags, intent (buy/rent/invest), commute to anchor location, and amenities. Be precise and realistic.`;

  const raw = await callClaude(
    [{ role: 'user', content: 'Score this property.' }],
    prompt,
    256
  );

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in lifestyle score response');
  const parsed = JSON.parse(match[0]) as { score: number; justification: string };
  return { score: Math.max(0, Math.min(100, parsed.score)), justification: parsed.justification };
}

async function genWhyThisOne(
  property: Property,
  brief: UserBrief,
  lifestyleScore: number,
  investmentScore: number
): Promise<string> {
  const prompt = `You are a Lusail property concierge. Write a compelling 3-line (≤60 words total) "Why this one" rationale for showing this property to this buyer. Be specific, warm, and reference concrete property and brief details.

PROPERTY: ${property.title} in ${property.district}
LIFESTYLE SCORE: ${lifestyleScore}/100
INVESTMENT SCORE: ${investmentScore}/100
BRIEF: ${JSON.stringify(brief)}
KEY PROPERTY FACTS: ${property.bedrooms}BR, ${property.size_sqm}sqm, QAR ${property.price_qar.toLocaleString()}, ${property.view}

Respond with ONLY the rationale text, no JSON, no quotes.`;

  return callClaude(
    [{ role: 'user', content: 'Write the rationale.' }],
    prompt,
    150
  );
}

export async function scoreProperty(
  property: Property,
  brief: UserBrief
): Promise<ScoreResult> {
  const cached = getCached(brief, property.id);
  if (cached) return cached;

  const [lifestyle, investmentScore] = await Promise.all([
    calcLifestyleScore(property, brief),
    Promise.resolve(calcInvestmentScore(property)),
  ]);

  const combined = Math.round(lifestyle.score * 0.6 + investmentScore * 0.4);

  const investmentExplanation = await callClaude(
    [{ role: 'user', content: 'Explain the investment score.' }],
    `Explain in one sentence why this property has an investment score of ${investmentScore}/100.
Property: ${property.title}, yield ${property.rental_yield_pct}%, trend +${property.price_trend_1yr_pct}% YoY, district: ${property.district}.
Respond with ONLY the sentence, no JSON.`,
    100
  );

  const whyThisOne = await genWhyThisOne(property, brief, lifestyle.score, investmentScore);

  const result: ScoreResult = {
    lifestyle_score: lifestyle.score,
    lifestyle_justification: lifestyle.justification,
    investment_score: investmentScore,
    investment_explanation: investmentExplanation,
    combined_score: combined,
    why_this_one: whyThisOne,
  };

  setCached(brief, property.id, result);
  return result;
}
