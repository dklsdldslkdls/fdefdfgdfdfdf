import { createContext, useContext, ReactNode, useEffect } from "react";
import { useMessages, useMessagesState } from "./useMessages";
import { monotonicFactory } from "ulid";

// Context per l'integrazione con React
const MessagesContext = createContext<any>(undefined);

interface MessagesProviderProps {
  children: ReactNode;
}

// Provider opzionale per React Context integration
export function MessagesProvider({ children }: MessagesProviderProps) {
  const messagesState = useMessagesState();
  // const { sendMessage, receiveMessage } = useMessageActions();
  // const { createConversation } = useConversationActions();
  // const { setCurrentUser } = useUserActions();
  // const {
  //   simulateTypingThenMessage,
  //   simulateExternalUserTyping,
  //   simulateRealisticTyping,
  //   simulateRandomTypingPause,
  // } = useMessageSimulation();

  // useEffect(() => {
  //   const ulid = monotonicFactory();
  //   setCurrentUser("user123", "Mario Rossi");
  //   const chatId = createConversation(ulid(), ["test2123"], false);
  //   sendMessage(chatId, "Hi Jessica!", "text");

  //   setTimeout(() => {
  //     simulateRealisticTyping(
  //       chatId,
  //       "test2123",
  //       "Alice",
  //       [
  //         "Hi Mario! How are you?",
  //         "I was just thinking about our last conversation",
  //         "Are you free to chat now?",
  //       ],
  //       2000, // Start after 2 seconds
  //     );
  //   }, 1000);

  //   setTimeout(() => {
  //     simulateRandomTypingPause(
  //       chatId,
  //       "test2123",
  //       "Alice",
  //       "This message has realistic typing pauses... like a real person!",
  //     );
  //   }, 1000);

  //   setTimeout(() => {
  //     simulateExternalUserTyping(chatId, "test2123", "Alice", 5000); // 5 seconds of typing
  //   }, 30000);
  // }, []);

  return (
    <MessagesContext.Provider value={messagesState}>
      {children}
    </MessagesContext.Provider>
  );
}

// Hook per usare il context (alternativa ai selectors diretti)
export function useMessagesContext() {
  const context = useContext(MessagesContext);

  if (context === undefined) {
    throw new Error(
      "useMessagesContext must be used within a MessagesProvider",
    );
  }

  return context;
}

// Hook di convenienza per azioni utente
export function useUserActions() {
  const setCurrentUser = useMessages((state) => state.setCurrentUser);
  const currentUserId = useMessages((state) => state.currentUserId);
  const currentUserName = useMessages((state) => state.currentUserName);

  return {
    setCurrentUser,
    currentUserId,
    currentUserName,
    isLoggedIn: !!currentUserId,
  };
}

// Hook di convenienza per azioni conversazione
export function useConversationActions() {
  const createConversation = useMessages((state) => state.createConversation);
  const deleteConversation = useMessages((state) => state.deleteConversation);
  const setActiveConversation = useMessages(
    (state) => state.setActiveConversation,
  );
  const updateConversationTitle = useMessages(
    (state) => state.updateConversationTitle,
  );
  const clearAllConversations = useMessages(
    (state) => state.clearAllConversations,
  );
  const addParticipant = useMessages((state) => state.addParticipant);
  const removeParticipant = useMessages((state) => state.removeParticipant);
  const updateParticipantStatus = useMessages(
    (state) => state.updateParticipantStatus,
  );

  return {
    createConversation,
    deleteConversation,
    setActiveConversation,
    updateConversationTitle,
    clearAllConversations,
    addParticipant,
    removeParticipant,
    updateParticipantStatus,
  };
}

// Hook di convenienza per azioni messaggio
export function useMessageActions() {
  const sendMessage = useMessages((state) => state.sendMessage);
  const receiveMessage = useMessages((state) => state.receiveMessage);
  const editMessage = useMessages((state) => state.editMessage);
  const deleteMessage = useMessages((state) => state.deleteMessage);
  const markAsRead = useMessages((state) => state.markAsRead);
  const markConversationAsRead = useMessages(
    (state) => state.markConversationAsRead,
  );
  const markAsDelivered = useMessages((state) => state.markAsDelivered);

  return {
    sendMessage,
    receiveMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    markConversationAsRead,
    markAsDelivered,
  };
}

// Hook di utilità per simulare messaggi in arrivo
export function useMessageSimulation() {
  const { receiveMessage } = useMessageActions();
  const { createConversation } = useConversationActions();
  const { addTypingUser, removeTypingUser } = useTypingActions();

  const simulateIncomingMessage = (
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: "text" | "image" | "file" | "system" = "text",
  ) => {
    receiveMessage(conversationId, senderId, senderName, content, type);
  };

  const simulateIncomingMessageWithDelay = (
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    delayMs: number = 2000,
    type: "text" | "image" | "file" | "system" = "text",
  ) => {
    setTimeout(() => {
      receiveMessage(conversationId, senderId, senderName, content, type);
    }, delayMs);
  };

  const simulateNewUserConversation = (
    userName: string,
    userId: string,
    initialMessage: string,
  ) => {
    const conversationId = createConversation(
      `Chat with ${userName}`,
      [userId],
      false,
    );
    setTimeout(() => {
      receiveMessage(conversationId, userId, userName, initialMessage);
    }, 1000);
    return conversationId;
  };

  const simulateExternalUserTyping = (
    conversationId: string,
    userId: string,
    userName: string,
    duration: number = 3000,
  ) => {
    // Start typing
    addTypingUser(conversationId, userId, userName);

    // Stop typing after duration
    setTimeout(() => {
      removeTypingUser(conversationId, userId);
    }, duration);
  };

  const simulateTypingThenMessage = (
    conversationId: string,
    userId: string,
    userName: string,
    message: string,
    typingDuration: number = 2000,
  ) => {
    // Start typing
    addTypingUser(conversationId, userId, userName);

    // Send message after typing duration
    setTimeout(() => {
      removeTypingUser(conversationId, userId);
      receiveMessage(conversationId, userId, userName, message);
    }, typingDuration);
  };

  const simulateRealisticTyping = (
    conversationId: string,
    userId: string,
    userName: string,
    messages: string[],
    baseDelay: number = 1000,
  ) => {
    let currentDelay = baseDelay;

    messages.forEach((message, index) => {
      setTimeout(() => {
        // Start typing
        addTypingUser(conversationId, userId, userName);

        // Calculate typing duration based on message length
        const typingDuration = Math.max(1000, message.length * 50);

        setTimeout(() => {
          removeTypingUser(conversationId, userId);
          receiveMessage(conversationId, userId, userName, message);
        }, typingDuration);
      }, currentDelay);

      // Add delay for next message (typing time + pause between messages)
      currentDelay += Math.max(1000, messages[index].length * 50) + 2000;
    });
  };

  const simulateRandomTypingPause = (
    conversationId: string,
    userId: string,
    userName: string,
    message: string,
  ) => {
    addTypingUser(conversationId, userId, userName);

    const pauses = [500, 1200, 800];
    let currentPause = 0;

    pauses.forEach((pause, _) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          removeTypingUser(conversationId, userId);
          setTimeout(() => {
            addTypingUser(conversationId, userId, userName);
          }, 300);
        }
      }, currentPause);
      currentPause += pause;
    });

    // Send final message
    setTimeout(() => {
      removeTypingUser(conversationId, userId);
      receiveMessage(conversationId, userId, userName, message);
    }, currentPause + 1000);
  };

  return {
    simulateIncomingMessage,
    simulateIncomingMessageWithDelay,
    simulateNewUserConversation,
    simulateExternalUserTyping,
    simulateTypingThenMessage,
    simulateRealisticTyping,
    simulateRandomTypingPause,
  };
}

// Hook di convenienza per typing indicators
export function useTypingActions() {
  const startTyping = useMessages((state) => state.startTyping);
  const stopTyping = useMessages((state) => state.stopTyping);
  const addTypingUser = useMessages((state) => state.addTypingUser);
  const removeTypingUser = useMessages((state) => state.removeTypingUser);
  const getTypingUsersInConversation = useMessages(
    (state) => state.getTypingUsersInConversation,
  );

  return {
    startTyping,
    stopTyping,
    addTypingUser,
    removeTypingUser,
    getTypingUsersInConversation,
  };
}

// Hook per conversazione attiva
export function useActiveConversation() {
  const activeConversationId = useMessages(
    (state) => state.activeConversationId,
  );

  const conversations = useMessages((state) => state.conversations);
  const typingUsersAll = useMessages((state) => state.typingUsers);

  const activeConversation =
    conversations.find((conv) => conv.id === activeConversationId) || null;

  const messages = activeConversation ? activeConversation.messages : [];

  const unreadMessages = activeConversation
    ? activeConversation.messages.filter((msg) => !msg.isRead)
    : [];

  const typingUsers = activeConversationId
    ? typingUsersAll.filter((t) => t.conversationId === activeConversationId)
    : [];

  return {
    activeConversationId,
    activeConversation,
    messages,
    unreadMessages,
    typingUsers,
    hasUnread: unreadMessages.length > 0,
    isTyping: typingUsers.length > 0,
  };
}

// Hook per lista conversazioni
export function useConversationsList() {
  const conversations = useMessages((state) => state.conversations);
  const isLoading = useMessages((state) => state.isLoading);
  const error = useMessages((state) => state.error);
  const getTotalUnreadCount = useMessages((state) => state.getTotalUnreadCount);

  const totalUnread = getTotalUnreadCount();

  // Ordina per ultimo messaggio
  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  return {
    conversations: sortedConversations,
    isLoading,
    error,
    count: conversations.length,
    totalUnread,
    hasUnread: totalUnread > 0,
  };
}

// Hook per una conversazione specifica
export function useConversation(conversationId: string | null) {
  const conversations = useMessages((state) => state.conversations);
  const typingUsersAll = useMessages((state) => state.typingUsers);

  if (!conversationId) {
    return {
      conversation: null,
      messages: [],
      unreadMessages: [],
      typingUsers: [],
      hasUnread: false,
      isTyping: false,
    };
  }

  const conversation =
    conversations.find((conv) => conv.id === conversationId) || null;
  const messages = conversation ? conversation.messages : [];
  const unreadMessages = conversation
    ? conversation.messages.filter((msg) => !msg.isRead)
    : [];
  const typingUsers = typingUsersAll.filter(
    (t) => t.conversationId === conversationId,
  );

  return {
    conversation,
    messages,
    unreadMessages,
    typingUsers,
    hasUnread: unreadMessages.length > 0,
    isTyping: typingUsers.length > 0,
  };
}

// Hook per stati globali
export function useMessagesStatus() {
  const isLoading = useMessages((state) => state.isLoading);
  const error = useMessages((state) => state.error);
  const setError = useMessages((state) => state.setError);
  const setLoading = useMessages((state) => state.setLoading);

  return {
    isLoading,
    error,
    setError,
    setLoading,
    hasError: !!error,
  };
}
