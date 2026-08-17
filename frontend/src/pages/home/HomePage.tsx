import { Navbar } from '../../features/navbar/infrastructure/components/Navbar';
import { HeroContent } from '../../features/hero/infrastructure/components/HeroContent';
import { OrbitalRing } from '../../shared/infrastructure/components/OrbitalRing';
import { LiquidEther } from '../../shared/infrastructure/components/LiquidEther';
import heroImg from '../../assets/images/hero.png';
import { useTheme } from '../../shared/infrastructure/theme';
import { RoleScroller } from '../../shared/infrastructure/components/RoleScroller/RoleScroller';

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
        <OrbitalRing />
        <RoleScroller />
      </div>

      <div className="fg-layer">
        <div className="fg-left">
          <HeroContent />
        </div>
        <div className="fg-right"></div>
      </div>
    </div>
  );
};
