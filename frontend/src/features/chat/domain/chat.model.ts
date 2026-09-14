export type ChatRole = 'user' | 'agent';

export type ChatMessageType = 'text' | 'thinking' | 'ui';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  type: ChatMessageType;
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentData?: any;
}

export interface ChatSession {
  token: string;
  sessionId: string;
}
