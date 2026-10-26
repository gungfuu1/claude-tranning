"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/hero-slides";

const SLIDE_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  // The slide that is fading out keeps its Ken Burns animation so it doesn't snap back mid-fade.
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pointerX = useRef<number | null>(null);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (slides.length === 0) return null;

  const paused = hovered || focused || hidden;
  const go = (i: number) => {
    const target = (i + slides.length) % slides.length;
    if (target === index) return;
    setPrevIndex(index);
    setIndex(target);
  };
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="ไฮไลต์หลักสูตร"
      className="relative isolate h-[600px] touch-pan-y overflow-hidden bg-pea-primary-dark text-white md:h-[640px]"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      // Pause only for keyboard focus; clicking a dot also focuses it but shouldn't stop autoplay.
      onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
      onPointerDown={(e) => (pointerX.current = e.clientX)}
      onPointerCancel={() => (pointerX.current = null)}
      onPointerUp={(e) => {
        if (pointerX.current === null) return;
        const dx = e.clientX - pointerX.current;
        pointerX.current = null;
        if (dx < -50) next();
        if (dx > 50) prev();
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 -z-20 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={s.alt}
            fill
            sizes="100vw"
            preload={i === 0}
            draggable={false}
            className={`object-cover ${
              i === index || i === prevIndex ? "motion-safe:animate-kenburns" : ""
            }`}
          />
        </div>
      ))}

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-pea-primary-dark/95 via-pea-primary/75 to-pea-primary/20"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-pea-primary-dark/70 via-transparent to-transparent"
      />

      <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-4 pb-24">
        <div aria-live={paused ? "polite" : "off"} className="max-w-xl">
          <div key={slide.id}>
            <span className="motion-safe:animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-pea-accent" />
              {slide.eyebrow}
            </span>
            <h1 className="motion-safe:animate-fade-up mt-5 text-4xl font-bold leading-tight [animation-delay:100ms] sm:text-5xl">
              {slide.title}
              <br />
              <span className="text-pea-accent">{slide.highlight}</span>
            </h1>
            <p className="motion-safe:animate-fade-up mt-5 text-base leading-7 text-white/85 [animation-delay:200ms]">
              {slide.description}
            </p>
            <div className="motion-safe:animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:300ms]">
              <a
                href={slide.cta.href}
                draggable={false}
                className="rounded-lg bg-pea-accent px-5 py-3 text-sm font-semibold text-pea-primary-dark shadow-lg shadow-black/20 hover:brightness-110"
              >
                {slide.cta.label}
              </a>
              <a
                href="#about"
                draggable={false}
                className="rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/10"
              >
                สมัครเรียน
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-20 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`สไลด์ที่ ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className={`relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-500 ${
                i === index ? "w-12" : "w-6 hover:bg-white/50"
              }`}
            >
              {i === index && (
                <span
                  key={index}
                  onAnimationEnd={next}
                  style={{
                    animationDuration: `${SLIDE_MS}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                  className="absolute inset-y-0 left-0 bg-pea-accent motion-safe:animate-progress motion-reduce:w-full"
                />
              )}
            </button>
          ))}
          <span className="ml-3 text-xs tabular-nums text-white/70">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <div className="hidden gap-2 md:flex">
          <ArrowButton label="สไลด์ก่อนหน้า" onClick={prev} d="M15 18l-6-6 6-6" />
          <ArrowButton label="สไลด์ถัดไป" onClick={next} d="M9 18l6-6-6-6" />
        </div>
      </div>
    </section>
  );
}

function ArrowButton({ label, onClick, d }: { label: string; onClick: () => void; d: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/5 backdrop-blur-sm transition hover:bg-white/15"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}
