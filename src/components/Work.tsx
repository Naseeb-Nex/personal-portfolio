import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const Work = () => {
  useGSAP(() => {
  let translateX: number = 0;

  function setTranslateX() {
    const box = document.getElementsByClassName("work-box");
    const rectLeft = document
      .querySelector(".work-container")!
      .getBoundingClientRect().left;
    const rect = box[0].getBoundingClientRect();
    const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
    let padding: number =
      parseInt(window.getComputedStyle(box[0]).padding) / 2;
    translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
  }

  setTranslateX();

  let timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".work-section",
      start: "top top",
      end: `+=${translateX}`, // Use actual scroll width
      scrub: true,
      pin: true,
      id: "work",
    },
  });

  timeline.to(".work-flex", {
    x: -translateX,
    ease: "none",
  });

  // Clean up (optional, good practice)
  return () => {
    timeline.kill();
    ScrollTrigger.getById("work")?.kill();
  };
}, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>01</h3>
                <div>
                  <h4>GenBI Platform</h4>
                  <p>Generative BI</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Microsoft Agent Framework, Azure AI Foundry, FastAPI, PostgreSQL</p>
            </div>
            <WorkImage image="/images/placeholder.webp" alt="" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>02</h3>
                <div>
                  <h4>AI Clinical Screening Agent</h4>
                  <p>Clinical Automation</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>AWS Bedrock, Amazon Lex, Lambda, QuickSight, Calendly API</p>
            </div>
            <WorkImage image="/images/placeholder.webp" alt="" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>03</h3>
                <div>
                  <h4>Gen AI Talent Acquisition</h4>
                  <p>HR Automation</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Semantic Kernel, Azure Container Apps, Azure Speech, FastAPI</p>
            </div>
            <WorkImage image="/images/placeholder.webp" alt="" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>04</h3>
                <div>
                  <h4>AgenticDoc Parser</h4>
                  <p>Document Intelligence</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>GCP, Llama Vision, Google ADK, Cloud Run</p>
            </div>
            <WorkImage image="/images/placeholder.webp" alt="" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>05</h3>
                <div>
                  <h4>Financial Wellbeing AI Tool</h4>
                  <p>FinTech AI</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>GPT-4, LangChain, Pinecone, Vertex AI, RAG</p>
            </div>
            <WorkImage image="/images/placeholder.webp" alt="" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>06</h3>
                <div>
                  <h4>Beach Sand Mineral Classifier</h4>
                  <p>Computer Vision</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Deep Learning, OpenCV, Data Augmentation, Python</p>
            </div>
            <WorkImage image="/images/placeholder.webp" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
