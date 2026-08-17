import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';
import { useChat } from '../../hooks/useChat';
import { ComponentMap } from '../Cards/Cards';

export const ChatWidget = () => {
  const { isOpen, toggleChat, messages, sendMessage, isTyping, currentThinking } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentThinking, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const renderMessageContent = (msg: any) => {
    if (msg.type === 'ui' && msg.componentData) {
      const DynamicComponent = ComponentMap[msg.componentData.type];
      return (
        <div className="ui-component">
          {DynamicComponent ? (
            <DynamicComponent data={msg.componentData.data} />
          ) : (
            <div className="placeholder-card">
              Unknown Component: {msg.componentData.type}
            </div>
          )}
          {msg.content && <div className="chat-bubble-text" style={{marginTop: '12px'}}>{msg.content}</div>}
        </div>
      );
    }
    return msg.content;
  };

  return (
    <>
      <div className={`chat-widget-loader ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
        <div className="chat-widget-circle">
          {isOpen ? (
            <X className="chat-widget-icon" size={20} />
          ) : (
            <MessageCircle className="chat-widget-icon" size={18} />
          )}
        </div>
      </div>

      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <Sparkles size={16} className="text-primary-orange" />
            <span>AI Assistant</span>
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble-container ${msg.role}`}>
              <div className="chat-bubble">
                {renderMessageContent(msg)}
              </div>
            </div>
          ))}
          {currentThinking && (
            <div className="chat-bubble-container agent">
              <div className="chat-bubble thinking">
                <span className="think-icon">🤔</span> {currentThinking}
              </div>
            </div>
          )}
          {isTyping && !currentThinking && (
            <div className="chat-bubble-container agent">
              <div className="chat-bubble typing">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Message AI..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-send" onClick={handleSend} disabled={!input.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
};
