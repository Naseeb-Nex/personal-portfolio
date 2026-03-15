'use client';
import React, { useState } from 'react';
import { Liquid } from '@/components/ui/button-1';

// Teal palette: #07beb8 → #3dccc7 → #68d8d6 → #9ceaef → #c4fff9
const COLORS = {
  color1:  '#c4fff9', // Near-white Mint (highlight)
  color2:  '#07beb8', // Deep Teal
  color3:  '#68d8d6', // Medium Teal
  color4:  '#e8fffd', // Very light mint
  color5:  '#d8fefb', // Light mint
  color6:  '#9ceaef', // Pale Cyan
  color7:  '#04a5a0', // Dark Teal
  color8:  '#059e99', // Deep Teal (alt)
  color9:  '#3dccc7', // Teal
  color10: '#68d8d6', // Medium Teal
  color11: '#07beb8', // Deep Teal
  color12: '#9ceaef', // Pale Cyan
  color13: '#038c88', // Darker Teal
  color14: '#b8f5f3', // Light cyan
  color15: '#a8efec', // Pale teal
  color16: '#046e6b', // Very dark teal
  color17: '#2bb8b3', // Mid teal
};

const LetsConnectButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="flex justify-center flex-none ml-6">
      <a
        href="#contact"
        className="relative inline-block sm:w-48 w-40 h-[2.7em] mx-auto group dark:bg-black bg-white dark:border-white border-black border-2 rounded-lg pointer-events-auto shadow-md">
        <div className="absolute w-[112.81%] h-[128.57%] top-[8.57%] left-1/2 -translate-x-1/2 filter blur-[19px] opacity-70">
          <span className="absolute inset-0 rounded-lg bg-[#07beb8] filter blur-[6.5px]"></span>
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <Liquid isHovered={isHovered} colors={COLORS} />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92.23%] h-[112.85%] rounded-lg bg-[#011a1a] filter blur-[7.3px]"></div>
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <span className="absolute inset-0 rounded-lg bg-[#07beb8] opacity-20"></span>
          <span className="absolute inset-0 rounded-lg bg-[#011a1a]"></span>
          <Liquid isHovered={isHovered} colors={COLORS} />
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`absolute inset-0 rounded-lg border-solid border-[3px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${i <= 2 ? 'blur-[3px]' : i === 3 ? 'blur-[5px]' : 'blur-[4px]'}`}></span>
          ))}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-lg filter blur-[15px] bg-[#07beb8] opacity-40"></span>
        </div>
        <button
          className="absolute inset-0 rounded-lg bg-transparent cursor-pointer"
          aria-label="Let's Connect"
          type="button"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <span className="flex items-center justify-center gap-2 rounded-lg group-hover:text-[#c4fff9] text-white text-base font-semibold tracking-wide whitespace-nowrap px-4 py-2">
            <span>Let's Connect</span>
          </span>
        </button>
      </a>
    </div>
  );
};

export default LetsConnectButton;
