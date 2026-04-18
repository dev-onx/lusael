import { useEffect, useRef, useState } from 'react';
import type { ChatMessage as ChatMessageType, UserBrief } from '@lusael/shared';
import { ChatMessage } from '../ui/ChatMessage';
import { ChatInput } from '../ui/ChatInput';
import { streamIntakeChat } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

const OPENING_MESSAGE =
  "Hi — I'm Lusael, your Lusail property concierge. Tell me what you're looking for, and I'll ask the questions a great local agent would. Are you thinking of buying, renting, or investing?";

export function IntakeChat() {
  const { intakeMessages, setIntakeMessages, setBrief, setView } = useAppStore();
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const messages: ChatMessageType[] =
    intakeMessages.length === 0
      ? [{ role: 'assistant', content: OPENING_MESSAGE }]
      : intakeMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  async function handleSend(userText: string) {
    if (isStreaming) return;
    setError(null);

    const newMessages: ChatMessageType[] = [
      ...messages,
      { role: 'user', content: userText },
    ];
    setIntakeMessages(newMessages);
    setStreamingContent('');
    setIsStreaming(true);

    let accText = '';
    let detectedBrief: UserBrief | null = null;

    abortRef.current = streamIntakeChat(
      newMessages,
      (delta) => {
        accText += delta;
        const displayText = accText.replace(/BRIEF_JSON:\{[\s\S]*?\}/g, '').trim();
        setStreamingContent(displayText);
      },
      (brief) => {
        detectedBrief = brief;
      },
      () => {
        const displayText = accText.replace(/BRIEF_JSON:\{[\s\S]*?\}/g, '').trim();
        const finalMessages: ChatMessageType[] = [
          ...newMessages,
          { role: 'assistant', content: displayText },
        ];
        setIntakeMessages(finalMessages);
        setStreamingContent('');
        setIsStreaming(false);

        if (detectedBrief) {
          setBrief(detectedBrief);
          setTimeout(() => setView('shortlist'), 800);
        }
      },
      (err) => {
        setError(err);
        setIsStreaming(false);
        setStreamingContent('');
      }
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-2 scrollbar-hide">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {isStreaming && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming
          />
        )}

        {error && (
          <div className="text-red-500 text-sm text-center mt-2 py-2 px-4 bg-red-50 rounded-lg">
            {error}. Please try again.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {isStreaming && (
        <p className="text-center text-xs text-stone-400 pb-1">
          Concierge is thinking…
        </p>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        placeholder="Tell me what you're looking for…"
      />
    </div>
  );
}
