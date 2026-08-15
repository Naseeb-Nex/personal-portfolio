import { ChatWidget } from '../../../../chat/infrastructure/components/ChatWidget';
import './HeroContent.css';

export const HeroContent = () => {
  return (
    <div className="hero-content">
      <h1 className="hero-heading">
        <span className="hero-heading-nowrap">Building the</span><br />
        <span className="hero-heading-accent">Intelligent</span><br />
        Future.
      </h1>

      <ChatWidget />
    </div>
  );
};
