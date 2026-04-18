import type { ChatMessage, UserBrief, ScoredProperty, CompareRequest } from '@lusael/shared';

const BASE = '/api';

export async function fetchProperties() {
  const res = await fetch(`${BASE}/properties`);
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

export async function fetchRecommendations(
  brief: UserBrief,
  offset = 0,
  mode: 'standard' | 'more' | 'wildcards' = 'standard'
): Promise<ScoredProperty[]> {
  const res = await fetch(`${BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief, offset, mode }),
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchCompare(
  payload: CompareRequest
): Promise<{ properties: ScoredProperty[]; tradeoff: string }> {
  const res = await fetch(`${BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to fetch comparison');
  return res.json();
}

export function streamIntakeChat(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  onBrief: (brief: UserBrief) => void,
  onDone: () => void,
  onError: (err: string) => void
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE}/chat/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'delta') onDelta(parsed.content);
            else if (parsed.type === 'brief') onBrief(parsed.brief);
            else if (parsed.type === 'error') onError(parsed.error);
          } catch { /* skip malformed */ }
        }
      }
      onDone();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        onError(err instanceof Error ? err.message : 'Stream error');
      }
    }
  })();

  return controller;
}

export function streamPropertyChat(
  propertyId: string,
  messages: ChatMessage[],
  brief: UserBrief,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE}/chat/property/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, brief }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'delta') onDelta(parsed.content);
            else if (parsed.type === 'error') onError(parsed.error);
          } catch { /* skip malformed */ }
        }
      }
      onDone();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        onError(err instanceof Error ? err.message : 'Stream error');
      }
    }
  })();

  return controller;
}
