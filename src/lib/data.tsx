import React from "react";

export const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Process", href: "#process" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Recognition", href: "#recognition" },
  { name: "Let's Connect", href: "#contact" },
];

export const HERO = {
  heading: ["Building", "minds that", "think", "act"],
  subheading: (
    <>
      Hi, I'm <span className="font-semibold text-white/95">Muhammed Naseeb</span> — an AI Engineer turning Generative AI into production-grade systems that solve real business problems.
    </>
  ),
  cta: "Scroll to explore",
};

export const ABOUT = {
  title: "The Mindset.",
  paragraphs: [
    "I build AI systems that don't just work in demos — they hold up in production.",
    "My work spans multi-agent orchestration, RAG pipelines, LLM fine-tuning, and end-to-end enterprise automation across AWS, Azure, and GCP. I approach every problem with a systems-thinking mindset — designing for reliability, scalability, and real business impact from day one.",
    "I'm deeply hands-on across the full AI engineering stack — from prompt engineering and agent architecture to MLOps, cloud deployment, and Responsible AI practices. I don't hand off at the prototype stage; I own the solution end to end.",
    "\"What drives me is the gap between what AI can do and what most teams actually ship — and closing it.\""
  ],
  sublineTitle: "AI isn't magic — it's engineering.",
  sublineDescription: "I take complex Generative AI concepts, strip them down to what matters, and build reliable systems that solve actual business problems at scale."
};

export const PROCESS = {
  title: "How I Build AI Systems",
  intro: "Most AI projects don't fail because of bad ideas — they fail because they're built the wrong way. I follow the Agentic Development Lifecycle (ADLC) — a framework purpose-built for non-deterministic AI systems where behavior evolves, context shifts, and production is just the beginning.",
  phases: [
    {
      title: "Phase 0 — Preparation & Hypotheses",
      description: "Before writing a single line of code, I identify real problems, surface constraints, and form testable hypotheses. Automating the wrong thing is worse than not automating at all."
    },
    {
      title: "Phase 1 — Scope Framing & Problem Definition",
      description: "I define use cases, success metrics, data boundaries, and — critically — where the human ends and the agent begins. Accountability must be designed in, not patched in later."
    },
    {
      title: "Phase 2 — Agent Definition & Architecture",
      description: "I design the agent's reasoning pattern (ReAct, Plan-and-Execute, Multi-agent), data flows, cost model, and evaluation strategy before any implementation starts."
    },
    {
      title: "Phase 3 — Simulation & Proof of Value",
      description: "Using real-world data, I validate core assumptions and establish a golden dataset that becomes the ground truth for all future behavioral testing. Go or no-go — decided with data, not intuition."
    },
    {
      title: "Phase 4 — Implementation & Evals",
      description: "Development and evaluation run as a single continuous loop — not sequential stages. Every context or prompt change is validated immediately. Batch testing breaks agentic systems."
    },
    {
      title: "Phase 5 — Testing",
      description: "End-to-end validation across real-world scenarios: UAT, bias testing, compliance checks, red-teaming, and performance under peak load. Formal sign-off before anything ships."
    },
    {
      title: "Phase 6 — Agent Activation & Deployment",
      description: "Controlled rollout using canary or phased exposure, with LLM-specific observability — monitoring hallucination rates, context drift, and toxicity — not just uptime."
    },
    {
      title: "Phase 7 — Continuous Learning & Governance",
      description: "Deployment is not the finish line. I maintain alignment through feedback loops, model versioning, knowledge base refreshes, and behavioral audits as the system evolves."
    }
  ],
  closing: [
    "Traditional software is shipped.",
    "Agentic systems are supervised.",
    "This lifecycle ensures the AI I build keeps working — reliably, safely, and at scale."
  ]
};

export const EXPERIENCE = {
  title: "Professional Experience",
  subtitle: "Building and scaling AI solutions for enterprise environments.",
  roles: [
    {
      title: "AI Engineer",
      company: "Smart Analytica",
      duration: "Jan 2025 - Present",
      location: "Pune, India",
      bullets: [
        "Shipped enterprise AI products across AWS, Azure & GCP — including a Multi-Agent GenBI platform, an AI-driven talent acquisition system, and a clinical screening agent — serving 500+ users with measurable business impact."
      ]
    },
    {
      title: "Data Analyst · AI Engineer",
      company: "FIA Global Technology",
      duration: "Feb 2024 - Jan 2025",
      location: "Gurugram, India",
      bullets: [
        "Built LLM-powered tools for the fintech domain using GPT-4, LangChain, and Vertex AI — covering RAG pipelines, fraud detection, document classification, and embedded BI analytics."
      ]
    }
  ]
};

export const PROJECTS = {
  title: "Featured Projects",
  subtitle: "A selection of complex AI systems I've architected and deployed to production.",
  items: [
    {
      title: "GenBI - Autonomous Generative Dashboard",
      description: "Generative BI platform enabling users to generate interactive Power-BI-style dashboards via natural language. Migrated from Semantic Kernel to Microsoft Agent Framework for superior orchestration.",
      highlight: "✨ Handles 50+ concurrent requests securely via Azure AD.",
      tech: ["Azure", "Agent Framework", "FastAPI", "PostgreSQL"],
    },
    {
      title: "AI-Driven Patient Screening Platform",
      description: "Multi-modal clinical agent parsing protocol documents, generating dynamic questionnaires, and conducting voice/chat patient screening.",
      highlight: "✨ Accelerated enrollment by 90% & cut workload by 30%.",
      tech: ["AWS Bedrock", "Lex", "Lambda", "Claude"],
    },
    {
      title: "AgenticDoc Parser",
      description: "Multimodal document parsing agent extracting text, tables, images, and graphs. Engineered NER and abstractive summarisation with <2% data loss.",
      highlight: "✨ Achieved 96% extraction accuracy.",
      tech: ["GCP", "Llama Vision", "Google ADK", "Cloud Run"],
    },
    {
      title: "Gen AI Talent Acquisition Platform",
      description: "Full-cycle autonomous recruitment system: JD Generation, Resume Sourcing, Interview Scheduling, and a WhatsApp candidate engagement agent.",
      highlight: "✨ Reduced manual hiring effort by 40%.",
      tech: ["Azure Semantic Kernel", "FastAPI", "RAG"],
    },
    {
      title: "Financial Wellbeing AI Tool",
      description: "RAG-based financial advisor providing personalised recommendations and real-time insights based on user spending patterns.",
      highlight: "✨ Improved user goal-completion rates by 35%.",
      tech: ["GPT-4", "LangChain", "Pinecone", "Gemini Pro"],
    },
    {
      title: "Time Series Profit Forecasting",
      description: "Time series forecasting model predicting monthly profit trends on historical data across 10,000+ transaction records.",
      highlight: "✨ 92% accuracy, improved budget efficiency by 15%.",
      tech: ["Python", "ARIMA", "Scikit-learn", "Power BI"],
    }
  ]
};

export const SKILLS = {
  title: "Technical Arsenal",
  subtitle: "The specific tools, languages, and frameworks I leverage to build scalable AI.",
  categories: [
    {
      name: "Generative AI & LLMs",
      items: ["OpenAI GPT", "Claude", "LLAMA", "Gemini", "RAG", "Fine-Tuning", "RLHF", "Embeddings"]
    },
    {
      name: "AI Agents & Orchestration",
      items: ["Microsoft Agent", "Semantic Kernel", "Google ADK", "LangChain", "LangGraph", "LlamaIndex"]
    },
    {
      name: "Cloud & Infrastructure",
      items: ["AWS", "Azure", "GCP", "Docker", "Terraform", "GitHub Actions", "CI/CD"]
    },
    {
      name: "Programming & MLOps",
      items: ["Python", "SQL", "C++", "FastAPI", "PyTorch", "TensorFlow", "MLflow", "Azure ML"]
    },
    {
      name: "Data & Vector Stores",
      items: ["Pinecone", "ChromaDB", "Weaviate", "pgvector", "PostgreSQL", "MongoDB", "Snowflake", "Redis"]
    }
  ],
  flatItems: [
    "OpenAI GPT", "Claude", "LLAMA", "Gemini", "RAG", "Fine-Tuning", "RLHF", "Embeddings",
    "Microsoft Agent", "Semantic Kernel", "Google ADK", "LangChain", "LangGraph", "LlamaIndex",
    "AWS", "Azure", "GCP", "Docker", "Terraform", "GitHub Actions", "CI/CD",
    "Python", "SQL", "C++", "FastAPI", "PyTorch", "TensorFlow", "MLflow", "Azure ML",
    "Pinecone", "ChromaDB", "Weaviate", "pgvector", "PostgreSQL", "MongoDB", "Snowflake", "Redis"
  ]
};

export const RECOGNITION = {
  title: "Recognition",
  items: [
    {
      title: "🏆 Outstanding Performance in Enterprise AI",
      organization: "Smart Analytica",
      date: "Sep 2025",
      description: "Awarded by the CEO and Head of Delivery for exceptional contributions to enterprise AI initiatives, recognized for accelerating solution delivery and technical agility."
    },
    {
      title: "🥈 First Runner-Up Amaze '22 National Hackathon",
      organization: "Govt. College of Engineering, Kannur",
      date: "2022",
      description: "Developed a real-time Sign Language Converter using OpenCV and ML, achieving 85% accuracy among 50+ competing teams."
    }
  ]
};

export const CONTACT = {
  title: "Let's build the future together.",
  body: "I'm currently open to new opportunities. Whether you have a question or just want to discuss AI architecture, I'll try my best to get back to you!",
  email: "muhammednaseeb02@gmail.com",
  phone: "+91 81379 48323",
  github: "https://github.com/Naseeb-Nex",
  linkedin: "https://linkedin.com/in/naseeb-nex"
};

export const FOOTER = {
  text: "© 2026 Muhammed Naseeb. All rights reserved."
};
