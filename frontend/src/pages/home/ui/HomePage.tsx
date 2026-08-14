import { Navbar } from '../../../widgets/navbar';
import { HeroContent } from '../../../widgets/hero';
import { OrbitalRing } from '../../../shared/ui/OrbitalRing';
import { LiquidEther } from '../../../shared/ui/LiquidEther';
import heroImg from '../../../assets/images/hero.png';
import { useTheme } from '../../../shared/config/theme';
import { RoleScroller } from '../../../shared/ui/RoleScroller/RoleScroller';

export const HomePage = () => {
  const { config } = useTheme();

  return (
    <div className="app-container">
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
        <div 
          className="hero-image-overlay"
          style={{ 
            WebkitMaskImage: `url(${heroImg})`, 
            maskImage: `url(${heroImg})` 
          }}
        />
        <RoleScroller />
      </div>

      <OrbitalRing />

      <div className="fg-layer">
        <div className="fg-left">
          <HeroContent />
        </div>
        <div className="fg-right"></div>
      </div>
    </div>
  );
};
