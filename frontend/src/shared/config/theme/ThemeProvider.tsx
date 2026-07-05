import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ThemeConfig } from './theme';
import { DEFAULT_THEME } from './theme';

interface ThemeContextType {
  config: ThemeConfig;
  setAccentColor: (color: string) => void;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
  }, [config]);

  const setAccentColor = (color: string) => {
    setConfig(prev => ({ ...prev, accentColor: color }));
  };

  const setTheme = (theme: string) => {
    setConfig(prev => ({ ...prev, theme }));
  };

  return (
    <ThemeContext.Provider value={{ config, setAccentColor, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
