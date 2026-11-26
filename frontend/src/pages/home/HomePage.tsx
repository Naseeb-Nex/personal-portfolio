import { useEffect, useState } from 'react';
import { Hero } from '../../widgets/hero';
import { ThemeToggle } from '../../features/theme-toggle';
import { Manifesto } from '../../widgets/manifesto';
import { PixelTransition } from '../../shared/ui/PixelTransition';
import { AboutMe } from '../../widgets/about';
import { Career } from '../../widgets/career';
import { Contact } from '../../widgets/contact';

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
