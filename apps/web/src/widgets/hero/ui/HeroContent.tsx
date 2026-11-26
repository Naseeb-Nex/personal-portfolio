import { ChatWidget } from '../../../features/chat';
import './HeroContent.css';

export const HeroContent = () => {
  return (
    <div className="hero-content">
      <h1 className="hero-heading">
        <span className="hero-heading-nowrap">AI built for the</span>
        <br />
        <span className="hero-heading-accent">real world</span>
      </h1>

      <p className="hero-subtitle">
        Engineering the Next Wave of AI
      </p>

      <ChatWidget />
    </div>
  );
};
