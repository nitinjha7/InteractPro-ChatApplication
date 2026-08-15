import { create } from 'zustand';
import type { User, DmContact, Message, ChatType } from '../types';

interface Store {
  userInfo: User | undefined;
  selectedChatType: ChatType;
  selectedChatData: DmContact | User | undefined;
  selectedChatMessages: Message[];
  dmContacts: DmContact[];

  setUserInfo: (user: User | undefined) => void;
  clearUserInfo: () => void;
  setSelectedChatType: (t: ChatType) => void;
  setSelectedChatData: (d: DmContact | User | undefined) => void;
  setSelectedChatMessages: (m: Message[]) => void;
  setDmContacts: (c: DmContact[]) => void;
  closeChat: () => void;
  addMessage: (message: Message) => void;
}

export const useStore = create<Store>((set, get) => ({
  userInfo: undefined,
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  dmContacts: [],

  setUserInfo: (userInfo) => set({ userInfo }),
  clearUserInfo: () => set({ userInfo: undefined }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  setDmContacts: (dmContacts) => set({ dmContacts }),

  closeChat: () =>
    set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] }),

  // socket pushes populated sender/recipient; the list stores raw ids
  addMessage: (message) =>
    set({
      selectedChatMessages: [
        ...get().selectedChatMessages,
        {
          ...message,
          sender: typeof message.sender === 'string' ? message.sender : message.sender.id,
          recipient:
            typeof message.recipient === 'string' ? message.recipient : message.recipient.id,
        },
      ],
    }),
}));
