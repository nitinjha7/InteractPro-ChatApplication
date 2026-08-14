import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useStore } from '../store/store';
import type { Message, User } from '../types';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

const idOf = (v: string | User) => (typeof v === 'string' ? v : v._id);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const userInfo = useStore((s) => s.userInfo);
  const addMessage = useStore((s) => s.addMessage);

  useEffect(() => {
    if (!userInfo) return;

    const s = io(import.meta.env.VITE_APP_SERVER_URL, {
      withCredentials: true,
      query: { userId: userInfo._id },
    });
    socketRef.current = s;
    setSocket(s);

    s.on('receiveMessage', (message: Message) => {
      const { selectedChatType, selectedChatData } = useStore.getState();
      if (!selectedChatType || !selectedChatData) return;

      const involved =
        selectedChatData._id === idOf(message.sender) ||
        selectedChatData._id === idOf(message.recipient);

      if (involved) addMessage(message);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [userInfo, addMessage]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
