import './AboutMe.css';

export const AboutMe = () => {
  return (
    <section className="about-me-section">
      <div className="about-me-container">
        <h2 className="about-me-title">ABOUT ME</h2>
        
        <div className="about-me-grid">
          <div className="about-me-text">
            <p>
              I am an AI engineer and agent builder passionate about creating autonomous systems that push the boundaries of what's possible.
            </p>
            <p className="secondary-text">
              My work focuses on bridging the gap between complex AI models and seamless user experiences, orchestrating multi-agent systems that solve real-world problems. Nothing is arbitrary; everything is relentlessly orchestrated.
            </p>
            <div className="skills-tags">
              <span>Autonomous Agents</span>
              <span>LLM Orchestration</span>
              <span>React</span>
              <span>GSAP</span>
            </div>
          </div>
          
          <div className="about-me-visual">
            <div className="visual-card">
              <div className="noise-overlay"></div>
              <div className="glow-orb"></div>
              <h3>SYSTEM<br/>READY</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
