import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
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
          <div className="career-info-box">
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
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior AI Engineer</h4>
                <h5>Smart Analytica, Pune</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Leading a team of 8 engineers on enterprise GenAI platforms
              spanning clinical research, autonomous BI, and recruitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
