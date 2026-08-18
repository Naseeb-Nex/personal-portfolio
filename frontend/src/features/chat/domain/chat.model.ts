export type ChatRole = 'user' | 'agent';

export type ChatMessageType = 'text' | 'thinking' | 'ui';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  type: ChatMessageType;
  content: string;
  componentData?: any;
}

export interface ChatSession {
  token: string;
  sessionId: string;
}
