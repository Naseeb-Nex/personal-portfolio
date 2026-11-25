import { useState } from 'react';
import { ThemeProvider } from './shared/infrastructure/theme';
import { HomePage } from './pages/home';
import { Preloader } from './shared/infrastructure/components/Preloader';
import { PixelCompanion } from './features/companion';
import './styles/global.css';
import './styles/App.css';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <HomePage />
      <PixelCompanion />
    </ThemeProvider>
  );
}

export default App;
