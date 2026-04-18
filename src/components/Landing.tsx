import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              MUHAMMED
              <br />
              <span>NASEEB</span>
            </h1>
          </div>
          <div className="landing-info">
            <div className="landing-info-scroller">
              <div className="landing-h2-group group-1">
                <h3 className="ai-text">An AI</h3>
                <h2 className="engineer-text">Engineer</h2>
              </div>
              <div className="landing-h2-group group-2">
                <h3 className="system-text">AI System</h3>
                <h2 className="architect-text">Architect</h2>
              </div>
              <div className="landing-h2-group group-3">
                <h3 className="ai-text">An AI</h3>
                <h2 className="engineer-text">Engineer</h2>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
