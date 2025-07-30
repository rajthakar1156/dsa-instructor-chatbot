import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import { sendMessageStream, generateTitle } from './services/geminiService';
import type { ChatSession, Message } from './types';
import { NewChatIcon } from './components/Icons';

const App: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load chats from local storage on initial render
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('dsa-instructor-chats');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats) as ChatSession[];
        setChats(parsedChats.sort((a,b) => (b.lastUpdated || 0) - (a.lastUpdated || 0)));
        if (parsedChats.length > 0) {
            setActiveChatId(parsedChats[0].id);
        }
      }
    } catch (error) {
        console.error("Failed to load chats from local storage", error);
    }
  }, []);

  // Save chats to local storage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
        try {
            localStorage.setItem('dsa-instructor-chats', JSON.stringify(chats));
        } catch (error) {
            console.error("Failed to save chats to local storage", error);
        }
    }
  }, [chats]);

  const createNewChat = useCallback(() => {
    const newChatId = uuidv4();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      isLoading: false,
      lastUpdated: Date.now()
    };
    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChatId(newChatId);
    if(window.innerWidth < 768) { // Close sidebar on mobile after creating new chat
        setIsSidebarOpen(false);
    }
  }, []);
  
  useEffect(() => {
    // If after loading from storage, there are no chats, create one.
    const savedChats = localStorage.getItem('dsa-instructor-chats');
    if (!savedChats) {
      createNewChat();
    }
  }, [createNewChat]);

  const activeChat = chats.find(chat => chat.id === activeChatId);
  
  const handleSendMessage = async (messageContent: string) => {
    if (!activeChatId) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    const botMessage: Message = { role: 'model', content: '' };
    
    // History to be sent to the API, does not include the bot placeholder
    const historyForAPI = [...(activeChat?.messages || []), userMessage];

    // Immediately update the UI with user message and bot placeholder
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage, botMessage],
              isLoading: true,
              lastUpdated: Date.now()
            }
          : chat
      ).sort((a,b) => (b.lastUpdated || 0) - (a.lastUpdated || 0)) // Keep chats sorted by last updated
    );

    // Generate title for new chats
    if (activeChat && activeChat.messages.length === 0) {
      const title = await generateTitle(messageContent);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChatId ? { ...chat, title } : chat
        )
      );
    }

    try {
      // Pass the correct history to the API
      const stream = await sendMessageStream(historyForAPI);
      let streamedContent = '';
      
      for await (const chunk of stream) {
        streamedContent += chunk.text;
        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const newMessages = [...chat.messages];
              // Update the content of the last message (the bot placeholder)
              if (newMessages.length > 0) {
                  newMessages[newMessages.length - 1].content = streamedContent;
              }
              return { ...chat, messages: newMessages };
            }
            return chat;
          })
        );
      }
    } catch (error) {
        console.error("Error sending message:", error);
        setChats(prevChats =>
            prevChats.map(chat => {
              if (chat.id === activeChatId) {
                const newMessages = [...chat.messages];
                if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1].content = "Sorry, I encountered an error. Please check the console or try again.";
                }
                return { ...chat, messages: newMessages };
              }
              return chat;
            })
          );
    } finally {
        setChats(prevChats =>
            prevChats.map(chat =>
              chat.id === activeChatId ? { ...chat, isLoading: false } : chat
            )
          );
    }
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    if(window.innerWidth < 768) { // Close sidebar on mobile
        setIsSidebarOpen(false);
    }
  }

  return (
    <div className="flex h-screen w-screen bg-background font-sans">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col transition-all duration-300">
        <div className="flex items-center p-2 border-b border-surface md:hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-surface">
                <NewChatIcon />
            </button>
            <h1 className="text-lg font-semibold ml-2 text-text-primary truncate">{activeChat?.title || "DSA Instructor"}</h1>
        </div>
        <ChatView
          key={activeChatId} // Re-mounts component on chat change, clearing state
          chatSession={activeChat}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;