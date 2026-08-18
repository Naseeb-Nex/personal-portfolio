import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Manifesto.css';

gsap.registerPlugin(ScrollTrigger);

export const Manifesto = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!textRef.current) return;

    // Split text logic manually or use words wrapped in spans
    // For simplicity, we just animate opacity of words in a container
    const words = textRef.current.querySelectorAll('.word');
    
    gsap.fromTo(words, 
      {
        opacity: 0.1,
      },
      {
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "bottom 80%",
          scrub: 1,
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div className="manifesto-section" ref={containerRef}>
      <div className="manifesto-tag">
        <span className="dot"></span>
        MANIFESTO
      </div>
      <div className="manifesto-text" ref={textRef}>
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
