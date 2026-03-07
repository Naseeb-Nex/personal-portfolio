"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pacifico } from "next/font/google";
import localFont from "next/font/local";
import { motion, useSpring, useMotionValue } from "framer-motion";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
});

const asgard = localFont({
  src: "../assets/fonts/AsgardTrial-FitFat.ttf",
  weight: "900", // Extra black/fat weight
});
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

import { Component as FlowGradientHero } from "@/components/ui/flow-gradient-hero-section";
import logoImg from "@/assets/images/logo.png";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ----------------------------------------------------------------------------
// DATA STRUCTURES
// ----------------------------------------------------------------------------

type Project = {
  title: string;
  tech: string[];
  description: string;
  link?: string;
};

type ExperienceType = {
  company: string;
  role: string;
  period: string;
  bullets: string[];
};

const PROJECTS: Project[] = [
  {
    title: "GenBI",
    tech: ["Azure", "Microsoft Agent Framework", "FastAPI"],
    description: "Autonomous Generative BI Dashboard Platform. Natural language to interactive Power-BI style dashboards.",
  },
  {
    title: "Patient Screening Platform",
    tech: ["AWS Bedrock", "Lex", "QuickSight"],
    description: "Multi-modal conversational interface parsing protocol docs and generating eligibility questionnaires.",
  },
  {
    title: "AI Talent Acquisition",
    tech: ["Azure Semantic Kernel"],
    description: "Autonomous recruitment system with JD Generation, Resume Sourcing, and Interview Scheduling agents.",
  },
  {
    title: "Agentic Doc Parser",
    tech: ["GCP", "Llama Vision", "Google ADK"],
    description: "Multimodal parsing extracting text, tables, graphs with 96% accuracy.",
  }
];

const EXPERIENCE: ExperienceType[] = [
  {
    company: "Smartavya Analytica",
    role: "AI Engineer",
    period: "Jan 2025 - Present | Bengaluru",
    bullets: [
      "Engineered 3 enterprise AI products serving 500+ users.",
      "Architected Multi-Agent GenBI platform using Microsoft Agent Framework.",
      "Deployed Gen AI Talent Acquisition platform, reducing manual effort by 40%.",
      "Built AI clinical screening agent accelerating patient enrollment by 90%."
    ]
  },
  {
    company: "FIA Global Technology",
    role: "Data Analyst - AI Engineer",
    period: "Feb 2024 - Jan 2025 | Kerala",
    bullets: [
      "Built AI financial wellbeing tool (GPT-4 + LangChain + Pinecone), improving goal-completion by 35%.",
      "Engineered document classification system (Vertex AI), cutting manual review by 50%."
    ]
  },
  {
    company: "LetsBay",
    role: "Mobile App Developer",
    period: "Dec 2022 - Dec 2023",
    bullets: [
      "Built award-winning Flutter app.",
      "Integrated Firebase, reduced startup time by 40%."
    ]
  }
];

const SKILLS = [
  "Python", "SQL", "C++", "REST API", "FastAPI", "Flask",
  "OpenAI GPT-4o", "Claude 3.5", "LLAMA", "Gemini Pro", "RAG", "Fine-Tuning", "Prompt Engineering",
  "Microsoft Agent Framework", "Semantic Kernel", "Google ADK", "LangChain", "LangGraph",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "MLflow",
  "Pinecone", "ChromaDB", "Weaviate", "pgvector", "PostgreSQL", "MongoDB"
];

// ----------------------------------------------------------------------------
// MICRO-COMPONENTS
// ----------------------------------------------------------------------------

/**
 * Custom Cursor Component
 * mix-blend-mode difference for an elegant Awwwards feel
 */
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full bg-white opacity-80 pointer-events-none z-[9999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        mixBlendMode: "difference"
      }}
    />
  );
};

/**
 * Magnetic Button/Wrapper Component
 * Exerts magnetic pull on mouse hover
 */
const Magnetic = ({ children }: { children: React.ReactElement }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.div
      style={{ position: "relative" }}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

const PARTICLE_COUNT = 5000;
const INITIAL_POSITIONS = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
  INITIAL_POSITIONS[i] = (Math.random() - 0.5) * 10;
}

/**
 * Three.js Background Component
 * Subtle particle network / neural node simulation
 */
const ParticleBackground = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const sphere = React.useMemo(() => INITIAL_POSITIONS, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f0ff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
};

/**
 * Kinetic Text Animation
 * Splits text into staggered characters or words
 */
const RevealText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span className="inline-block overflow-hidden">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            initial={{ y: "100%", rotate: 10, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1], // Expo out curve
              delay: delay + i * 0.05
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/**
 * Scramble / Glitch Text Hover component
 */
const ScrambleText = ({ text }: { text: string }) => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    let iteration = 0;
    clearInterval(intervalRef.current as NodeJS.Timeout);

    intervalRef.current = setInterval(() => {
      setDisplay(
        text.split("").map((letter, index) => {
          if (index < iteration) return text[index];
          return LETTERS[Math.floor(Math.random() * LETTERS.length)];
        }).join("")
      );

      if (iteration >= text.length) clearInterval(intervalRef.current as NodeJS.Timeout);
      iteration += 1 / 3;
    }, 30);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setDisplay(text);
  };

  return (
    <span
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      className="inline-block transition-colors duration-300 hover:text-[#00f0ff] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] cursor-crosshair font-mono"
    >
      {display}
    </span>
  );
};

// ----------------------------------------------------------------------------
// MAJOR SECTIONS
// ----------------------------------------------------------------------------

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 1;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#030303] text-[#00f0ff] font-mono"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: "-100%" }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="w-64 max-w-full px-8">
        <div className="text-xs mb-2 tracking-widest uppercase">Initializing AI Protocol_</div>
        <div className="w-full h-1 bg-white/10 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#00f0ff]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-xs mt-2 flex justify-between">
          <span>SYS.BOOT</span>
          <span>{Math.min(progress, 100)}%</span>
        </div>
      </div>
    </motion.div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-3 md:top-4 left-0 w-full flex justify-center z-[100] px-4 pointer-events-none">
      <motion.header
        className="relative w-[100%] max-w-[800px] rounded-full bg-transparent px-4 md:px-6 py-1 flex items-center justify-between pointer-events-auto"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] transition-all dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]" />
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full bg-[#141414]/10"
          style={{ backdropFilter: 'url("#container-glass") blur(16px)' }}
        />

        <svg className="hidden">
          <defs>
            <filter
              id="container-glass"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05 0.05"
                numOctaves="1"
                seed="1"
                result="turbulence"
              />
              <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="blurredNoise"
                scale="70"
                xChannelSelector="R"
                yChannelSelector="B"
                result="displaced"
              />
              <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
              <feComposite in="finalBlur" in2="finalBlur" operator="over" />
            </filter>
          </defs>
        </svg>

        <Magnetic>
          <Link href="/" className="relative z-10 flex items-center p-1 group">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image src={logoImg} alt="Logo" width={40} height={40} className="w-10 h-10 object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300" />
            </motion.div>
          </Link>
        </Magnetic>

        {/* Desktop Menu */}
        <nav className="relative z-10 hidden md:flex items-center gap-2 md:gap-4 font-medium text-xs md:text-sm uppercase tracking-wider text-gray-300">
          {["Home", "About", "Projects", "Skills"].map((item) => (
            <Magnetic key={item}>
              <Link
                href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                className="relative block px-3 py-1 group hover:text-white transition-colors duration-300"
              >
                <span className="relative inline-flex flex-col overflow-hidden">
                  <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                    {item}
                  </span>
                  <span className="block absolute inset-0 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 text-white font-semibold">
                    {item}
                  </span>
                </span>
                <span className="absolute left-3 right-3 bottom-0.5 h-[2px] rounded-full bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </Link>
            </Magnetic>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <Magnetic>
          <button
            className="relative z-10 md:hidden text-gray-300 hover:text-white p-1 overflow-hidden rounded-full group outline-none transition-colors duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-full" />
            <motion.svg
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" className="relative z-10 w-5 h-5 transition-transform duration-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </motion.svg>
          </button>
        </Magnetic>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-[#141414]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col gap-6 md:hidden overflow-hidden origin-top"
              initial={{ opacity: 0, scaleY: 0.95, y: -10 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.95, y: -10 }}
            >
              <nav className="flex flex-col gap-4 font-mono text-sm uppercase text-gray-300 text-center">
                {["Home", "About", "Projects", "Skills"].map((item) => (
                  <Link
                    key={item}
                    href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                    onClick={() => setIsOpen(false)}
                    className="relative block py-2 group"
                  >
                    <span className="relative inline-flex flex-col overflow-hidden">
                      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                        {item}
                      </span>
                      <span className="block absolute inset-0 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 text-white font-bold">
                        {item}
                      </span>
                    </span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
};

import { AnimatePresence } from "framer-motion";

const Hero = () => {
  return (
    <section id="home" className="relative w-full h-[100vh] flex items-center justify-center px-4 md:px-12 z-10 overflow-hidden">
      {/* Background Interactive Animation */}
      <div className="absolute inset-0 z-0">
        <FlowGradientHero
          title=""
          showPauseButton={false}
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none" />
      </div>

      <div className="w-full max-w-[1400px] flex flex-col md:flex-row items-center relative z-20 h-full pt-24 md:pt-0">
        {/* Left Section */}
        <div className="flex-1 flex flex-col items-start justify-center pr-0 md:pr-12 text-left">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-[6vw] font-medium tracking-tighter leading-[0.9] text-white drop-shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            Building <br></br> minds that <br></br> <span className={`${asgard.className} tracking-[4px]`}>think</span> <span className={pacifico.className}>&</span> <span className={`${asgard.className} tracking-[4px]`}>act</span>
          </motion.h1>

          <motion.p
            className="mt-6 md:mt-8 max-w-[650px] text-lg text-white/70 font-sans leading-relaxed z-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1 }}
          >
            Engineering enterprise-grade agent frameworks that automate complex workflows, orchestrate multi-agent systems, and scale intelligent decision-making across organizations.
          </motion.p>

          <motion.div
            className="mt-10 md:mt-12 z-20 flex gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.8, type: "spring" }}
          >
            <Magnetic>
              <button className="px-8 py-4 rounded-full border border-white/30 hover:border-white hover:bg-white/10 text-white font-semibold text-sm transition-colors backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                View Projects
              </button>
            </Magnetic>
          </motion.div>
        </div>

        {/* Right Section (MD Placeholder) */}
        <div className="flex-1 flex items-center justify-center w-full h-full min-h-[40vh] md:min-h-full">
          {/* Add Image Here */}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-[10px] font-medium text-white/60 uppercase tracking-wider z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <span>Scroll Trajectory</span>
        <div className="w-[1px] h-12 md:h-16 bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>
    </section>
  );
};

const Experience = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className="relative w-full py-32 px-4 md:px-12 z-20 bg-[#030303]">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tighter leading-[0.9] text-white">
          The Neural Pathway
        </h2>

        <div className="relative pl-8 md:pl-24 border-l border-white/10 space-y-32">
          {EXPERIENCE.map((exp, index) => (
            <div key={index} className="relative group">
              {/* Glowing Node on Pathway */}
              <div className="absolute -left-8 md:-left-24 top-0 w-8 h-8 md:w-16 md:h-16 -translate-x-1/2 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#8a2be2] rounded-full group-hover:scale-150 transition-transform duration-500 z-10" />
                <div className="absolute inset-0 bg-[#8a2be2]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* HUD Panel Content */}
              <div className="glass-panel p-8 md:p-12 border border-white/5 rounded-2xl hover:border-[#8a2be2]/50 transition-colors duration-500 bg-white/[0.02] backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8">
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2 md:mb-0">
                    <ScrambleText text={exp.role} />
                  </h3>
                  <span className="font-medium text-sm text-[#00f0ff] uppercase tracking-wider">
                    {exp.period}
                  </span>
                </div>

                <h4 className="font-medium text-sm text-zinc-400 mb-6 uppercase tracking-wider">
                  {exp.company}
                </h4>

                <ul className="space-y-4">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start text-gray-300 font-sans text-lg leading-relaxed">
                      <span className="text-[#00f0ff] mr-4 mt-1">▹</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedProjects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".project-card");

      gsap.to(cards, {
        xPercent: -100 * (cards.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (cards.length - 1),
          end: () => "+=" + scrollRef.current!.offsetWidth,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="h-screen w-full overflow-hidden bg-[#050505] flex items-center z-20 relative">
      <div className="absolute top-12 left-4 md:left-12 text-white z-30 opacity-50">
        <h2 className="text-2xl md:text-4xl font-medium tracking-tighter leading-[0.9]">Featured Nodes</h2>
      </div>

      <div ref={scrollRef} className="flex h-[70vh] items-center w-[400vw] sm:w-[300vw] lg:w-[200vw] pl-4 md:pl-12 pt-20">
        {PROJECTS.map((project, index) => (
          <div
            key={index}
            className="project-card w-[90vw] md:w-[60vw] lg:w-[45vw] h-full flex-shrink-0 pr-8 md:pr-12 lg:pr-24 flex flex-col justify-center"
          >
            <div className="h-[80%] w-full rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 md:p-12 flex flex-col justify-between hover:border-[#00f0ff]/40 transition-colors duration-500 relative overflow-hidden group">

              {/* Background Glow */}
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-[100px] group-hover:bg-[#00f0ff]/20 transition-all duration-700" />

              <div>
                <div className="font-medium text-[10px] uppercase tracking-wider mb-6 text-gray-500">
                  {`0${index + 1} // PROTOCOL ENGAGED`}
                </div>
                <h3 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[0.9] text-white mb-6">
                  {project.title}
                </h3>
                <p className="text-lg font-sans leading-relaxed text-gray-400 md:w-3/4">
                  {project.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8 z-10">
                {project.tech.map((t, i) => (
                  <span key={i} className="px-4 py-2 rounded-full border border-white/20 text-[10px] font-medium uppercase tracking-wider text-[#00f0ff]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const SkillsMarquee = () => {
  return (
    <section className="py-24 overflow-hidden bg-[#030303] relative z-20 border-y border-white/5">
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#030303] to-transparent z-10" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#030303] to-transparent z-10" />

      {/* Top row flowing left */}
      <div className="flex w-max animate-marquee pb-8">
        {[...SKILLS, ...SKILLS].map((skill, index) => (
          <div key={index} className="px-8 text-3xl md:text-6xl font-bold tracking-tight text-white/20 whitespace-nowrap hover:text-white transition-colors duration-300">
            <ScrambleText text={`+ ${skill} `} />
          </div>
        ))}
      </div>

      {/* Bottom row flowing right */}
      <div className="flex w-max animate-marquee-reverse">
        {[...SKILLS.reverse(), ...SKILLS.reverse()].map((skill, index) => (
          <div key={index} className="px-8 text-3xl md:text-6xl font-bold tracking-tight text-white/20 whitespace-nowrap hover:text-white transition-colors duration-300">
            <ScrambleText text={`+ ${skill} `} />
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="relative w-full min-h-screen bg-[#00f0ff] flex flex-col items-center justify-center p-4 md:p-12 z-20 overflow-hidden text-black text-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

      <Magnetic>
        <h2 className="text-6xl md:text-[10vw] font-medium tracking-tighter leading-[0.9] mb-12 mix-blend-multiply text-white">
          Let&apos;s Build<br />The Future
        </h2>
      </Magnetic>

      <div className="flex gap-8 font-semibold text-sm uppercase z-10 text-white/80">
        <Magnetic>
          <a href="mailto:muhammednaseeb02@gmail.com" className="hover:text-white transition-colors">Email</a>
        </Magnetic>
        <Magnetic>
          <a href="https://linkedin.com/in/naseeb-nex" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
        </Magnetic>
        <Magnetic>
          <a href="https://github.com/Naseeb-Nex" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
        </Magnetic>
      </div>

      <div className="absolute bottom-8 font-medium text-[10px] uppercase tracking-wider col-span-full opacity-60 text-white">
        © {new Date().getFullYear()} MUHAMMED NASEEB // AWWWARDS GRADE
      </div>
    </footer>
  );
};

// ----------------------------------------------------------------------------
// MAIN LAYOUT
// ----------------------------------------------------------------------------

export default function Portfolio() {
  const [loading, setLoading] = useState(true);

  // Initialize smooth scrolling with Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-[#030303] min-h-screen text-white overflow-x-hidden selection:bg-[#00f0ff] selection:text-black">
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <CustomCursor />

      {/* Persistent WebGL Background layer (for other sections if needed, though Hero has its own) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {!loading && <Navbar />}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        <Hero />
        <Experience />
        <FeaturedProjects />
        <SkillsMarquee />
        <Footer />
      </motion.main>

      {/* 
        Tailwind global keyframes integration.
        In a real app, this goes to globals.css. Injecting here for the monolithic constraint.
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
      `}} />
    </div>
  );
}
