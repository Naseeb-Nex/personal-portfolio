"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
  style?: React.CSSProperties;
  isHovered?: boolean;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-[#00f0ff]" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-[#00f0ff]",
  titleClassName = "text-[#00f0ff]",
  style,
  isHovered = false,
}: DisplayCardProps) {
  return (
    <div 
      className="relative" 
      style={{ 
        gridArea: 'stack',
        ...style,
      }}
    >
      {/* Card with all effects inside */}
      <div
        className={cn(
          "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-[#0a0a0a]/70 backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-[#030303] after:to-transparent after:content-[''] [&>*]:flex [&>*]:items-center [&>*]:gap-2",
          isHovered ? "border-[#00f0ff]/50 bg-[#0a0a0a]" : "border-white/10",
          className
        )}
      >
        {/* Glare Effect Behind Card - Only visible when hovered */}
        {isHovered && (
          <div 
            className="absolute opacity-0 animate-glare-fade-in pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.005) 0%, rgba(255, 0, 0, 0.002) 30%, transparent 60%)',
              filter: 'blur(50px)',
              borderRadius: '48px',
              top: '-60px',
              left: '-60px',
              right: '-60px',
              bottom: '-60px',
              zIndex: -1,
            }}
          />
        )}
        
        {/* Animated Border Glow - Only visible when hovered */}
        {isHovered && (
          <div className="absolute -inset-[2px] rounded-xl overflow-hidden z-10">
            <div className="absolute inset-0 rounded-xl border-2 border-[#00f0ff]/30 animate-border-pulse" />
            {/* Rotating Glow Effect */}
            <div 
              className="absolute inset-0 rounded-xl animate-border-glow"
              style={{ 
                background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.6), transparent)',
                maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)'
              }} 
            />
          </div>
        )}
        
        {/* Card Content */}
        <div className="relative z-20">
          <span className="relative inline-block rounded-full bg-[#00f0ff]/20 p-1">
            {icon}
          </span>
          <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
        </div>
        <p className="whitespace-nowrap text-lg text-gray-300 relative z-20">{description}</p>
        <p className="text-gray-500 relative z-20">{date}</p>
      </div>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
