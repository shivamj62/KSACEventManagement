"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TextReveal = ({ text, staticText, className }) => {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const words = text.split(" ");
  const staticWords = staticText ? staticText.split(" ") : [];

  return (
    <div ref={targetRef} className={`relative z-0 h-[180vh] ${className}`}>
      <div className="sticky top-0 mx-auto flex h-screen max-w-4xl items-center bg-transparent">
        <p className="flex flex-wrap justify-center p-5 text-5xl font-bold md:p-8 md:text-7xl lg:p-10 tracking-tight leading-tight">
          {staticWords.map((word, i) => (
            <span key={`static-${i}`} className="relative mx-1 lg:mx-3 text-white">
              {word}
            </span>
          ))}
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / (words.length * 1.5); // Slightly faster reveal
            
            // Clean word for matching (remove punctuation like comma)
            const cleanWord = word.replace(/[.,&]/g, "").trim();
            const isGreen = cleanWord.toLowerCase() === "approve";

            return (
              <Word 
                key={i} 
                progress={scrollYProgress} 
                range={[start, end]}
                isGreen={isGreen}
              >
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

const Word = ({ children, progress, range, isGreen }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  
  return (
    <span className="relative mx-1 lg:mx-3">
      {/* Background/dimmed state */}
      <span className="absolute opacity-10 text-[#374151]">{children}</span>
      
      {/* Revealed state */}
      <motion.span 
        style={{ opacity }} 
        className={isGreen ? "text-primary italic" : "text-white"}
      >
        {children}
      </motion.span>
    </span>
  );
};

export default TextReveal;
