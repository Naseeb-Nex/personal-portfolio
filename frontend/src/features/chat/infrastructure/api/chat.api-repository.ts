import type { ChatRepository } from '../../domain/chat.repository';
import type { ChatSession } from '../../domain/chat.model';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const chatApiRepository: ChatRepository = {
  async initSession(): Promise<ChatSession> {
    const res = await fetch(`${API_BASE_URL}/session/init`, { method: 'POST' });
    if (!res.ok) {
      throw new Error(`API /session/init failed with status ${res.status}`);
    }
    const data = await res.json();
    return { token: data.token, sessionId: data.session_id };
  },

  async streamChat(token: string, message: string, onChunk: (event: any) => void, onDone: () => void, onError: (error: Error) => void): Promise<void> {
    try {
      // Real Backend Integration
      const res = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!res.ok) throw new Error('Stream failed');
      if (!res.body) throw new Error('No readable stream');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onDone();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        
        for (const part of parts) {
          if (part.trim() === '[DONE]' || part.trim() === 'data: [DONE]') {
            onDone();
            return;
          }
          if (part.startsWith('data: ')) {
            const dataStr = part.substring(6).trim();
            if (!dataStr) continue;
            try {
              const parsed = JSON.parse(dataStr);
              onChunk(parsed);
            } catch (e) {
              console.error('Failed to parse chunk', dataStr, e);
            }
          }
        }
      }
    } catch (e) {
      onError(e instanceof Error ? e : new Error(String(e)));
    }
  }
};
