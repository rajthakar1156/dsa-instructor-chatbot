import React, { useState, useRef, useEffect } from 'react';
import type { ChatSession } from '../types';
import MessageComponent from './Message';
import { SendIcon, BotIcon } from './Icons';

interface ChatViewProps {
  chatSession: ChatSession | undefined;
  onSendMessage: (message: string) => void;
}

const WelcomeScreen: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => {
    const prompts = [
        "Explain Big O notation with an example",
        "How does a hash map work?",
        "Write python code to implement a binary search tree",
        "What are the pros and cons of linked lists vs arrays?"
    ];
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <BotIcon className="w-16 h-16 text-primary mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">DSA Instructor</h1>
            <p className="text-text-secondary max-w-md">
                Start your learning journey. Ask me anything about Data Structures and Algorithms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-12 w-full max-w-3xl">
                {prompts.map((prompt, i) => (
                    <button 
                        key={i}
                        onClick={() => onPromptClick(prompt)}
                        className="p-4 bg-surface rounded-lg text-left hover:bg-muted transition-colors duration-200"
                        aria-label={`Ask: ${prompt}`}
                    >
                        <p className="font-semibold text-text-primary">{prompt}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ChatView: React.FC<ChatViewProps> = ({ chatSession, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSession?.messages, chatSession?.isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && chatSession && !chatSession.isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(e);
    }
  }

  if (!chatSession || (chatSession.messages.length === 0 && !chatSession.isLoading)) {
    return (
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        <WelcomeScreen onPromptClick={(prompt) => {
            if (chatSession && !chatSession.isLoading) {
                onSendMessage(prompt);
            }
        }}/>
        <div className="p-2 sm:p-4 border-t border-surface">
            {/* Show input form on welcome screen too */}
            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-start bg-surface rounded-xl p-2 pr-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Explain what a stack is..."
                rows={1}
                className="flex-1 bg-transparent p-2 resize-none focus:outline-none text-text-primary placeholder:text-subtle max-h-48"
                disabled={chatSession?.isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || chatSession?.isLoading}
                className="p-2 mt-1 rounded-lg bg-primary text-white disabled:bg-subtle disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shrink-0"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {chatSession.messages.map((msg, index) => (
                <MessageComponent 
                    key={index} 
                    message={msg} 
                    isLoading={!!(chatSession.isLoading && msg.role === 'model' && index === chatSession.messages.length - 1)}
                />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
      <div className="p-2 sm:p-4 border-t border-surface">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-start bg-surface rounded-xl p-2 pr-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a follow-up question..."
            rows={1}
            className="flex-1 bg-transparent p-2 resize-none focus:outline-none text-text-primary placeholder:text-subtle max-h-48"
            disabled={chatSession.isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || chatSession.isLoading}
            className="p-2 mt-1 rounded-lg bg-primary text-white disabled:bg-subtle disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shrink-0"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;