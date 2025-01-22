export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatMessages: [],
  selectedChatData: undefined,
  dmContacts: [],

  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setDmContacts: (dmContacts) => set({ dmContacts }),

  closeChat: () => {
    set({
      selectedChatType: undefined,
      selectedChatMessages: [],
      selectedChatData: undefined,
    });
  },

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },
});
