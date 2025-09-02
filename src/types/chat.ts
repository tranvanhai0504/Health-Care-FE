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
  // Optional image attachment URL
  imageUrl?: string;
  timestamp: Date;
  status: MessageStatus;
  error?: string;
  // Optional form response for interactive actions
  formResponse?: FormResponse;
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
  image?: File; // optional image file to send with the message
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
 * Schedule form data structure
 */
export interface ScheduleFormData {
  dayOffset: number;
  packageId: string;
  status: string;
  timeOffset: number;
  type: string;
  weekPeriod: {
    from: string;
    to: string;
  };
}

/**
 * Special form response structure
 */
export interface FormResponse {
  type: "form";
  data: ScheduleFormData;
  action: "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
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
  // Special form response for interactive actions
  formResponse?: FormResponse;
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
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
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
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearConversation: () => void;
  markAsRead: () => void;
  
  // Utility
  canSendMessage: boolean;
  lastMessage: ChatMessage | null;
}
