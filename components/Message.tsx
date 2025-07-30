import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { UserIcon, BotIcon, PulsingDotsIcon } from './Icons';
import { marked } from 'marked';

interface MessageProps {
  message: Message;
  isLoading?: boolean;
}

const renderer = new marked.Renderer();
const originalCodeRenderer = renderer.code.bind(renderer);


renderer.code = (code: string, lang: string | undefined, isEscaped: boolean) => {
    const rendered = originalCodeRenderer(code, lang, isEscaped);
    // Added relative and group classes for button positioning
    return `<div class="code-block-wrapper relative group">${rendered}<button class="copy-button absolute top-2 right-2 bg-slate-700 text-slate-200 px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity">Copy</button></div>`;
};
marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

const MessageComponent: React.FC<MessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);

  const createMarkup = (content: string) => {
    const sanitizedHtml = marked.parse(content);
    return { __html: sanitizedHtml };
  };

  useEffect(() => {
    // This effect handles adding event listeners for the copy buttons.
    if (contentRef.current) {
        const copyButtons = contentRef.current.querySelectorAll('.copy-button');
        copyButtons.forEach(button => {
            const clickHandler = (e: Event) => {
                const targetButton = e.currentTarget as HTMLButtonElement;
                const code = targetButton.previousElementSibling?.textContent;
                if (code) {
                    navigator.clipboard.writeText(code).then(() => {
                        targetButton.textContent = 'Copied!';
                        setTimeout(() => {
                            targetButton.textContent = 'Copy';
                        }, 2000);
                    });
                }
            };
            // A simple way to prevent adding multiple listeners to the same button
            if (!(button as any).__hasCopyHandler) {
                 button.addEventListener('click', clickHandler);
                 (button as any).__hasCopyHandler = true;
            }
        });
    }
  }, [message.content]);
  

  return (
    <div className={`flex items-start gap-4 animate-fade-in-up ${isUser ? 'justify-end' : ''}`}>
      {/* Bot/User Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-primary order-2' : 'bg-surface order-1'}`}>
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>
      
      {/* Message Bubble */}
      <div className={`max-w-xl lg:max-w-3xl px-5 py-3 rounded-2xl ${isUser ? 'bg-primary text-white rounded-br-none order-1' : 'bg-surface text-text-secondary rounded-bl-none order-2'}`}>
        {isLoading && !message.content ? (
          <PulsingDotsIcon />
        ) : (
          <div 
            ref={contentRef} 
            className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:my-3 prose-headings:my-3 break-words" 
            dangerouslySetInnerHTML={createMarkup(message.content)} 
          />
        )}
      </div>
       <style>{`
        /* Refined Prose styles for better spacing and appearance */
        .prose {
            line-height: 1.6;
        }
        .prose ul, .prose ol {
            padding-left: 1.5rem;
        }
        .prose pre { 
          background-color: #0f172a !important; /* background */
          padding: 1rem; 
          border-radius: 0.5rem; 
          font-size: 0.9em;
          overflow-x: auto; /* Adds horizontal scroll for wide code */
        }
        /* Style for inline code blocks */
        .prose p > code, .prose li > code {
            background-color: #334155;
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 0.85em;
            border-radius: 0.25rem;
        }
        .prose pre > code {
            background-color: transparent !important;
            padding: 0;
        }
       `}</style>
    </div>
  );
};

// Memoization is important here to prevent re-rendering all messages on each token stream.
export default React.memo(MessageComponent);