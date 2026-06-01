"use client"

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface TextStaggerProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextStagger({ text, className = "", delay = 0 }: TextStaggerProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const words = containerRef.current.querySelectorAll('.word');
    
    gsap.fromTo(
      words,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
        delay: delay
      }
    );
  }, [delay]);

  const words = text.split(' ');

  return (
    <h1 ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i} className="word inline-block mr-[0.25em]">
          {word}
        </span>
      ))}
    </h1>
  );
}
