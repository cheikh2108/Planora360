import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message, TypingIndicator, UserPresence } from '@/lib/types-messagerie';
import { TokenStorage } from '@/lib/token-storage';

// WebSocket doit pointer directement vers le backend (le proxy Next.js ne fonctionne pas pour WS)
const SOCKET_URL =
  typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

interface UseMessagerieSocketOptions {
  conversationId?: string;
  onMessage?: (message: Message) => void;
  onTyping?: (indicator: TypingIndicator) => void;
  onUserPresence?: (presence: UserPresence) => void;
  onMessageEdit?: (data: { messageId: string; content: string }) => void;
  onMessageDelete?: (messageId: string) => void;
  onReaction?: (data: { messageId: string; emoji: string; userId: string }) => void;
}

export function useMessagerieSocket(options: UseMessagerieSocketOptions = {}) {
  const {
    conversationId,
    onMessage,
    onTyping,
    onUserPresence,
    onMessageEdit,
    onMessageDelete,
    onReaction,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!conversationId) return;

    // Récupérer le token depuis localStorage
    const token = TokenStorage.getAccessToken();

    if (!token) {
      setError('Authentification requise');
      setIsConnected(false);
      return;
    }

    const socket = io(`${SOCKET_URL}/messagerie`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      query: {
        token, // Envoyer le token pour l'authentification WebSocket
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      // Join conversation room
      socket.emit('conversation:join', { conversationId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err: Error) => {
      setError(err.message);
      setIsConnected(false);
    });

    return () => {
      if (conversationId) {
        socket.emit('conversation:leave', { conversationId });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  // Set up event listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (onMessage) {
      socket.on('message:new', onMessage);
    }

    if (onTyping) {
      socket.on('typing:start', (data: Omit<TypingIndicator, 'isTyping'>) => onTyping({ ...data, isTyping: true }));
      socket.on('typing:stop', (data: Omit<TypingIndicator, 'isTyping'>) => onTyping({ ...data, isTyping: false }));
    }

    if (onUserPresence) {
      socket.on('user:online', (data: Omit<UserPresence, 'isOnline'>) => onUserPresence({ ...data, isOnline: true }));
      socket.on('user:offline', (data: Omit<UserPresence, 'isOnline'>) => onUserPresence({ ...data, isOnline: false }));
    }

    if (onMessageEdit) {
      socket.on('message:edited', onMessageEdit);
    }

    if (onMessageDelete) {
      socket.on('message:deleted', (data: { messageId: string }) => onMessageDelete(data.messageId));
    }

    if (onReaction) {
      socket.on('reaction:added', onReaction);
      socket.on('reaction:removed', onReaction);
    }

    return () => {
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('reaction:added');
      socket.off('reaction:removed');
    };
  }, [onMessage, onTyping, onUserPresence, onMessageEdit, onMessageDelete, onReaction]);

  // Send message
  const sendMessage = useCallback(
    (content: string, options: { parentId?: string; mentionedUserIds?: string[] } = {}) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('message:send', {
        conversationId,
        content,
        ...options,
      });
    },
    [conversationId],
  );

  // Edit message
  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('message:edit', {
        conversationId,
        messageId,
        content,
      });
    },
    [conversationId],
  );

  // Delete message
  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('message:delete', {
        conversationId,
        messageId,
      });
    },
    [conversationId],
  );

  // Mark as read
  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('message:markRead', {
        conversationId,
        messageId,
      });
    },
    [conversationId],
  );

  // Add reaction
  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('reaction:add', {
        conversationId,
        messageId,
        emoji,
      });
    },
    [conversationId],
  );

  // Remove reaction
  const removeReaction = useCallback(
    (messageId: string, reactionId: string) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('reaction:remove', {
        conversationId,
        messageId,
        reactionId,
      });
    },
    [conversationId],
  );

  // Start typing
  const startTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit('typing:start', { conversationId });
  }, [conversationId]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit('typing:stop', { conversationId });
  }, [conversationId]);

  return {
    isConnected,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
  };
}
