import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ChatState, 
  ChatConversation, 
  ChatMessage, 
  ChatRole, 
  MessageStatus,
  ChatUIState 
} from '@/types/chat';
import { chatService } from '@/services/chat.service';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial UI state
const initialUIState: ChatUIState = {
  isOpen: false,
  isMinimized: false,
  isTyping: false,
  isLoading: false,
  hasUnreadMessages: false,
  unreadCount: 0,
};

// Create initial conversation
const createInitialConversation = (): ChatConversation => ({
  id: generateId(),
  title: 'New Conversation',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
});

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentConversation: createInitialConversation(),
      conversations: [],
      ui: initialUIState,

      // Message actions
      sendMessage: async (message: string, imageFile?: File | null) => {
        const state = get();
        const conversationId = state.currentConversation?.id;
        
        if (!conversationId || (!message.trim() && !imageFile)) return;

        // Add user message immediately
        const userMessage: ChatMessage = {
          id: generateId(),
          role: ChatRole.USER,
          content: message.trim(),
          timestamp: new Date(),
          status: MessageStatus.SENDING,
          imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
        };

        // Update state with user message and loading state
        set((state) => ({
          currentConversation: state.currentConversation ? {
            ...state.currentConversation,
            messages: [...state.currentConversation.messages, userMessage],
            updatedAt: new Date(),
          } : null,
          ui: {
            ...state.ui,
            isLoading: true,
            isTyping: true,
          }
        }));

        try {
          // Mark user message as sent
          get().updateMessage(userMessage.id, { status: MessageStatus.SENT });

          // Send to API
          const response = await chatService.sendMessage({
            message: message.trim(),
            image: imageFile || undefined,
            conversationId,
            context: {
              currentPage: window.location.pathname,
              previousMessages: state.currentConversation?.messages.slice(-5) || [],
            }
          });

          // Add AI response
          const aiMessage: ChatMessage = {
            id: response.messageId || generateId(),
            role: ChatRole.ASSISTANT,
            content: response.reply,
            timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
            status: MessageStatus.RECEIVED,
            // Store form response if present
            formResponse: response.formResponse,
          };

          set((state) => ({
            currentConversation: state.currentConversation ? {
              ...state.currentConversation,
              messages: [...state.currentConversation.messages, aiMessage],
              updatedAt: new Date(),
            } : null,
            ui: {
              ...state.ui,
              isLoading: false,
              isTyping: false,
              hasUnreadMessages: !state.ui.isOpen,
              unreadCount: state.ui.isOpen ? 0 : state.ui.unreadCount + 1,
            }
          }));

        } catch (error) {
          console.error('Failed to send message:', error);
          
          // Mark user message as failed
          get().updateMessage(userMessage.id, { 
            status: MessageStatus.FAILED,
            error: error instanceof Error ? error.message : 'Failed to send message'
          });

          // Reset loading state
          set((state) => ({
            ui: {
              ...state.ui,
              isLoading: false,
              isTyping: false,
            }
          }));
        }
      },

      addMessage: (messageData) => {
        const message: ChatMessage = {
          ...messageData,
          id: generateId(),
          timestamp: new Date(),
        };

        set((state) => ({
          currentConversation: state.currentConversation ? {
            ...state.currentConversation,
            messages: [...state.currentConversation.messages, message],
            updatedAt: new Date(),
          } : null,
        }));
      },

      updateMessage: (messageId, updates) => {
        set((state) => ({
          currentConversation: state.currentConversation ? {
            ...state.currentConversation,
            messages: state.currentConversation.messages.map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: new Date(),
          } : null,
        }));
      },

      deleteMessage: (messageId) => {
        set((state) => ({
          currentConversation: state.currentConversation ? {
            ...state.currentConversation,
            messages: state.currentConversation.messages.filter(msg => msg.id !== messageId),
            updatedAt: new Date(),
          } : null,
        }));
      },

      clearConversation: () => {
        set((state) => ({
          currentConversation: state.currentConversation ? {
            ...state.currentConversation,
            messages: [],
            updatedAt: new Date(),
          } : null,
        }));
      },

      createNewConversation: () => {
        const newConversation = createInitialConversation();
        set((state) => ({
          currentConversation: newConversation,
          conversations: [
            ...state.conversations.map(conv => ({ ...conv, isActive: false })),
            newConversation
          ],
        }));
      },

      setConversation: (conversationId) => {
        set((state) => {
          const conversation = state.conversations.find(conv => conv.id === conversationId);
          if (conversation) {
            return {
              currentConversation: { ...conversation, isActive: true },
              conversations: state.conversations.map(conv => ({
                ...conv,
                isActive: conv.id === conversationId
              })),
            };
          }
          return state;
        });
      },

      // UI actions
      toggleChat: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            isOpen: !state.ui.isOpen,
            isMinimized: false,
            hasUnreadMessages: false,
            unreadCount: 0,
          }
        }));
      },

      openChat: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            isOpen: true,
            isMinimized: false,
            hasUnreadMessages: false,
            unreadCount: 0,
          }
        }));
      },

      closeChat: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            isOpen: false,
            isMinimized: false,
          }
        }));
      },

      minimizeChat: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            isMinimized: !state.ui.isMinimized,
          }
        }));
      },

      setTyping: (isTyping) => {
        set((state) => ({
          ui: {
            ...state.ui,
            isTyping,
          }
        }));
      },

      setLoading: (isLoading) => {
        set((state) => ({
          ui: {
            ...state.ui,
            isLoading,
          }
        }));
      },

      markAsRead: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            hasUnreadMessages: false,
            unreadCount: 0,
          }
        }));
      },

      // Utility actions
      getMessageById: (messageId) => {
        const state = get();
        return state.currentConversation?.messages.find(msg => msg.id === messageId);
      },

      getConversationById: (conversationId) => {
        const state = get();
        return state.conversations.find(conv => conv.id === conversationId);
      },

      exportConversation: (conversationId) => {
        const state = get();
        const conversation = conversationId 
          ? state.conversations.find(conv => conv.id === conversationId)
          : state.currentConversation;
        
        if (!conversation) return '';
        
        return JSON.stringify(conversation, null, 2);
      },

      importConversation: (data) => {
        try {
          const conversation: ChatConversation = JSON.parse(data);
          if (conversation.id && conversation.messages) {
            set((state) => ({
              conversations: [...state.conversations, conversation],
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        currentConversation: state.currentConversation,
        conversations: state.conversations,
        // Don't persist UI state to avoid hydration issues
      }),
      onRehydrateStorage: () => (state) => {
        // Always reset UI state to initial values after hydration
        if (state) {
          state.ui = initialUIState;

          // Fix any invalid timestamps that might have been corrupted during serialization
          if (state.currentConversation) {
            state.currentConversation.messages = state.currentConversation.messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp || Date.now())
            }));
            state.currentConversation.createdAt = state.currentConversation.createdAt instanceof Date
              ? state.currentConversation.createdAt
              : new Date(state.currentConversation.createdAt || Date.now());
            state.currentConversation.updatedAt = state.currentConversation.updatedAt instanceof Date
              ? state.currentConversation.updatedAt
              : new Date(state.currentConversation.updatedAt || Date.now());
          }

          state.conversations = state.conversations.map(conv => ({
            ...conv,
            messages: conv.messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp || Date.now())
            })),
            createdAt: conv.createdAt instanceof Date ? conv.createdAt : new Date(conv.createdAt || Date.now()),
            updatedAt: conv.updatedAt instanceof Date ? conv.updatedAt : new Date(conv.updatedAt || Date.now())
          }));
        }
      },
    }
  )
);
