import { useEffect, useState } from 'react';
import './Preloader.css';
import heroImg from '../../../../assets/images/hero.png';

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [percentage, setPercentage] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    let progress = 0;
    let isLoaded = false;
    
    const img = new Image();
    img.src = heroImg;
    img.onload = () => {
      isLoaded = true;
    };

    const interval = setInterval(() => {
      if (!isLoaded) {
        progress += Math.random() * 15;
        if (progress > 90) {
          progress = 90;
        }
      } else {
        progress += 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            window.scrollTo(0, 0);
            setIsClosing(true);
            setTimeout(() => {
              document.body.style.overflow = '';
              window.scrollTo(0, 0);
              onComplete();
            }, 800);
          }, 400);
        }
      }
      setPercentage(Math.floor(progress));
    }, 150);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div className={`preloader-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="loader">
        <div className="box1"></div>
        <div className="box2"></div>
        <div className="box3"></div>
      </div>
      <div className="preloader-bottom-container">
        <div className="preloader-percentage">{percentage}%</div>
        <div className="loading-bar-container">
          <div className="loading-bar" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};
