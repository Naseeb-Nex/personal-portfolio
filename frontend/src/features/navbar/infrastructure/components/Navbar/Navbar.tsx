const STATIC_PARTICLES = [
  { id: 0, x: 25, y: 15, size: '0.24', delay: '0.30', duration: '1.80', originX: 320, originY: 450 },
  { id: 1, x: 75, y: 40, size: '0.18', delay: '1.10', duration: '2.10', originX: 510, originY: 280 },
  { id: 2, x: 45, y: 80, size: '0.30', delay: '0.75', duration: '1.60', originX: 230, originY: 600 },
  { id: 3, x: 60, y: 20, size: '0.22', delay: '1.50', duration: '2.40', originX: 420, originY: 350 },
  { id: 4, x: 15, y: 65, size: '0.27', delay: '0.20', duration: '1.90', originX: 380, originY: 520 },
  { id: 5, x: 80, y: 85, size: '0.19', delay: '1.80', duration: '2.20', originX: 610, originY: 240 },
  { id: 6, x: 35, y: 35, size: '0.25', delay: '0.90', duration: '1.70', originX: 290, originY: 410 },
  { id: 7, x: 70, y: 60, size: '0.32', delay: '1.30', duration: '2.50', originX: 550, originY: 380 },
  { id: 8, x: 20, y: 90, size: '0.20', delay: '0.40', duration: '1.65', originX: 340, originY: 670 },
  { id: 9, x: 50, y: 10, size: '0.28', delay: '1.60', duration: '2.05', originX: 480, originY: 290 },
  { id: 10, x: 85, y: 30, size: '0.21', delay: '0.80', duration: '1.95', originX: 640, originY: 510 },
  { id: 11, x: 30, y: 70, size: '0.26', delay: '1.20', duration: '2.30', originX: 260, originY: 440 },
  { id: 12, x: 65, y: 75, size: '0.23', delay: '0.50', duration: '1.75', originX: 580, originY: 360 },
  { id: 13, x: 10, y: 45, size: '0.29', delay: '1.70', duration: '2.15', originX: 310, originY: 590 },
  { id: 14, x: 55, y: 50, size: '0.17', delay: '0.60', duration: '1.85', originX: 470, originY: 480 },
];

export const Navbar = () => {
  const handleConnectClick = () => {
    document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="logo-area">
        <span className="logo-text" style={{ fontFamily: "'Stack Sans Notch', sans-serif", letterSpacing: '-0.5px', fontSize: '28px', userSelect: 'none', fontWeight: 700, color: '#ffffff' }}>
          Naseeb{' '}
          <span className="logo-nex">nex</span>
          <span style={{ color: 'var(--accent-color, #FF5A00)' }}>.</span>
        </span>
      </div>

      <div className="sp">
        <button className="sparkle-button" onClick={handleConnectClick} aria-label="Let's connect">
          <span className="spark"></span>
          <span className="backdrop"></span>

          <svg className="sparkle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" fill="black" />
          </svg>

          <span className="text">Let&apos;s talk</span>

          <div className="particle-wrapper" aria-hidden="true">
            {STATIC_PARTICLES.map((p) => (
              <div
                key={p.id}
                className="particle"
                style={{
                  '--x': `${p.x}%`,
                  '--y': `${p.y}%`,
                  '--scale': p.size,
                  '--delay': `${p.delay}s`,
                  '--duration': `${p.duration}s`,
                  '--origin-x': `${p.originX}%`,
                  '--origin-y': `${p.originY}%`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </button>
      </div>
    </nav>
  );
};
