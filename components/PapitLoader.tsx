// components/CircleLoader.tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function PapitLoader() {
  const circleRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;  

    gsap.set(circle, { strokeDasharray: 283, strokeDashoffset: 280 });

    gsap.to(circle, {
      strokeDashoffset: 0,
      rotation: 360,
      transformOrigin: "50% 50%",
      repeat: -1,
      ease: "linear",
      duration: 1.5,
    });
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        className="rotate-[-90deg]" 
      >
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r="45"
          stroke="black"
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
