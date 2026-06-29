"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function BackgroundEffects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] bg-indigo-500/20 dark:bg-indigo-500/10"
        animate={{
          x: mousePosition.x - 300,
          y: mousePosition.y - 300,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 200, mass: 1 }}
      />
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] bg-cyan-400/20 dark:bg-cyan-400/10"
        animate={{
          x: mousePosition.x - 400,
          y: mousePosition.y - 400,
        }}
        transition={{ type: "spring", damping: 100, stiffness: 100, mass: 2, delay: 0.1 }}
      />
      {/* Static ambient orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] bg-purple-500/20" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-emerald-500/10" />
    </div>
  );
}
