import { useState, useEffect } from 'react';
import './RoleScroller.css';

export const RoleScroller = () => {
  const [state, setState] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [activeCycle, setActiveCycle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => (prev === 4 ? 1 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Handle infinite loop jumping
  useEffect(() => {
    if (state === 4) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setState(0);
      }, 600); // Wait for scroll animation to finish
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Restore transition after jumping back to 0
  useEffect(() => {
    if (state === 0 && !isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [state, isTransitioning]);

  // Increment animation cycle every 5 seconds to sync/restart the neon paths
  useEffect(() => {
    const animTimer = setInterval(() => {
      setActiveCycle((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(animTimer);
  }, []);

  // Determine Y offset
  const getScrollPos = () => {
    if (state === 4) return 2;
    if (state >= 1) return 1;
    return 0;
  };

  const transformY = -(getScrollPos() * 36);

  return (
    <div className="scroller-message-box">
      {/* "I'm an" prefix at the top, tiny font */}
      <div className="scroller-prefix-top">I'm an</div>

      {/* Main content row */}
      <div className="scroller-content-row">
        <span className="fixed-ai-text">AI</span>

        {/* Dynamic rolling window */}
        <div className="scroller-dynamic-window">
          <div 
            className="scroller-dynamic-track"
            style={{ 
              transform: `translateY(${transformY}px)`,
              transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)' : 'none'
            }}
          >
            {/* Pos 0: Engineer */}
            <div className="scroller-dynamic-item">
              <span className="dynamic-word engineer-glow">Engineer</span>
            </div>

            {/* Pos 1: Solutions Architect -> Architect -> Researcher */}
            <div className="scroller-dynamic-item">
              <div className={`scroller-solutions-wrapper ${state >= 2 ? 'smash-active' : ''}`}>
                <span className="dynamic-word-solutions">Solutions</span>
              </div>
              
              <div className="glitch-wrapper">
                <span className={`dynamic-word architect-glow glitch-text-old ${state >= 3 ? 'glitching' : ''}`}>Architect</span>
                <span className={`dynamic-word researcher-glow glitch-text-new ${state >= 3 ? 'glitching' : ''}`}>Researcher</span>
              </div>
            </div>

            {/* Pos 2: Engineer (Duplicate for infinite loop) */}
            <div className="scroller-dynamic-item">
              <span className="dynamic-word engineer-glow">Engineer</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connecting solid grey line with shader effect */}
      <svg className="connector-svg" viewBox="0 0 410 92" fill="none" xmlns="http://www.w3.org/2000/svg" key={`svg-${activeCycle}`}>
        {/* Solid grey base line */}
        <path className="base-grey-line" d="M 320,46 L 370,46 L 410,64" />
        {/* Shader effect traveling along the line towards hero */}
        <path className="shader-line-path" d="M 320,46 L 370,46 L 410,64" />
      </svg>
    </div>
  );
};
