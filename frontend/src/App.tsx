import './index.css';
import heroImg from './assets/images/hero.png';

function App() {
  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-area">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="0" width="10" height="10" rx="2" fill="#FF5A00"/>
            <rect x="0" y="14" width="10" height="10" rx="2" fill="#FF5A00"/>
            <rect x="14" y="14" width="10" height="10" rx="2" fill="#FF5A00"/>
            <rect x="4" y="4" width="10" height="10" rx="2" fill="#FF5A00"/>
          </svg>
          <span className="logo-text">Fluxora</span>
        </div>
        <div className="nav-links-container">
          <a href="#" className="nav-link">Features <span className="arrow-down"></span></a>
          <a href="#" className="nav-link">How It Works</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Product</a>
          <a href="#" className="nav-link">Blogs</a>
        </div>
        <button className="nav-button">Get Started</button>
      </nav>

      {/* Grid Lines Overlay */}
      <div className="grid-lines">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      <main className="hero-content">
        
        {/* Main Content Area */}
        <div className="hero-left">
          <div className="badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span className="badge-text">Hub support peoples from<br/>all over the world</span>
          </div>

          <h1 className="main-title">
            Technology<br />
            Crafted for All<br />
            Not <span className="italic-text">Machines</span>
          </h1>

          <p className="subtitle">
            We create clear, intuitive, and accessible digital<br/>experiences shaped by real human behavior.
          </p>

          <div className="cta-area">
            <button className="primary-cta">
              Get started
              <span className="arrow-circle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
            </button>
            <div className="clients-area">
              <div className="avatars">
                <div className="avatar a1"></div>
                <div className="avatar a2"></div>
                <div className="avatar a3"></div>
              </div>
              <div className="clients-text">
                <span className="clients-num">900+ Happy Clients</span><br/>
                <span className="clients-sub">Great Esteem</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          {/* Floating UI Elements */}
          <div className="floating-card stats-bars">
            <div className="bars">
              <div className="bar b1"></div>
              <div className="bar b2"></div>
              <div className="bar b3"></div>
              <div className="bar b4"></div>
            </div>
            <div className="bar-text">
              <span className="highlight">+42%</span><br/>
              Experience<br/>Performance
            </div>
          </div>

          <div className="floating-card impact-card">
            <div className="impact-text">
              <span className="impact-title">Ensure Real Impact</span>
              <p>Track progress through meaningful metrics and insights</p>
            </div>
            <div className="circular-progress">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                <circle cx="32" cy="32" r="28" fill="none" stroke="#FF5A00" strokeWidth="4" strokeDasharray="175" strokeDashoffset="24" strokeLinecap="round"/>
              </svg>
              <div className="progress-value">86%</div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Bottom Cards */}
      <div className="bottom-cards">
        <div className="glass-card">
          <div className="card-val">150+ <span className="asterisk">*</span></div>
          <div className="card-lbl">Projects delivered</div>
        </div>
        <div className="glass-card">
          <div className="card-val">98% <span className="asterisk">*</span></div>
          <div className="card-lbl">Client satisfaction</div>
          <div className="mini-chart"></div>
        </div>
      </div>

      {/* The large image overlay */}
      <img src={heroImg} alt="Hero Persona" className="hero-image" />
    </div>
  );
}

export default App;
