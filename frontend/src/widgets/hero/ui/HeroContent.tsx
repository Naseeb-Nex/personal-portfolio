import './HeroContent.css';

const HeroContent = () => {
  return (
    <div className="hero-content">
      <h1 className="hero-heading">
        <span className="hero-heading-nowrap">Building the</span><br />
        <span className="hero-heading-accent">Intelligent</span><br />
        Future.
      </h1>
      <p className="hero-subtitle">
        AI Engineer specialized in designing and deploying high-performance
        large language models and intelligent agents that solve complex
        engineering challenges.
      </p>
      <div className="hero-buttons">
        <button className="btn-primary">
          View Projects <span className="btn-arrow">→</span>
        </button>
        <button className="btn-secondary">
          Read Manifesto
        </button>
      </div>
    </div>
  );
};

export default HeroContent;
