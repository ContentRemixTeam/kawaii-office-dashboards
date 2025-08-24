import React from "react";
import { useNavigate } from "react-router-dom";

export type Hotspot = {
  id: string;
  label: string;
  href: string;
  top: number;
  left: number;
  width: number;
  height: number;
  aria?: string;
};

type Props = {
  src: string;
  alt: string;
  hotspots: Hotspot[];
  aspectRatio?: number;
};

export default function HotspotImage({ src, alt, hotspots, aspectRatio = 16/9 }: Props) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        className="relative w-full overflow-hidden rounded-3xl shadow-cute bg-gradient-card"
        style={{ aspectRatio: `${aspectRatio} / 1` }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        {hotspots.map(h => (
          <button
            key={h.id}
            aria-label={h.aria ?? h.label}
            title={h.label}
            onClick={() => navigate(h.href)}
            className="absolute rounded-2xl outline-none transition-all duration-300 ease-bounce hover:scale-105 focus:scale-105 group"
            style={{
              top: `${h.top}%`,
              left: `${h.left}%`,
              width: `${h.width}%`,
              height: `${h.height}%`,
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(h.href);
            }}
          >
            <span className="sr-only">{h.label}</span>
            <span className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-4 ring-primary/40 transition-all duration-300" />
            <span className="pointer-events-none absolute -inset-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <svg viewBox="0 0 24 24" className="w-8 h-8 absolute -top-4 -right-4 text-primary animate-pulse-soft">
                <path d="M12 2l1.8 5.4L19 9.2l-5 1.6-2 5-2-5-5-1.6 5.2-1.8z" fill="currentColor" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </button>
        ))}
      </div>
    </div>
  );
}