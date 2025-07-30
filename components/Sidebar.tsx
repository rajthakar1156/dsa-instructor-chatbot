import React from 'react';
import type { ChatSession } from '../types';
import { NewChatIcon, CloseIcon } from './Icons';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, onNewChat, onSelectChat, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`absolute md:relative flex flex-col h-full w-72 bg-surface text-text-secondary p-3 transition-transform duration-300 ease-in-out z-40 border-r border-muted/50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary px-2">Chat History</h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 rounded-full hover:bg-muted">
              <CloseIcon />
          </button>
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center w-full p-3 mb-4 rounded-lg bg-primary text-text-primary hover:bg-primary-hover transition-colors font-semibold"
        >
          <NewChatIcon />
          <span className="ml-3">New Chat</span>
        </button>
        <nav className="flex-1 overflow-y-auto -mr-2 pr-2">
          <ul className="space-y-1">
            {chats.map(chat => (
              <li key={chat.id}>
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left p-3 rounded-lg truncate transition-colors text-sm font-medium ${
                    activeChatId === chat.id ? 'bg-primary/20 text-text-primary' : 'hover:bg-muted/50'
                  }`}
                  title={chat.title}
                >
                  {chat.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pt-2 border-t border-muted/50 flex-shrink-0">
            <p className="text-xs text-center text-subtle">DSA Instructor Bot</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;