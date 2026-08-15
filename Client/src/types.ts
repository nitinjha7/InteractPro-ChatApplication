export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  color: number | null;
  profileSetup: boolean;
}

export interface Message {
  id: string;
  sender: string | User;
  recipient: string | User;
  messageType: 'text' | 'file' | 'code';
  content: string | null;
  fileUrl: string | null;
  language?: string | null;
  timeStamp: string;
}

export interface DmContact {
  id: string;
  lastMessageTime: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  image: string | null;
}

export type ChatType = 'dm' | undefined;
