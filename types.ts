export interface Message {
  id: string;
  sender: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isSystem?: boolean;
  avatarColor?: string;
  senderId?: string;
}

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  discriminator: string;
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}