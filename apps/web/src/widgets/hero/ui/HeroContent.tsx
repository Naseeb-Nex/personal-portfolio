import { ChatWidget } from '../../../features/chat';
import './HeroContent.css';

export const HeroContent = () => {
  return (
    <div className="hero-content">
      <h1 className="hero-heading">
        Engineering the
        <br />
        <span className="hero-heading-accent">Next Wave</span> of AI
      </h1>

      <p className="hero-subheading">
        AI built for the real world
      </p>

      <ChatWidget />
    </div>
  );
};
