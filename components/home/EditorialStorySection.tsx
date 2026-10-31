"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const SLIDES = [
  {
    number: "01",
    title: "Our Approach.",
    text: "We combine creative thinking with technical precision to transform complex ideas into simple, scalable digital experiences.",
  },
  {
    number: "02",
    title: "Our Vision.",
    text: "To help ambitious businesses use technology as a genuine competitive advantage.",
  },
  {
    number: "03",
    title: "Our Mission.",
    text: "Build digital products that are useful, beautiful, reliable and ready to grow.",
  },
];

export default function EditorialStorySection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  // Autoplay every 4.5 seconds with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const progressPercent = ((current + 1) / SLIDES.length) * 100;

  return (
    <section 
      className="af-editorial py-16 md:py-24 bg-[#FCFAF8] border-b border-[#E8DDE0]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Editorial Story & Agency Philosophy"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5DADD] shadow-[0_12px_40px_rgba(74,16,37,0.06)]">
          {/* TOP */}
          <div className="af-top">
            {/* IMAGE SIDE: CEO Laiba Baig */}
            <div
              className="af-image-panel relative overflow-hidden"
              role="img"
              aria-label="CEO Laiba Baig, Founder & Chief Executive Officer of AvantusForge"
            >
              <Image
                src="/team/laiba-baig-ceo.jpg"
                alt="CEO Laiba Baig — Founder and Chief Executive Officer at AvantusForge"
                fill
                className="object-cover object-top"
                priority
              />
              <div className="af-image-overlay relative z-1"></div>

              {/* decorative graphic */}
              <div className="af-orbit af-orbit-1 z-2"></div>
              <div className="af-orbit af-orbit-2 z-2"></div>

              <div className="af-image-label z-3">
                <span>CEO</span>
                LAIBA BAIG &bull; FOUNDER
              </div>
            </div>

            {/* INTRO SIDE */}
            <div className="af-intro-panel">
              <Link href="/about" className="af-pill">
                ABOUT AVANTUSFORGE
              </Link>

              <div className="af-intro-content">
                <h2>
                  Turning digital <em>complexity</em> into meaningful growth.
                </h2>
              </div>

              <div className="af-panel-mark">AF</div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="af-bottom">
            {/* LEFT CONTENT */}
            <div className="af-story">
              <p className="af-description">
                AvantusForge brings together strategy, design and technology
                to build high-performance digital solutions for modern
                businesses. From websites and e-commerce platforms to
                custom software and applications, we create experiences
                engineered for growth.
              </p>

              <div className="af-features">
                <div className="af-feature">
                  <div className="af-feature-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 19L10 13L14 17L21 10" />
                      <path d="M15 10H21V16" />
                    </svg>
                  </div>

                  <div>
                    <h3>Strategy-Driven</h3>
                    <p>Digital solutions built around your business goals.</p>
                  </div>
                </div>

                <div className="af-feature">
                  <div className="af-feature-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 8V12L15 14" />
                    </svg>
                  </div>

                  <div>
                    <h3>Built To Scale</h3>
                    <p>Technology designed for performance and long-term growth.</p>
                  </div>
                </div>
              </div>

              <Link href="/contact" className="af-main-button">
                <span>START A PROJECT</span>
                <svg viewBox="0 0 24 24">
                  <path d="M5 12H19" />
                  <path d="M13 6L19 12L13 18" />
                </svg>
              </Link>
            </div>

            {/* RIGHT CONTENT */}
            <div className="af-info">
              <div className="af-experience">
                <div className="af-number">
                  <span id="afCounter">40</span>
                  <sup>+</sup>
                </div>

                <div className="af-experience-text">
                  <span>PROJECTS</span>
                  <span>DELIVERED</span>
                </div>
              </div>

              <div className="af-divider"></div>

              <div className="af-slider">
                {SLIDES.map((slide, idx) => (
                  <div
                    key={slide.number}
                    className={`af-slide ${current === idx ? "active" : ""}`}
                  >
                    <div className="af-slide-number">{slide.number}</div>
                    <div>
                      <h3>{slide.title}</h3>
                      <p>{slide.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="af-navigation">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="af-prev"
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M19 12H5" />
                    <path d="M11 6L5 12L11 18" />
                  </svg>
                </button>

                <div className="af-progress">
                  <span style={{ width: `${progressPercent}%` }}></span>
                </div>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="af-next"
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12H19" />
                    <path d="M13 6L19 12L13 18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
