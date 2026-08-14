export interface User {
  _id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  color: number | null;
  profileSetup: boolean;
}

export interface Message {
  _id: string;
  sender: string | User;
  recipient: string | User;
  messageType: 'text' | 'file' | 'code';
  content: string | null;
  fileUrl: string | null;
  language?: string | null;
  timeStamp: string;
}

export interface DmContact {
  _id: string;
  lastMessageTime: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  image: string | null;
}

export type ChatType = 'dm' | undefined;
