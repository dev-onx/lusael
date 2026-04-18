import Anthropic from '@anthropic-ai/sdk';
import type { Response } from 'express';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-sonnet-4-5';

export function sseSetup(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

export function sseSend(res: Response, data: object): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function sseDone(res: Response): void {
  res.write('data: [DONE]\n\n');
  res.end();
}

export async function streamToSSE(
  res: Response,
  messages: Anthropic.MessageParam[],
  systemPrompt: string,
  maxTokens = 1024
): Promise<string> {
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  let fullText = '';

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      fullText += event.delta.text;
      sseSend(res, { type: 'delta', content: event.delta.text });
    }
  }

  return fullText;
}

export async function callClaude(
  messages: Anthropic.MessageParam[],
  systemPrompt: string,
  maxTokens = 512
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}
