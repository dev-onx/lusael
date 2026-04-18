import { Router } from 'express';
import type { ChatMessage, UserBrief } from '@lusael/shared';
import { properties } from './properties.js';
import { sseSetup, sseSend, sseDone, streamToSSE } from '../services/anthropic.js';

const router = Router();

function buildPropertySystemPrompt(propertyId: string, brief: UserBrief): string {
  const property = properties.find((p) => p.id === propertyId);
  if (!property) return '';

  const monthlyPayment = (price: number, downPct: number) => {
    const principal = price * (1 - downPct / 100);
    const monthlyRate = 0.045 / 12;
    const n = 25 * 12;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return Math.round(payment);
  };

  const monthly25 = monthlyPayment(property.price_qar, 25);
  const monthly20 = monthlyPayment(property.price_qar, 20);

  return `You are Lusael, an expert Lusail property concierge answering questions about one specific property. Be warm, precise, and knowledgeable.

PROPERTY CONTEXT:
${JSON.stringify(property, null, 2)}

USER BRIEF (what they told us they want):
${JSON.stringify(brief, null, 2)}

MORTGAGE REFERENCE (4.5% interest, 25-year term):
- With 25% down (QAR ${Math.round(property.price_qar * 0.25).toLocaleString()}): QAR ${monthly25.toLocaleString()}/month
- With 20% down (QAR ${Math.round(property.price_qar * 0.2).toLocaleString()}): QAR ${monthly20.toLocaleString()}/month
Note: For custom down payments, calculate: principal × (monthly_rate × (1+monthly_rate)^300) / ((1+monthly_rate)^300 - 1) where monthly_rate = 0.045/12

GUIDANCE:
- Answer questions about this specific property honestly and helpfully
- Compare to other Lusail districts/property types when asked
- For "is this overpriced?" questions, reference the district average and rental yield
- For risk questions, mention market factors, liquidity, and the user's specific situation
- Reference their brief details to make answers personal
- For mortgage calculations, show working clearly
- Keep responses focused and under 200 words unless a detailed breakdown is genuinely needed`;
}

router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { messages, brief }: { messages: ChatMessage[]; brief: UserBrief } = req.body;

    const property = properties.find((p) => p.id === id);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    if (!messages || !brief) {
      res.status(400).json({ error: 'messages and brief required' });
      return;
    }

    const systemPrompt = buildPropertySystemPrompt(id, brief);

    sseSetup(res);
    await streamToSSE(
      res,
      messages.map((m) => ({ role: m.role, content: m.content })),
      systemPrompt,
      1024
    );
    sseDone(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    sseSend(res, { type: 'error', error: message });
    sseDone(res);
  }
});

export default router;
