import { useRef, useState, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '@lusael/shared';
import { ChatMessage } from '../ui/ChatMessage';
import { ChatInput } from '../ui/ChatInput';
import { streamPropertyChat } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

export function PropertyChat() {
  const { activeProperty, brief } = useAppStore();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const openingMsg = activeProperty
    ? `I know this property well — ${activeProperty.title} in ${activeProperty.district}. What would you like to know? I can calculate mortgage payments, compare it to other districts, flag risks, or break down why it scored ${activeProperty.scores.lifestyle_score}/100 on lifestyle fit.`
    : '';

  const allMessages: ChatMessageType[] = [
    { role: 'assistant', content: openingMsg },
    ...messages,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, streamingContent]);

  useEffect(() => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  }, [activeProperty?.id]);

  async function handleSend(userText: string) {
    if (!activeProperty || !brief || isStreaming) return;
    setError(null);

    const newMessages: ChatMessageType[] = [
      ...messages,
      { role: 'user', content: userText },
    ];
    setMessages(newMessages);
    setStreamingContent('');
    setIsStreaming(true);

    let accText = '';

    abortRef.current = streamPropertyChat(
      activeProperty.id,
      [...allMessages.slice(1), { role: 'user', content: userText }],
      brief,
      (delta) => {
        accText += delta;
        setStreamingContent(accText);
      },
      () => {
        setMessages([...newMessages, { role: 'assistant', content: accText }]);
        setStreamingContent('');
        setIsStreaming(false);
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
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-hide">
        {allMessages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {isStreaming && (
          <ChatMessage role="assistant" content={streamingContent} isStreaming />
        )}

        {error && (
          <div className="text-red-500 text-sm text-center mt-2 py-2 px-4 bg-red-50 rounded-lg">
            {error}
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
        disabled={isStreaming || !brief}
        placeholder="Ask anything about this property…"
      />
    </div>
  );
}
