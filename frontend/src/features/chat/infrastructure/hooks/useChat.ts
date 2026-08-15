import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatSession } from '../../domain/chat.model';
import { chatApiRepository } from '../api/chat.api-repository';

export const useChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<string | null>(null);

  useEffect(() => {
    chatApiRepository.initSession()
      .then(sess => {
        setSession(sess);
        localStorage.setItem('chat_token', sess.token);
        
        setMessages([{
          id: 'init',
          role: 'agent',
          type: 'text',
          content: 'Hello! I am your AI assistant. How can I help you build the intelligent future today?'
        }]);
      })
      .catch(console.error);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!session) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', type: 'text', content };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setCurrentThinking(null);

    const currentBotMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: currentBotMsgId, role: 'agent', type: 'text', content: '' }]);

    await chatApiRepository.streamChat(
      session.token,
      content,
      (chunk) => {
        if (chunk.type === 'thinking') {
          setCurrentThinking(chunk.content);
        } else if (chunk.type === 'text') {
          setMessages(prev => prev.map(m => {
            if (m.id === currentBotMsgId) {
              return { ...m, content: (m.content || '') + chunk.content, type: 'text' };
            }
            return m;
          }));
        } else if (chunk.type === 'ui') {
          setMessages(prev => prev.map(m => {
            if (m.id === currentBotMsgId) {
              return { ...m, type: 'ui', componentData: chunk };
            }
            return m;
          }));
        }
      },
      () => {
        setIsTyping(false);
        setCurrentThinking(null);
      },
      (error) => {
        console.error(error);
        setIsTyping(false);
        setCurrentThinking(null);
        setMessages(prev => {
          const newArr = [...prev];
          const last = newArr[newArr.length - 1];
          if (last && last.id === currentBotMsgId && !last.content) {
            last.content = 'Sorry, an error occurred.';
          }
          return newArr;
        });
      }
    );
  }, [session]);

  const toggleChat = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    toggleChat,
    messages,
    sendMessage,
    isTyping,
    currentThinking
  };
};
