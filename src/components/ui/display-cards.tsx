"use client";

import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";
import React from "react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-[#ff5722]" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-[#ff5722]",
  titleClassName = "text-[#ff5722]",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.85)] backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-[rgba(255,87,34,0.35)] hover:bg-[rgba(255,255,255,0.04)] [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-[0_8px_30px_rgba(255,87,34,0.04)]",
        className
      )}
    >
      <div>
        <span className={cn("relative inline-block rounded-full bg-[rgba(255,87,34,0.12)] p-2", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)} style={{ fontFamily: "'Syne', sans-serif" }}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-sm text-muted-foreground" style={{ color: "rgba(255,255,255,0.7)" }}>{description}</p>
      <p className="text-xs text-[#ff5722]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
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
