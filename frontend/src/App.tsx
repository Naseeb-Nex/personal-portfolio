import { useState } from 'react';
import { ThemeProvider } from './shared/theme';
import { HomePage } from './pages/home';
import { Preloader } from './shared/ui/Preloader';
import './app/styles/global.css';
import './app/styles/App.css';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <HomePage />
    </ThemeProvider>
  );
}

export default App;
