export interface Message {
  id: string;
  sender: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isSystem?: boolean;
  avatarColor?: string;
}

export interface User {
  name: string;
  avatarColor: string;
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}