import { useRef } from 'react';
import './Manifesto.css';

export const Manifesto = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="manifesto-section" ref={containerRef}>
      <div className="manifesto-tag">
        <span className="dot"></span>
        MANIFESTO
      </div>
      <div className="manifesto-text">
        <span className="word">I</span> <span className="word">DON’T</span> <span className="word">JUST</span> <span className="word">PROMPT</span> <span className="word">MODELS.</span><br />
        <span className="word">I</span> <span className="word">SPEND</span> <span className="word">MY</span> <span className="word">DAYS</span> <span className="word">WIRING</span><br />
        <span className="word">AUTONOMOUS</span> <span className="word">AGENTS</span> <span className="word">TO</span><br />
        <span className="gradient-group">
          <span className="word">THINK</span> <span className="word">FOR</span> <span className="word">THEMSELVES</span>
        </span><br />
        <span className="word">SEAMLESS</span> <span className="word">ON</span> <span className="word">THE</span> <span className="word">SURFACE,</span><br />
        <span className="word">RELENTLESSLY</span> <span className="word">ORCHESTRATED</span> <span className="word">UNDERNEATH.</span>
      </div>
    </div>
  );
};
