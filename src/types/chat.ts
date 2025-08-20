/**
 * Chat message role enum
 */
export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

/**
 * Chat message status enum
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  RECEIVED = 'received'
}

/**
 * Individual chat message interface
 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  error?: string;
}

/**
 * Chat conversation interface
 */
export interface ChatConversation {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Chat request payload for API
 */
export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    userInfo?: {
      id: string;
      name?: string;
      role?: string;
    };
    currentPage?: string;
    previousMessages?: ChatMessage[];
  };
}

/**
 * Chat response from API
 */
export interface ChatResponse {
  reply: string;
  conversationId?: string;
  messageId?: string;
  timestamp?: string;
  suggestions?: string[];
  metadata?: {
    model?: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

/**
 * Chat error response
 */
export interface ChatError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
}

/**
 * Chat UI state interface
 */
export interface ChatUIState {
  isOpen: boolean;
  isMinimized: boolean;
  isTyping: boolean;
  isLoading: boolean;
  hasUnreadMessages: boolean;
  unreadCount: number;
}

/**
 * Chat store state interface
 */
export interface ChatState {
  // Current conversation
  currentConversation: ChatConversation | null;
  
  // All conversations
  conversations: ChatConversation[];
  
  // UI state
  ui: ChatUIState;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  clearConversation: () => void;
  createNewConversation: () => void;
  setConversation: (conversationId: string) => void;
  
  // UI actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  minimizeChat: () => void;
  setTyping: (isTyping: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  markAsRead: () => void;
  
  // Utility actions
  getMessageById: (messageId: string) => ChatMessage | undefined;
  getConversationById: (conversationId: string) => ChatConversation | undefined;
  exportConversation: (conversationId?: string) => string;
  importConversation: (data: string) => boolean;
}

/**
 * Chat hook return type
 */
export interface UseChatReturn {
  // State
  currentConversation: ChatConversation | null;
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  isLoading: boolean;
  hasUnreadMessages: boolean;
  unreadCount: number;
  isClient: boolean;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearConversation: () => void;
  markAsRead: () => void;
  
  // Utility
  canSendMessage: boolean;
  lastMessage: ChatMessage | null;
}
