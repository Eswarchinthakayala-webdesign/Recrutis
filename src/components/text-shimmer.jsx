"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TextShimmer = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
  delay = 0,
  repeatDelay = 0,
}) => {
  const MotionComponent = motion.create(Component);

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <MotionComponent
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text",
        "text-transparent [--base-color:#27272a] [--base-gradient-color:#fff]",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(60%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        "dark:[--base-color:#f3f4f6] dark:[--base-gradient-color:#000] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(60%+var(--spread)))]",
        className
      )}
      initial={{ backgroundPosition: "105% center" }}
      animate={{ backgroundPosition: "-5% center" }}
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: "linear",
        delay,
        repeatDelay,
      }}
      style={{
        "--spread": `${dynamicSpread}px`,
        backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
      }}
    >
      {children}
    </MotionComponent>
  );
};

export default React.memo(TextShimmer);
