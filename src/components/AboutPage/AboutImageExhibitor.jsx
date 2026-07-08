"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const IMAGES = [
  "/about-images/pexels-cottonbro-7541347.jpg",
  "/about-images/pexels-introspectivedsgn-34277923.jpg",
  "/about-images/pexels-introspectivedsgn-34357288.jpg",
  "/about-images/pexels-sejio402-6477203.jpg",
  "/about-images/pexels-tomas-wells-30354857-6930386.jpg",
];

export default function AboutImageExhibitor() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      // Wait for the fade-out to complete before changing the image
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
        setIsFading(false);
      }, 3000); // matches the transition-opacity duration
    }, 8000); // interval including transition time

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[500px] overflow-hidden">
      {/* Background Image Container with slow fade transition */}
      <div
        className={`w-full h-full transition-opacity duration-[1000ms] ease-in-out ${isFading ? "opacity-0" : "opacity-80"
          }`}
      >
        <Image
          src={IMAGES[currentIndex]}
          alt={`Exhibición de refacciones ${currentIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
        />
      </div>

      {/* Gradient overlay: Top-to-bottom on mobile to cover most of the image with a dark overlay, Left-to-right on desktop */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/90 via-40% to-black to-60%  md:via-70%  md:to-90% 2xl:via-40% 2xl:to-70% md:bg-gradient-to-r md:from-transparent md:via-black/30 md:to-black z-10 pointer-events-none" />
    </div>
  );
}
