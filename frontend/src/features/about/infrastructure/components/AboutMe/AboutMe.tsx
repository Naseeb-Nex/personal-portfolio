import './AboutMe.css';

export const AboutMe = () => {
  return (
    <section className="about-me-section">
      <div className="about-me-container">
        
        <div className="about-me-grid">
          
          {/* HEADER (Top Left on Desktop) */}
          <div className="about-header">
            <div className="about-tag">
              <span className="dot"></span>
              ABOUT ME
            </div>
            
            <h2 className="about-heading">
              ORCHESTRATING<br />
              REAL <span className="gradient-text">INTELLIGENCE.</span>
            </h2>
          </div>

          {/* LEFT SIDE */}
          <div className="about-left">
            <div className="photo-wrapper">
              {/* Placeholder for the photo */}
              <div className="photo-placeholder"></div>
              
              {/* Circular Badge Sticker */}
              <div className="circular-badge">
                <svg viewBox="0 0 100 100" width="100%" height="100%" className="spinning-text">
                  <defs>
                    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="33%" stopColor="#FF8800" />
                      <stop offset="66%" stopColor="#FF5A00" />
                      <stop offset="100%" stopColor="#CC2200" />
                    </linearGradient>
                  </defs>
                  <path 
                    id="circlePath" 
                    d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" 
                    fill="transparent" 
                  />
                  <text fontSize="9.5" fontWeight="700" letterSpacing="0.1em" fill="url(#textGradient)">
                    <textPath href="#circlePath" startOffset="0%">
                      CURRENTLY RESEARCHING • DEEP IN LATENT SPACE •&nbsp;
                    </textPath>
                  </text>
                </svg>
                {/* Inner dot or icon for the badge */}
                <div className="badge-center"></div>
              </div>
            </div>
          </div>
          
          {/* RIGHT SIDE */}
          <div className="about-right">
            <p>
              I'm <strong>Muhammed Naseeb</strong>, an <strong>AI Engineer</strong> based in Pune. A couple of years deep into <strong>production GenAI</strong>, and I still get a little too obsessed every time a <strong>multi-agent system</strong> successfully reasons its way through a complex handoff.
            </p>
            <p>
              I specialize in the <strong>orchestration layer</strong> of enterprise-grade AI—wiring models to hold deep context, communicate seamlessly behind the scenes, and survive unpredictable edge cases. For me, the goal is simple: reaching the exact moment a pipeline stops feeling like a scripted interface and starts feeling like it is actually thinking.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
