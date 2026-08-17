import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './AboutMe.css';

gsap.registerPlugin(ScrollTrigger);

export const AboutMe = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const decorativeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!decorativeRef.current || !sectionRef.current) return;

    gsap.to(decorativeRef.current, {
      y: 120,
      rotation: 90,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }, { scope: sectionRef });

  return (
    <section className="about-me-section" ref={sectionRef}>
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
                  <path 
                    id="circlePath" 
                    d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" 
                    fill="transparent" 
                  />
                  <text fontSize="9.5" fontWeight="700" letterSpacing="0.1em" fill="#FFFFFF">
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
            
            {/* GSAP Decorative Element */}
            <div className="about-decorative" ref={decorativeRef}>
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 0V100M0 50H100" stroke="#040100" strokeOpacity="0.12" strokeWidth="1"/>
                <path d="M15 15L85 85M15 85L85 15" stroke="#040100" strokeOpacity="0.12" strokeWidth="1"/>
                <circle cx="50" cy="50" r="30" stroke="#040100" strokeOpacity="0.12" strokeWidth="1"/>
                <circle cx="50" cy="50" r="10" stroke="#040100" strokeOpacity="0.12" strokeWidth="1"/>
              </svg>
            </div>

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
