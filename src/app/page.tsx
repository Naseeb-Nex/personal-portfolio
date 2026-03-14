"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pacifico } from "next/font/google";
import localFont from "next/font/local";
import { motion, useSpring, useMotionValue, useScroll, useTransform, AnimatePresence } from "framer-motion";

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
import dynamic from "next/dynamic";

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
          {NAV_LINKS.map((item) => (
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
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="relative block py-2 group"
                  >
                    <span className="relative inline-flex flex-col overflow-hidden">
                      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
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
      </motion.header>
    </div>
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
      </div>

      <div className="w-full max-w-[1400px] flex flex-col md:flex-row items-center relative z-20 h-full pt-20 md:pt-0">
        {/* Left Section (Text) */}
        <div className="w-full md:w-[60%] lg:w-[50%] flex flex-col items-start justify-center text-left relative z-20 pl-4 md:pl-8">
          
          {/* Top Labels with Crosshairs */}
          <motion.div 
            className="relative w-full mb-8 font-mono text-[11px] text-gray-400 uppercase tracking-widest"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            {/* Crosshairs */}
            <div className="absolute -top-10 -left-6 text-gray-500/50 text-xl font-light pointer-events-none">+</div>
            <div className="absolute -top-10 right-20 text-gray-500/50 text-xl font-light pointer-events-none hidden md:block">+</div>
            
            <div className="flex items-center gap-8 md:gap-16">
              <span>// SYS.ONLINE_</span>
              <span>[AI_ENGINEER_PORTFOLIO]</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-[7.5vw] font-medium tracking-tighter leading-[1] text-white drop-shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            {HERO.heading[0]} <br></br> {HERO.heading[1]} <br></br> 
            <div className="mt-2 text-transparent [-webkit-text-stroke:2px_#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <span className={`${asgard.className} tracking-[4px]`}>{HERO.heading[2]}</span> <span className={pacifico.className}>&</span> <br></br> 
              <span className={`${asgard.className} tracking-[4px]`}>{HERO.heading[3]}</span>.
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

          <motion.div
            className="mt-10 md:mt-12 z-20 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.8, type: "spring" }}
          >
            <Magnetic>
              <Link href="#about" className="relative group inline-flex items-center justify-center px-8 py-3.5 rounded-full overflow-hidden text-white font-mono text-sm font-bold tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.4),0_0_20px_rgba(255,0,255,0.2)] bg-[#050505]">
                {/* Glowing border effect using padding */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] via-[#8a2be2] to-[#ff00ff] opacity-80" />
                <div className="absolute inset-[2px] bg-[#050505] rounded-full z-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/20 to-[#ff00ff]/20 z-0 blur-md group-hover:blur-lg transition-all" />
                
                <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                  [INITIALIZE WORK] <span className="text-lg leading-none transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                </span>
              </Link>
            </Magnetic>
            
            {/* Bottom-left Crosshair for the text block */}
            <div className="absolute -bottom-16 -left-6 text-gray-500/50 text-xl font-light pointer-events-none">+</div>
          </motion.div>
        </div>

        {/* Spacer for MD flex Layout to maintain structure while model is absolute */}
        <div className="hidden md:block w-full md:w-[40%] lg:w-[50%] h-full pointer-events-none" />
      </div>

      {/* Right Section / Canvas Container - full bleed to right corner */}
      <div className="absolute bottom-0 right-0 w-full md:w-[60vw] lg:w-[55vw] h-[50vh] md:h-full z-10 pointer-events-none flex items-center justify-center">
        <RobotModel />
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-[10px] font-mono text-white/50 uppercase tracking-widest z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <span>SCROLL TRAJECTORY</span>
        <div className="w-[1px] h-12 md:h-16 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
      
      {/* Bottom Crosshairs */}
      <div className="absolute bottom-10 left-[45%] text-gray-500/50 text-xl font-light pointer-events-none z-20 hidden md:block">+</div>
      
      {/* 4-point Star on bottom right */}
      <div className="absolute bottom-10 right-10 z-20 opacity-50 text-white flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C20 11.0457 28.9543 20 40 20C28.9543 20 20 28.9543 20 40C20 28.9543 11.0457 20 0 20C11.0457 20 20 11.0457 20 0Z" fill="currentColor"/>
        </svg>
      </div>
    </section>
  );
};

const About = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const bgY = useTransform(scrollYProgress, [0, 1], [-50, 200]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.5, 0]);

  return (
    <section id="about" ref={targetRef} className="relative w-full py-32 px-4 md:px-12 z-20 bg-[#030303] overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-16 md:gap-24 relative z-10">
        <div className="flex-1">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[0.9] text-white mb-12">
              <RevealText text={ABOUT.title} />
            </h2>
          </ScrollReveal>
          <div className="space-y-6 text-lg text-gray-400 font-sans leading-relaxed">
            {ABOUT.paragraphs.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <p>{p}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <motion.div style={{ y }} className="p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm relative overflow-hidden group">
            <ScrollReveal delay={0.2}>
              <h3 className="text-2xl font-bold text-white mb-4">
                {ABOUT.sublineTitle}
              </h3>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <p className="text-[#00f0ff] font-medium leading-relaxed">
                {ABOUT.sublineDescription}
              </p>
            </ScrollReveal>
          </motion.div>
        </div>
      </div>
      <motion.div 
        style={{ y: bgY, opacity: opacity }}
        className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-[#00f0ff]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"
      />
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
