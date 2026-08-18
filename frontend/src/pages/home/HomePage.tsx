import { Navbar } from '../../features/navbar/infrastructure/components/Navbar';
import { HeroContent } from '../../features/hero/infrastructure/components/HeroContent';
import { OrbitalRing } from '../../shared/infrastructure/components/OrbitalRing';
import { LiquidEther } from '../../shared/infrastructure/components/LiquidEther';
import heroImg from '../../assets/images/hero.png';
import { useTheme } from '../../shared/infrastructure/theme';
import { Manifesto } from '../../features/manifesto/infrastructure/components/Manifesto';
import { PixelTransition } from '../../shared/infrastructure/components/PixelTransition/PixelTransition';
import { AboutMe } from '../../features/about/infrastructure/components/AboutMe/AboutMe';
import { Career } from '../../features/career/infrastructure/components/Career';
import { Contact } from '../../features/contact/infrastructure/components/Contact';

export const HomePage = () => {
  const { config } = useTheme();

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#040100', minHeight: '100vh' }}>
      <div className="app-container" style={{ borderRadius: '0 0 40px 40px', overflow: 'hidden', position: 'relative', zIndex: 2 }}>
        <Navbar />

      <div className="grid-lines">
        <div className="line">
          <div className="column-phase">
            <span className="phase-num">01</span>
            <span className="phase-name">Discover</span>
          </div>
        </div>
        <div className="line">
          <div className="column-phase">
            <span className="phase-num">02</span>
            <span className="phase-name">Prototype</span>
          </div>
        </div>
        <div className="line"></div>
        <div className="line">
          <div className="column-phase">
            <span className="phase-num">03</span>
            <span className="phase-name">Launch</span>
          </div>
        </div>
        <div className="line">
          <div className="column-phase">
            <span className="phase-num">04</span>
            <span className="phase-name">Improve</span>
          </div>
        </div>
      </div>

      <div className="liquid-ether-bg">
        <LiquidEther
          colors={['#FFFFFF', '#FFD700', config.accentColor, '#5A1A00']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      <div className="hero-image-container">
        <img src={heroImg} alt="Muhammed Naseeb" className="hero-image" />
        <OrbitalRing />
      </div>

      <div className="fg-layer">
        <div className="fg-left">
          <HeroContent />
        </div>
        <div className="fg-right"></div>
      </div>
      </div>
      <Manifesto />
      <PixelTransition>
        <AboutMe />
      </PixelTransition>
      <Career />
      <Contact />
    </div>
  );
};
