import "./styles/Projects.css";
import ProjectImage from "./ProjectImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS_COUNT = 6;

const Projects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const flexRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const flex = flexRef.current;

    if (!section || !flex) return;

    const getX = () => -(PROJECTS_COUNT - 1) * window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${Math.abs(getX())}`,
        scrub: 1,
        pin: true,
        // pinnedContainer tells ScrollTrigger the pin spacer belongs inside
        // smooth-content so ScrollSmoother accounts for the extra scroll space
        pinnedContainer: "#smooth-content",
        anticipatePin: 1,
        invalidateOnRefresh: true,
        id: "projects-hscroll",
        onUpdate: (self) => {
          const activeIndex = Math.round(self.progress * (PROJECTS_COUNT - 1));
          section.querySelectorAll(".proj-dot").forEach((dot, i) => {
            dot.classList.toggle("proj-dot--active", i === activeIndex);
          });
        },
      },
    });

    tl.to(flex, { x: getX, ease: "none" });

    // Let ScrollSmoother recalculate with the pin spacer in place
    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill(true);
      tl.kill();
    };
  }, []);

  return (
    <div className="projects-section" id="projects" ref={sectionRef}>
      <div className="projects-container section-container">
        <div className="projects-header">
          <h2>
            My <span>Projects</span>
          </h2>
          <div className="proj-dots-nav" aria-label="Project navigation">
            {Array.from({ length: PROJECTS_COUNT }, (_, i) => (
              <span key={i} className="proj-dot" aria-label={`Project ${i + 1}`} />
            ))}
          </div>
        </div>
        <div className="projects-clip">
          <div className="projects-flex" ref={flexRef}>
            <div className="projects-box">
              <div className="projects-info">
                <div className="projects-title">
                  <h3>01</h3>
                  <div>
                    <h4>GenBI Platform</h4>
                    <p>Generative BI</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Microsoft Agent Framework, Azure AI Foundry, FastAPI, PostgreSQL</p>
              </div>
              <ProjectImage image="/images/placeholder.webp" alt="" />
            </div>
            <div className="projects-box">
              <div className="projects-info">
                <div className="projects-title">
                  <h3>02</h3>
                  <div>
                    <h4>AI Clinical Screening Agent</h4>
                    <p>Clinical Automation</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>AWS Bedrock, Amazon Lex, Lambda, QuickSight, Calendly API</p>
              </div>
              <ProjectImage image="/images/placeholder.webp" alt="" />
            </div>
            <div className="projects-box">
              <div className="projects-info">
                <div className="projects-title">
                  <h3>03</h3>
                  <div>
                    <h4>Gen AI Talent Acquisition</h4>
                    <p>HR Automation</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Semantic Kernel, Azure Container Apps, Azure Speech, FastAPI</p>
              </div>
              <ProjectImage image="/images/placeholder.webp" alt="" />
            </div>
            <div className="projects-box">
              <div className="projects-info">
                <div className="projects-title">
                  <h3>04</h3>
                  <div>
                    <h4>AgenticDoc Parser</h4>
                    <p>Document Intelligence</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>GCP, Llama Vision, Google ADK, Cloud Run</p>
              </div>
              <ProjectImage image="/images/placeholder.webp" alt="" />
            </div>
            <div className="projects-box">
              <div className="projects-info">
                <div className="projects-title">
                  <h3>05</h3>
                  <div>
                    <h4>Financial Wellbeing AI Tool</h4>
                    <p>FinTech AI</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>GPT-4, LangChain, Pinecone, Vertex AI, RAG</p>
              </div>
              <ProjectImage image="/images/placeholder.webp" alt="" />
            </div>
            <div className="projects-box">
              <div className="projects-info">
                <div className="projects-title">
                  <h3>06</h3>
                  <div>
                    <h4>Beach Sand Mineral Classifier</h4>
                    <p>Computer Vision</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Deep Learning, OpenCV, Data Augmentation, Python</p>
              </div>
              <ProjectImage image="/images/placeholder.webp" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
