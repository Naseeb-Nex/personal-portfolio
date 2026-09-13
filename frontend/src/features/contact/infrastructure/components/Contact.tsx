import { useRef } from 'react';
import { CreativeButton } from '../../../../shared/infrastructure/components/CreativeButton/CreativeButton';
import './Contact.css';

export const Contact = () => {
  const container = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  return (
    <footer className="contact-section" ref={container}>
      <div className="contact-divider"></div>
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title" ref={title}>Let's <span className="contact-gradient">Connect</span></h2>
          <p className="contact-subtitle">Always open to discuss projects, ideas, or opportunities to collaborate.</p>
          <div style={{ marginTop: '32px' }}>
            <CreativeButton href="mailto:muhammednaseeb02@gmail.com">Say Hello</CreativeButton>
          </div>
        </div>
        
        <div className="contact-footer">
          <div className="contact-copy">
            &copy; {new Date().getFullYear()} Muhammed Naseeb. All rights reserved.
          </div>
          <div className="contact-socials">
            <a href="https://www.instagram.com/aiwithnex/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/in/naseeb-nex/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://x.com/Naz__eeb" target="_blank" rel="noreferrer">X</a>
            <a href="https://github.com/Naseeb-Nex" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://leetcode.com/u/NaseebNex/" target="_blank" rel="noreferrer">LeetCode</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
