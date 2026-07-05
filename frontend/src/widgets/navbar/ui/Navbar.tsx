export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-area">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="0" width="10" height="10" rx="2" fill="var(--accent-color, #FF5A00)"/>
          <rect x="0" y="14" width="10" height="10" rx="2" fill="var(--accent-color, #FF5A00)"/>
          <rect x="14" y="14" width="10" height="10" rx="2" fill="var(--accent-color, #FF5A00)"/>
          <rect x="4" y="4" width="10" height="10" rx="2" fill="var(--accent-color, #FF5A00)"/>
        </svg>
        <span className="logo-text">M. Naseeb</span>
      </div>
      <div className="nav-links-container">
        <a href="#" className="nav-link">Expertise</a>
        <a href="#" className="nav-link">Projects</a>
        <a href="#" className="nav-link">Experience</a>
        <a href="#" className="nav-link">About</a>
        <a href="#" className="nav-link">Contact</a>
      </div>
      <button className="nav-button">Hire Me</button>
    </nav>
  );
};
