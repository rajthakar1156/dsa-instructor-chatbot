export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isLoading: boolean;
  lastUpdated?: number; // Added for sorting
}