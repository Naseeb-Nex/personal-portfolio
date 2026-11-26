import { useEffect, useState } from 'react';
import { Hero } from '../../features/hero/components/Hero';
import { ThemeToggle } from '../../features/hero/components/ThemeToggle';
import { Manifesto } from '../../features/manifesto/infrastructure/components/Manifesto';
import { PixelTransition } from '../../shared/ui/PixelTransition';
import { AboutMe } from '../../features/about/infrastructure/components/AboutMe/AboutMe';
import { Career } from '../../features/career/infrastructure/components/Career';
import { Contact } from '../../features/contact/infrastructure/components/Contact';

function getInitialTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // localStorage unavailable (e.g. security sandbox)
  }
  return 'dark';
}

export const HomePage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // localStorage write error fallback
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div
      className="page-wrapper"
      style={{
        backgroundColor: 'var(--bg-dark, #000000)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <main className="app-container">
        <Hero theme={theme} />
      </main>

      <Manifesto />
      <PixelTransition />
      <AboutMe />
      <Career />
      <Contact />
    </div>
  );
};
