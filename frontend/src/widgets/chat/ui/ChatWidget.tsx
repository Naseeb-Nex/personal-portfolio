import { MessageCircle } from 'lucide-react';
import './ChatWidget.css';

export const ChatWidget = () => {
  return (
    <div className="chat-widget-loader">
      <div className="chat-widget-circle">
        <MessageCircle className="chat-widget-icon" size={18} />
      </div>
    </div>
  );
};
