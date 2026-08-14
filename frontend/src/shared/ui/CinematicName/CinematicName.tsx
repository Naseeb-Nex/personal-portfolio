import { useState, useEffect } from 'react';
import './CinematicName.css';

const CinematicName = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2500); // Muhammed disappears
    const t2 = setTimeout(() => setPhase(2), 3500); // Nex shows up
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="cinematic-container">
      <div className="line-one text-static">I AM</div>
      
      <div className={`text-muhammed ${phase === 0 ? 'glitch-effect' : 'hide-muhammed'}`} data-text="MUHAMMED">
        MUHAMMED
      </div>
      
      <div className="line-nex-naseeb">
        <span className={`text-nex ${phase >= 2 ? 'cinematic-in' : 'hide-nex'}`}>
          NEX
        </span>
        <span className="text-naseeb">
          NASEEB
        </span>
      </div>
    </div>
  );
};

export default CinematicName;
