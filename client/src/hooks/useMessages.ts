import { useSyncExternalStore } from "react";
import { monotonicFactory } from "ulid";

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  timestamp: number;
  isRead: boolean;
  isDelivered: boolean;
  editedAt?: number;
}

export interface Participant {
  id: string;
  name: string;
  isOnline: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  participants: Participant[];
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  unreadCount: number;
  isGroup: boolean;
}

export interface UserTyping {
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: number;
}

interface MessagesState {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUserId: string | null;
  currentUserName: string | null;
  isLoading: boolean;
  error: string | null;
  typingUsers: UserTyping[];
}

// API interface che combina state e azioni
export interface MessagesAPI extends MessagesState {
  // User actions
  setCurrentUser: (userId: string, userName: string) => void;

  // Conversation actions
  createConversation: (
    title: string,
    participantIds: string[],
    isGroup?: boolean,
  ) => string;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  addParticipant: (
    conversationId: string,
    participantId: string,
    participantName: string,
  ) => void;
  removeParticipant: (conversationId: string, participantId: string) => void;
  updateParticipantStatus: (
    conversationId: string,
    participantId: string,
    isOnline: boolean,
  ) => void;

  // Message actions
  sendMessage: (
    conversationId: string,
    content: string,
    type?: Message["type"],
  ) => void;
  receiveMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type?: Message["type"],
  ) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  markAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  markAsDelivered: (messageId: string) => void;

  // Typing actions
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  addTypingUser: (
    conversationId: string,
    userId: string,
    userName: string,
  ) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;

  // Global actions
  clearAllConversations: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Selectors
  getActiveConversation: () => Conversation | null;
  getConversationById: (id: string) => Conversation | null;
  getMessages: (conversationId: string) => Message[];
  getUnreadMessages: (conversationId: string) => Message[];
  getTotalUnreadCount: () => number;
  getTypingUsersInConversation: (conversationId: string) => UserTyping[];
}

class MessagesStore {
  private state: MessagesState = {
    conversations: [],
    activeConversationId: null,
    currentUserId: null,
    currentUserName: null,
    isLoading: false,
    error: null,
    typingUsers: [],
  };

  private listeners = new Set<() => void>();
  private cachedApi: MessagesAPI | null = null;

  getState = (): MessagesAPI => {
    if (!this.cachedApi) {
      this.cachedApi = {
        ...this.state,
        setCurrentUser: this.setCurrentUser,
        createConversation: this.createConversation,
        deleteConversation: this.deleteConversation,
        setActiveConversation: this.setActiveConversation,
        updateConversationTitle: this.updateConversationTitle,
        addParticipant: this.addParticipant,
        removeParticipant: this.removeParticipant,
        updateParticipantStatus: this.updateParticipantStatus,
        sendMessage: this.sendMessage,
        receiveMessage: this.receiveMessage,
        editMessage: this.editMessage,
        deleteMessage: this.deleteMessage,
        markAsRead: this.markAsRead,
        markConversationAsRead: this.markConversationAsRead,
        markAsDelivered: this.markAsDelivered,
        startTyping: this.startTyping,
        stopTyping: this.stopTyping,
        addTypingUser: this.addTypingUser,
        removeTypingUser: this.removeTypingUser,
        clearAllConversations: this.clearAllConversations,
        setError: this.setError,
        setLoading: this.setLoading,
        getActiveConversation: this.getActiveConversation,
        getConversationById: this.getConversationById,
        getMessages: this.getMessages,
        getUnreadMessages: this.getUnreadMessages,
        getTotalUnreadCount: this.getTotalUnreadCount,
        getTypingUsersInConversation: this.getTypingUsersInConversation,
      };
    }
    return this.cachedApi;
  };

  setState = (partial: Partial<MessagesState>) => {
    this.state = { ...this.state, ...partial };
    this.cachedApi = null; // Invalidate cache when state changes
    this.listeners.forEach((listener) => listener());
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // User actions
  setCurrentUser = (userId: string, userName: string): void => {
    this.setState({ currentUserId: userId, currentUserName: userName });
  };

  // Conversation actions
  createConversation = (
    title: string,
    participantIds: string[],
    isGroup = false,
  ): string => {
    const ulid = monotonicFactory();
    const participants = participantIds.map((id) => ({
      id,
      name: `User ${id}`, // In una vera app, recupereresti il nome dal backend
      isOnline: false,
    }));

    const newConversation: Conversation = {
      id: ulid(),
      title,
      participants,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unreadCount: 0,
      isGroup,
    };

    this.setState({
      conversations: [...this.state.conversations, newConversation],
      activeConversationId: newConversation.id,
    });

    return newConversation.id;
  };

  deleteConversation = (conversationId: string): void => {
    const filteredConversations = this.state.conversations.filter(
      (conv) => conv.id !== conversationId,
    );

    const newActiveId =
      this.state.activeConversationId === conversationId
        ? filteredConversations[0]?.id || null
        : this.state.activeConversationId;

    this.setState({
      conversations: filteredConversations,
      activeConversationId: newActiveId,
    });
  };

  setActiveConversation = (conversationId: string): void => {
    const conversation = this.state.conversations.find(
      (conv) => conv.id === conversationId,
    );
    if (!conversation) {
      this.setError(`Conversation with id ${conversationId} not found`);
      return;
    }

    this.setState({
      activeConversationId: conversationId,
    });
  };

  updateConversationTitle = (conversationId: string, title: string): void => {
    const updatedConversations = this.state.conversations.map((conv) =>
      conv.id === conversationId
        ? { ...conv, title, updatedAt: Date.now() }
        : conv,
    );

    this.setState({ conversations: updatedConversations });
  };

  addParticipant = (
    conversationId: string,
    participantId: string,
    participantName: string,
  ): void => {
    const updatedConversations = this.state.conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            participants: [
              ...conv.participants,
              { id: participantId, name: participantName, isOnline: false },
            ],
            updatedAt: Date.now(),
          }
        : conv,
    );

    this.setState({ conversations: updatedConversations });
  };

  removeParticipant = (conversationId: string, participantId: string): void => {
    const updatedConversations = this.state.conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            participants: conv.participants.filter(
              (p) => p.id !== participantId,
            ),
            updatedAt: Date.now(),
          }
        : conv,
    );

    this.setState({ conversations: updatedConversations });
  };

  updateParticipantStatus = (
    conversationId: string,
    participantId: string,
    isOnline: boolean,
  ): void => {
    const updatedConversations = this.state.conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            participants: conv.participants.map((p) =>
              p.id === participantId ? { ...p, isOnline } : p,
            ),
            updatedAt: Date.now(),
          }
        : conv,
    );

    this.setState({ conversations: updatedConversations });
  };

  // Message actions
  sendMessage = (
    conversationId: string,
    content: string,
    type: Message["type"] = "text",
  ): void => {
    if (!this.state.currentUserId || !this.state.currentUserName) {
      this.setError("User not logged in");
      return;
    }

    const ulid = monotonicFactory();
    const newMessage: Message = {
      id: ulid(),
      conversationId,
      senderId: this.state.currentUserId,
      senderName: this.state.currentUserName,
      content,
      type,
      timestamp: Date.now(),
      isRead: false,
      isDelivered: true,
    };

    const updatedConversations = this.state.conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            updatedAt: Date.now(),
          }
        : conv,
    );

    this.setState({ conversations: updatedConversations });
  };

  receiveMessage = (
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: Message["type"] = "text",
  ): void => {
    const ulid = monotonicFactory();
    const newMessage: Message = {
      id: ulid(),
      conversationId,
      senderId,
      senderName,
      content,
      type,
      timestamp: Date.now(),
      isRead: false,
      isDelivered: true,
    };

    const updatedConversations = this.state.conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            updatedAt: Date.now(),
            unreadCount: conv.unreadCount + 1,
          }
        : conv,
    );

    this.setState({ conversations: updatedConversations });
  };

  editMessage = (messageId: string, content: string): void => {
    const updatedConversations = this.state.conversations.map((conv) => ({
      ...conv,
      messages: conv.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content, editedAt: Date.now() } : msg,
      ),
    }));

    this.setState({ conversations: updatedConversations });
  };

  deleteMessage = (messageId: string): void => {
    const updatedConversations = this.state.conversations.map((conv) => ({
      ...conv,
      messages: conv.messages.filter((msg) => msg.id !== messageId),
    }));

    this.setState({ conversations: updatedConversations });
  };

  markAsRead = (messageId: string): void => {
    const updatedConversations = this.state.conversations.map((conv) => ({
      ...conv,
      messages: conv.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg,
      ),
    }));

    this.setState({ conversations: updatedConversations });
  };

  markConversationAsRead = (conversationId: string): void => {
    const updatedConversations = this.state.conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            messages: conv.messages.map((msg) => ({ ...msg, isRead: true })),
            unreadCount: 0,
          }
        : conv,
    );

    this.setState({ conversations: updatedConversations });
  };

  markAsDelivered = (messageId: string): void => {
    const updatedConversations = this.state.conversations.map((conv) => ({
      ...conv,
      messages: conv.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isDelivered: true } : msg,
      ),
    }));

    this.setState({ conversations: updatedConversations });
  };

  // Typing actions
  startTyping = (conversationId: string): void => {
    if (!this.state.currentUserId || !this.state.currentUserName) return;

    this.addTypingUser(
      conversationId,
      this.state.currentUserId,
      this.state.currentUserName,
    );
  };

  stopTyping = (conversationId: string): void => {
    if (!this.state.currentUserId) return;

    this.removeTypingUser(conversationId, this.state.currentUserId);
  };

  addTypingUser = (
    conversationId: string,
    userId: string,
    userName: string,
  ): void => {
    const existingTyping = this.state.typingUsers.find(
      (t) => t.userId === userId && t.conversationId === conversationId,
    );

    if (!existingTyping) {
      const newTyping: UserTyping = {
        userId,
        userName,
        conversationId,
        timestamp: Date.now(),
      };

      this.setState({
        typingUsers: [...this.state.typingUsers, newTyping],
      });
    }
  };

  removeTypingUser = (conversationId: string, userId: string): void => {
    const filteredTypingUsers = this.state.typingUsers.filter(
      (t) => !(t.userId === userId && t.conversationId === conversationId),
    );

    this.setState({ typingUsers: filteredTypingUsers });
  };

  // Global actions
  clearAllConversations = (): void => {
    this.setState({
      conversations: [],
      activeConversationId: null,
    });
  };

  setError = (error: string | null): void => {
    this.setState({ error });
  };

  setLoading = (loading: boolean): void => {
    this.setState({ isLoading: loading });
  };

  // Selectors
  getActiveConversation = (): Conversation | null => {
    return (
      this.state.conversations.find(
        (conv) => conv.id === this.state.activeConversationId,
      ) || null
    );
  };

  getConversationById = (id: string): Conversation | null => {
    return this.state.conversations.find((conv) => conv.id === id) || null;
  };

  getMessages = (conversationId: string): Message[] => {
    const conversation = this.getConversationById(conversationId);
    return conversation ? conversation.messages : [];
  };

  getUnreadMessages = (conversationId: string): Message[] => {
    const messages = this.getMessages(conversationId);
    return messages.filter((msg) => !msg.isRead);
  };

  getTotalUnreadCount = (): number => {
    return this.state.conversations.reduce(
      (total, conv) => total + conv.unreadCount,
      0,
    );
  };

  getTypingUsersInConversation = (conversationId: string): UserTyping[] => {
    return this.state.typingUsers.filter(
      (t) => t.conversationId === conversationId,
    );
  };
}

const messagesStore = new MessagesStore();

// Hook principale con selector
export function useMessages<T>(selector: (state: MessagesAPI) => T): T {
  return useSyncExternalStore(
    messagesStore.subscribe,
    () => selector(messagesStore.getState()),
    () => selector(messagesStore.getState()),
  );
}

// Hook senza selector (restituisce tutto lo stato)
export function useMessagesState(): MessagesAPI {
  return useSyncExternalStore(
    messagesStore.subscribe,
    messagesStore.getState,
    messagesStore.getState,
  );
}

// Export del store per uso diretto se necessario
export { messagesStore };
