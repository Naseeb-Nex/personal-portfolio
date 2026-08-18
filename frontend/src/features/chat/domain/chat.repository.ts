import type { ChatSession } from './chat.model';

export interface ChatRepository {
  initSession(): Promise<ChatSession>;
  streamChat(
    token: string,
    message: string,
    onChunk: (event: any) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): Promise<void>;
}
