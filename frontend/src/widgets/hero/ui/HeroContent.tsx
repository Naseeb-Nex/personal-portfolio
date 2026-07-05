import { ChatWidget } from '../../chat/ui';
import './HeroContent.css';

const HeroContent = () => {
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

export default HeroContent;
