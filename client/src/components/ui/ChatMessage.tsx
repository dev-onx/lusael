import { LoadingDots } from './LoadingDots';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-sand flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
          <span className="text-navy text-xs font-semibold">L</span>
        </div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        {isStreaming && content === '' ? (
          <LoadingDots />
        ) : (
          <p className="whitespace-pre-wrap" dir="auto">
            {content}
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-sand ml-0.5 animate-pulse" />}
          </p>
        )}
      </div>
    </div>
  );
}
