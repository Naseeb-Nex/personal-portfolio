import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./Career.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const Career = () => {
  const container = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const infoBoxes = useRef<HTMLDivElement[]>([]);
  const timelineDot = useRef<HTMLDivElement>(null);
  const timelineLine = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial states
    gsap.set(infoBoxes.current, { opacity: 0, y: 50 });
    gsap.set(timelineLine.current, { height: "0%" });
    gsap.set(timelineDot.current, { top: "0%", opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "+=1500", // Increased scroll sensitivity
        scrub: 1,
        pin: true,
      },
    });

    // Title starts in middle, moves up to normal position
    tl.from(title.current, {
      y: "35vh",
      scale: 1.3,
      duration: 1.5,
      ease: "power2.inOut",
    }).to(timelineDot.current, { opacity: 1, duration: 0.2 }); // dot fades in immediately after

    // Reveal boxes and move dot
    infoBoxes.current.forEach((box, i) => {
      // Map the steps to a max of 85% so the dot stops at the last experience heading
      const stepHeight = ((i + 1) / infoBoxes.current.length) * 85;
      
      tl.to(timelineLine.current, { height: `${stepHeight}%`, duration: 2, ease: "none" }, `box${i}`)
        .to(timelineDot.current, { top: `${stepHeight}%`, duration: 2, ease: "none" }, `box${i}`)
        .to(box, { opacity: 1, y: 0, duration: 1 }, `box${i}+=0.2`); // Show card faster
    });

  }, { scope: container });

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !infoBoxes.current.includes(el)) {
      infoBoxes.current.push(el);
    }
  };

  return (
    <div className="career-section" ref={container}>
      <div className="career-container">
        <h2 ref={title} className="career-title">
          <span className="title-white">My career <span className="ampersand">&amp;</span></span>
          <br />
          <span className="title-gradient">experience</span>
        </h2>
        <div className="career-info">
          <div className="career-timeline-wrapper">
            <div className="career-timeline" ref={timelineLine}></div>
            <div className="career-dot" ref={timelineDot}></div>
          </div>
          
          <div className="career-info-box" ref={addToRefs}>
            <div className="career-info-in">
              <div className="career-role">
                <h4>Data Analyst – AI Engineer</h4>
                <h5>FIA Global Technology, Gurugram</h5>
              </div>
              <h3>2024</h3>
            </div>
            <p>
              Built RAG-based financial AI tools, document classifiers on Vertex
              AI, and Power BI analytics serving 500+ users.
            </p>
          </div>
          
          <div className="career-info-box" ref={addToRefs}>
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI Engineer</h4>
                <h5>Smart Analytica, Pune</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Shipped clinical AI on AWS Bedrock, talent acquisition on Azure,
              and a multimodal GCP document parser—all production-grade.
            </p>
          </div>
          
          <div className="career-info-box" ref={addToRefs}>
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI Engineer</h4>
                <h5>Smart Analytica, Pune</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Leading a team on enterprise GenAI platforms—architecting system
              flows, driving implementation, and guiding the team to build a
              production-grade Gen BI Platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
