"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring, useMotionValue, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { Network, Brain, Zap, Cloud, Shield } from "lucide-react";

import { Component as FlowGradientHero } from "@/components/ui/flow-gradient-hero-section";
import logoImg from "@/assets/images/logo.png";
import dynamic from "next/dynamic";
import LetsConnectButton from "@/components/ui/lets-connect-button";
import DisplayCards from "@/components/ui/display-cards";

const RobotModel = dynamic(() => import("@/components/ui/RobotModel"), { ssr: false });

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import {
  NAV_LINKS, HERO, ABOUT, PROCESS, EXPERIENCE, PROJECTS, SKILLS, RECOGNITION, CONTACT, FOOTER
} from "@/lib/data";

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
 * ScrollReveal Component
 * Fades in and translates up smoothly when scrolled into view
 */
const ScrollReveal = ({ children, delay = 0, yOffset = 50 }: { children: React.ReactNode; delay?: number; yOffset?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: yOffset }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

/**
 * Kinetic Text Animation
 * Splits text into staggered characters or words, triggers on scroll
 */
const RevealText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span className="inline-block overflow-hidden">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] pb-1">
          <motion.span
            initial={{ y: "100%", rotate: 10, opacity: 0 }}
            whileInView={{ y: 0, rotate: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1], // Expo out curve
              delay: delay + i * 0.05
            }}
            className="inline-block origin-top-left"
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
  const navRef = useRef<HTMLDivElement>(null);

  // Track scroll progress from start of page
  const { scrollY } = useScroll();
  
  // Transform scroll position to navbar Y position
  // Starts hiding after scrolling 100px, fully hidden by 400px
  const navY = useTransform(
    scrollY,
    [0, 100, 400],
    [0, -50, -200]
  );

  // Optional: fade out as well for smoother effect
  const navOpacity = useTransform(
    scrollY,
    [0, 100, 400],
    [1, 0.7, 0]
  );

  return (
    <motion.div 
      ref={navRef}
      className="fixed top-6 md:top-10 left-0 w-full z-[100] px-6 lg:px-12 pointer-events-none"
      style={{ 
        y: navY,
        opacity: navOpacity
      }}
    >
      <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
        
        {/* Left: Logo + Name */}
        <div className="flex flex-1 items-center gap-4 justify-start pointer-events-auto">
          <Magnetic>
            <Link href="/" className="relative z-10 flex items-center group">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image src={logoImg} alt="Logo" width={40} height={40} className="w-10 h-10 object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300" />
              </motion.div>
            </Link>
          </Magnetic>
          <span className="hidden lg:block font-anthony text-white/90 font-medium text-2xl md:text-3xl tracking-wide whitespace-nowrap">
            Muhammed Naseeb
          </span>
        </div>

        {/* Center: Glass Nav Pill */}
        <motion.header
          className="glass-nav-card flex-none px-6 h-[2.7em] flex items-center justify-center pointer-events-auto"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* Desktop Menu Links */}
          <nav className="relative z-10 hidden md:flex items-center gap-3 lg:gap-6 font-medium text-xs md:text-sm uppercase tracking-wider text-gray-300">
            {NAV_LINKS.filter(link => link.name !== "Let's Connect").map((item) => (
              <Magnetic key={item.name}>
                <Link
                  href={item.href}
                  className="relative block px-3 py-1 group hover:text-white transition-colors duration-300"
                >
                  <span className="relative inline-flex flex-col overflow-hidden">
                    <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                      {item.name}
                    </span>
                    <span className="block absolute inset-0 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 text-white font-semibold">
                      {item.name}
                    </span>
                  </span>
                  <span className="absolute left-3 right-3 bottom-0.5 h-[2px] rounded-full bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center ease-[cubic-bezier(0.22,1,0.36,1)]" />
                </Link>
              </Magnetic>
            ))}
          </nav>
        </motion.header>

        {/* Right: Empty space to balance flex or Mobile Toggle */}
        <div className="flex-1 flex justify-end items-center gap-4 pointer-events-auto">
          
          {/* Let's Connect Independent Glass Button - Desktop */}
          <motion.div 
            className="hidden md:flex items-center justify-center pointer-events-auto"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <LetsConnectButton />
          </motion.div>

          {/* Mobile Menu Toggle */}
          <Magnetic>
            <button
              className="relative z-10 md:hidden text-gray-300 hover:text-white p-2 overflow-hidden rounded-lg group outline-none transition-colors duration-300 bg-black/20 backdrop-blur-md border border-white/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <motion.svg
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" className="relative z-10 w-5 h-5 transition-transform duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </motion.svg>
            </button>
          </Magnetic>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-[calc(100%+1rem)] left-0 w-full bg-[#141414]/95 backdrop-blur-lg border border-white/10 p-6 flex flex-col gap-6 md:hidden overflow-hidden origin-top pointer-events-auto shadow-2xl rounded-2xl"
            initial={{ opacity: 0, scaleY: 0.95, y: -10 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.95, y: -10 }}
          >
            <nav className="flex flex-col gap-4 font-mono text-sm uppercase text-gray-300 text-center">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="relative block py-2 group"
                >
                  <span className="relative inline-flex flex-col overflow-hidden">
                    <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full text-[#00f0ff]">
                      {item.name}
                    </span>
                    <span className="block absolute inset-0 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 text-white font-bold">
                      {item.name}
                    </span>
                  </span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};



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
        {/* Geometric Grid Overlay for AI Engineer Vibe */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,transparent_0%,#000_100%)] z-10 pointer-events-none" />
      </div>

      <div className="w-full max-w-[1400px] flex flex-col md:flex-row items-center relative z-20 h-full pt-20 md:pt-0">
        {/* Left Section (Text) */}
        <div className="w-full md:w-[60%] lg:w-[50%] flex flex-col items-start justify-center text-left relative z-20 pl-4 md:pl-8">


          <motion.h1
            className="text-6xl md:text-7xl lg:text-[7.5vw] font-medium tracking-tighter leading-[1] relative inline-block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            {/* Background cyan glow to increase visibility */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#00f0ff]/20 blur-[80px] rounded-full pointer-events-none -z-10" />
            
            <div className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/10 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] inline-block">
              {HERO.heading[0]} <br /> {HERO.heading[1]}
            </div>
            <br />
            <div className="mt-2 text-transparent bg-clip-text bg-gradient-to-br from-[#00f0ff] via-[#00f0ff]/80 to-[#00f0ff]/30 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] drop-shadow-[0_0_25px_rgba(0,240,255,0.6)] inline-block whitespace-nowrap">
              <span className="tracking-[4px]">{HERO.heading[2]}</span> &amp; <span className="tracking-[4px]">{HERO.heading[3]}</span>
            </div>
          </motion.h1>

          <motion.p
            className="mt-6 md:mt-8 max-w-[550px] text-base md:text-lg text-white/70 font-sans leading-relaxed z-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1 }}
          >
            {HERO.subheading}
          </motion.p>
        </div>

        {/* Spacer for MD flex Layout to maintain structure while model is absolute */}
        <div className="hidden md:block w-full md:w-[40%] lg:w-[50%] h-full pointer-events-none" />
      </div>

      {/* Right Section / Canvas Container - full bleed to right corner */}
      <div className="absolute bottom-0 right-[-4vw] w-full md:w-[75vw] lg:w-[65vw] h-[50vh] md:h-full z-[90] pointer-events-none flex items-center justify-center">
        <RobotModel />
      </div>

      {/* Scroll Indicator */}
      <motion.a
        href="#about"
        className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[10px] font-mono text-white/40 uppercase tracking-widest z-20 cursor-pointer group hover:text-[#00f0ff]/80 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <span className="tracking-[3px] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all">SCROLL</span>
        <motion.svg 
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="group-hover:text-[#00f0ff]"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <line x1="12" y1="4" x2="12" y2="20"></line>
          <polyline points="18 14 12 20 6 14"></polyline>
        </motion.svg>
      </motion.a>
      
      {/* Bottom Crosshairs */}
      <div className="absolute bottom-10 left-[45%] text-gray-500/50 text-xl font-light pointer-events-none z-20 hidden md:block">+</div>
      

    </section>
  );
};

const About = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start start"],
  });

  // Transform heading from center to top, then stop
  const headingY = useTransform(scrollYProgress, [0, 0.5], ["45vh", "0vh"]);
  const headingScale = useTransform(scrollYProgress, [0, 0.5], [1.2, 0.8]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  
  // Content appears after heading settles
  const contentOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.4, 0.6], [100, 0]);

  // Icons for each expertise area
  const expertiseIcons = [
    <Network className="size-4 text-[#00f0ff]" key="network" />,
    <Brain className="size-4 text-[#00f0ff]" key="brain" />,
    <Zap className="size-4 text-[#00f0ff]" key="zap" />,
    <Cloud className="size-4 text-[#00f0ff]" key="cloud" />,
    <Shield className="size-4 text-[#00f0ff]" key="shield" />
  ];

  // Generate all 5 cards with proper stacking and 3D lift animation
  const allCards = ABOUT.expertise.map((item, i) => {
    const isHovered = hoveredIndex === i;
    
    // Base positioning for each card in the stack
    const baseTranslateX = i * 12; // 3rem spacing
    const baseTranslateY = i * 10; // 2.5rem spacing
    
    // Build className with proper stacking
    let className = "[grid-area:stack] transition-all duration-500 ease-out ";
    
    // Add grayscale and overlay effects
    className += "before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 before:left-0 before:top-0 before:transition-opacity before:duration-500 ";
    
    if (isHovered) {
      // When hovered: lift up from current position with 3D effect
      className += `grayscale-0 before:opacity-0 -translate-y-16 scale-105 shadow-2xl shadow-[#00f0ff]/20 z-[${50 + i}] `;
    } else {
      // Default position in stack
      className += `grayscale-[100%] before:opacity-100 translate-x-[${baseTranslateX * 4}px] translate-y-[${baseTranslateY * 4}px] z-[${i}] `;
    }

    return {
      icon: expertiseIcons[i],
      title: item.shortTitle,
      description: item.cardDescription,
      date: `0${i + 1}`,
      iconClassName: "text-[#00f0ff]",
      titleClassName: "text-[#00f0ff]",
      className: className,
      style: {
        transform: isHovered 
          ? `translate(${baseTranslateX * 4}px, ${baseTranslateY * 4 - 64}px) scale(1.05) skewY(-8deg) rotateX(5deg)` 
          : `translate(${baseTranslateX * 4}px, ${baseTranslateY * 4}px) skewY(-8deg)`,
        zIndex: isHovered ? 50 + i : i,
        transformStyle: 'preserve-3d',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    };
  });

  return (
    <section id="about" ref={targetRef} className="relative w-full min-h-screen py-20 md:py-32 px-4 md:px-12 lg:px-16 z-20 bg-[#030303] overflow-hidden">
      
      {/* Sticky Container for Heading and Content */}
      <div className="sticky top-0 left-0 w-full h-screen flex flex-col justify-center pointer-events-none z-30 py-8 md:py-12">
        
        {/* Large Heading - Animates from center to top, then stays */}
        <motion.div 
          className="w-full flex items-center justify-center mb-8 md:mb-12"
          style={{ y: headingY }}
        >
          <motion.h2 
            className="text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[8vw] font-bold tracking-tighter leading-[0.9] text-white text-center px-4"
            style={{ scale: headingScale, opacity: headingOpacity }}
          >
            What I Do
          </motion.h2>
        </motion.div>

        {/* Content Container - Appears after heading settles */}
        <motion.div 
          className="flex-1 max-w-[1600px] w-full mx-auto px-4 flex items-center"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 w-full items-center">
            
            {/* Left Side - DisplayCards with all items centered */}
            <div className="w-full md:w-1/2 flex items-center justify-center pointer-events-auto min-h-[400px]" style={{ perspective: '1000px' }}>
              <div className="w-full max-w-3xl">
                <DisplayCards cards={allCards} />
              </div>
            </div>

            {/* Right Side - Service Blocks */}
            <div className="w-full md:w-1/2 flex flex-col gap-3 md:gap-4 pointer-events-auto overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[60vh]">
              {ABOUT.expertise.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative p-5 md:p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-500 group flex-shrink-0"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "rgba(0, 240, 255, 0.5)",
                    backgroundColor: "rgba(0, 240, 255, 0.05)"
                  }}
                >
                  {/* Number Badge - Left Aligned */}
                  <div className="absolute top-4 md:top-6 left-4 md:left-6 text-white/10 font-bold text-3xl md:text-4xl lg:text-5xl group-hover:text-[#00f0ff]/20 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-[#00f0ff] transition-colors pl-12 md:pl-16 pr-12 md:pr-16 leading-tight">
                    {item.title}
                  </h3>

                  {/* Plus Icon */}
                  <motion.div 
                    className="absolute bottom-4 md:bottom-6 right-4 md:right-6 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"
                    animate={{ rotate: hoveredIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-[#00f0ff] w-full h-full"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spacer to allow scroll and prevent overlap with next section */}
      <div className="h-[60vh] md:h-[50vh]" />
    </section>
  );
};

const Process = () => {
  return (
    <section id="process" className="relative w-full py-32 px-4 md:px-12 z-20 bg-[#000]">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[0.9] text-white mb-8">
              <RevealText text={PROCESS.title} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-lg text-gray-400 font-sans leading-relaxed">
              {PROCESS.intro}
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {PROCESS.phases.map((phase, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#00f0ff]/30 hover:-translate-y-2 transition-all duration-500 group h-full">
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00f0ff] transition-colors">{phase.title}</h3>
                <p className="text-sm text-gray-400 font-sans leading-relaxed">{phase.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-2">
          {PROCESS.closing.map((line, i) => (
            <ScrollReveal key={i} delay={i * 0.1 + 0.4}>
              <p className={`text-xl md:text-2xl font-medium ${i === PROCESS.closing.length - 1 ? 'text-[#00f0ff]' : 'text-white'}`}>
                {line}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Recognition = () => {
  return (
    <section id="recognition" className="relative w-full py-32 px-4 md:px-12 z-20 bg-[#050505]">
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter leading-[0.9] text-white mb-16 text-center">
            <RevealText text={RECOGNITION.title} />
          </h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {RECOGNITION.items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.2}>
              <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group hover:border-yellow-500/30 transition-colors h-full">
                <div className="absolute top-0 right-0 p-8 text-white/10 font-bold text-6xl group-hover:text-yellow-500/10 transition-colors pointer-events-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 pr-12 leading-snug">
                  {item.title}
                </h3>
                <div className="text-yellow-500 font-medium text-sm mb-6 uppercase tracking-wider">
                  {item.organization} // {item.date}
                </div>
                <p className="text-gray-400 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Experience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"]});

  return (
    <section id="experience" ref={containerRef} className="relative w-full py-32 px-4 md:px-12 z-20 bg-[#030303]">
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter leading-[0.9] text-white mb-4">
            <RevealText text={EXPERIENCE.title} />
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-xl text-gray-400 mb-16">{EXPERIENCE.subtitle}</p>
        </ScrollReveal>

        <div className="relative pl-8 md:pl-28 border-l border-white/10 space-y-32">
          {/* Animated line representing the pathway */}
          <motion.div 
            className="absolute left-[-1px] top-0 w-[2px] bg-gradient-to-b from-[#8a2be2] via-[#00f0ff] to-transparent origin-top"
            style={{ scaleY: scrollYProgress, height: "100%" }}
          />

          {EXPERIENCE.roles.map((exp, index) => (
            <ScrollReveal key={index} delay={0.1}>
              <div className="relative group">
                {/* Glowing Node on Pathway */}
                <div className="absolute -left-[33px] md:-left-[113px] top-0 w-8 h-8 md:w-16 md:h-16 -translate-x-1/2 flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#8a2be2] rounded-full group-hover:scale-150 transition-transform duration-500 z-10 shadow-[0_0_10px_#8a2be2]" />
                  <div className="absolute inset-0 bg-[#8a2be2]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* HUD Panel Content */}
                <div className="glass-panel p-8 md:p-12 border border-white/5 rounded-2xl hover:border-[#8a2be2]/50 hover:-translate-y-1 transition-all duration-500 bg-white/[0.02] backdrop-blur-md">
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8">
                    <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2 md:mb-0">
                      <ScrambleText text={exp.title} />
                    </h3>
                    <span className="font-medium text-sm text-[#00f0ff] uppercase tracking-wider">
                      {exp.duration} | {exp.location}
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
            </ScrollReveal>
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
        <h2 className="text-2xl md:text-4xl font-medium tracking-tighter leading-[0.9] mb-2">{PROJECTS.title}</h2>
        <p className="text-sm md:text-base text-gray-400 max-w-xl">{PROJECTS.subtitle}</p>
      </div>

      <div ref={scrollRef} className="flex h-[70vh] items-center w-[600vw] sm:w-[500vw] lg:w-[300vw] pl-4 md:pl-12 pt-20">
        {PROJECTS.items.map((project, index) => (
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
                <p className="text-lg font-sans leading-relaxed text-gray-400 md:w-3/4 mb-4">
                  {project.description}
                </p>
                <p className="text-md font-sans text-[#00f0ff] font-medium">
                  {project.highlight}
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
        {[...SKILLS.flatItems, ...SKILLS.flatItems].map((skill, index) => (
          <div key={index} className="px-8 text-3xl md:text-6xl font-bold tracking-tight text-white/20 whitespace-nowrap hover:text-white transition-colors duration-300">
            <ScrambleText text={`+ ${skill} `} />
          </div>
        ))}
      </div>

      {/* Bottom row flowing right */}
      <div className="flex w-max animate-marquee-reverse">
        {[...SKILLS.flatItems].reverse().concat([...SKILLS.flatItems].reverse()).map((skill, index) => (
          <div key={index} className="px-8 text-3xl md:text-6xl font-bold tracking-tight text-white/20 whitespace-nowrap hover:text-white transition-colors duration-300">
            <ScrambleText text={`+ ${skill} `} />
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);

  return (
    <footer id="contact" ref={ref} className="relative w-full min-h-screen bg-[#00f0ff] flex flex-col items-center justify-center p-4 md:p-12 z-20 overflow-hidden text-black text-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

      <motion.div style={{ y }} className="relative z-10 flex flex-col items-center">
        <Magnetic>
          <h2 className="text-6xl md:text-[8vw] font-medium tracking-tighter leading-[0.9] mb-12 mix-blend-multiply text-white max-w-[80vw]">
            <RevealText text={CONTACT.title} delay={0.2} />
          </h2>
        </Magnetic>

        <div className="flex flex-wrap justify-center gap-8 font-semibold text-sm uppercase z-10 text-white/90">
          <Magnetic>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors">Email</a>
          </Magnetic>
          <Magnetic>
            <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          </Magnetic>
          <Magnetic>
            <a href={CONTACT.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </Magnetic>
        </div>
      </motion.div>

      <div className="absolute bottom-8 font-medium text-[10px] uppercase tracking-wider col-span-full opacity-60 text-white">
        {FOOTER.text}
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
        {loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}
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
        <About />
        <Process />
        <Experience />
        <FeaturedProjects />
        <SkillsMarquee />
        <Recognition />
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
