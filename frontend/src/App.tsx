import { ThemeProvider } from './shared/infrastructure/theme';
import { HomePage } from './pages/home';
import './styles/global.css';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  );
}

export default App;
