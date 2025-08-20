# AI Chat Component

A comprehensive AI chat popup window for the healthcare application dashboard.

## Features

- **Floating Chat Button**: Always accessible chat button in the bottom-left corner
- **Popup Chat Window**: Clean, responsive chat interface
- **Real-time Messaging**: Send messages to AI and receive responses
- **Message History**: Persistent conversation storage using Zustand
- **Typing Indicators**: Visual feedback when AI is processing
- **Error Handling**: Retry failed messages with user-friendly error messages
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Components

### FloatingChatButton
- Floating action button to open/close chat
- Shows unread message count with badge
- Pulse animation for new messages
- Tooltip on hover

### ChatPopup
- Main chat window with header, messages, and input
- Clear conversation functionality
- Close/minimize controls
- Message counter in header

### MessageList
- Scrollable message history
- Welcome message with suggested questions
- Typing indicator with animation
- Auto-scroll to latest messages

### MessageItem
- Individual message display for user and AI
- Status indicators (sending, sent, failed)
- Retry functionality for failed messages
- Timestamp display

### MessageInput
- Auto-resizing textarea
- Character counter (2000 limit)
- Send button with loading state
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## Usage

The chat components are automatically included in the dashboard layout. Users can:

1. Click the floating chat button to open the chat
2. Type messages and press Enter to send
3. View AI responses in real-time
4. Retry failed messages
5. Clear conversation history
6. Close chat when done

## API Integration

The chat service automatically tries multiple endpoints to find the correct one:

1. `/api/v1/chat` (primary)
2. `/chat` (fallback)
3. `/api/chat` (fallback)
4. `/api/v1/ai/chat` (fallback)

### Expected API Response Format

```json
{
  "data": {
    "reply": "AI response message here"
  },
  "msg": "OK",
  "code": 200
}
```

### Request Format

```json
{
  "message": "User message here"
}
```

### Troubleshooting

If you see "Chat service is not available" errors:

1. Check the browser console for detailed endpoint information
2. Verify the backend chat endpoint is running
3. Ensure the endpoint matches one of the tried endpoints
4. Check network tab for the actual HTTP status codes

### Additional Endpoints (Future)

- **GET /chat/conversation/{id}**: Retrieve conversation history
- **DELETE /chat/conversation/{id}**: Delete conversation
- **GET /chat/conversations**: List user conversations
- **GET /chat/suggestions**: Get contextual suggestions

## State Management

Uses Zustand for state management with persistence:

- Message history stored locally
- UI state (open/closed, typing, loading)
- Conversation management
- Unread message tracking

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line in message
- **Escape**: Close chat (when focused)

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements
- High contrast support
- Focus management
