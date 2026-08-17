import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CreativeButton } from '../../../../shared/infrastructure/components/CreativeButton/CreativeButton';
import './Contact.css';

gsap.registerPlugin(useGSAP);

export const Contact = () => {
  const container = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!title.current || !container.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = container.current.getBoundingClientRect();
      
      const x = (clientX - left - width / 2) * 0.05;
      const y = (clientY - top - height / 2) * 0.05;

      gsap.to(title.current, {
        x,
        y,
        duration: 1,
        ease: 'power3.out',
      });
    };

    const handleMouseLeave = () => {
      if (!title.current) return;
      gsap.to(title.current, {
        x: 0,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      });
    };

    const section = container.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      section.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (section) {
        section.removeEventListener('mousemove', handleMouseMove);
        section.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, { scope: container });

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
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://x.com" target="_blank" rel="noreferrer">X</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://leetcode.com" target="_blank" rel="noreferrer">LeetCode</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
