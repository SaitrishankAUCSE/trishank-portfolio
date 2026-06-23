"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "../../lib/utils";
import type { LucideIcon } from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  href?: string;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  href?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring" as const, bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(outsideClickRef as React.RefObject<HTMLDivElement>, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number, href?: string) => {
    setSelected(index);
    onChange?.(index);
    if (href) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-[rgba(255,87,34,0.2)]" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.85)] p-1 shadow-lg backdrop-blur-xl",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index, tab.href)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300",
              selected === index
                ? cn("bg-[rgba(255,87,34,0.12)]", activeColor)
                : "text-[#5e5e72] hover:bg-[rgba(255,87,34,0.06)] hover:text-[#b0b0be]"
            )}
          >
            <Icon size={18} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap font-['JetBrains_Mono',monospace] text-xs tracking-wide"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
