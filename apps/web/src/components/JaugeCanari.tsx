"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatFcfa } from "@kangan/shared";

interface JaugeCanariProps {
  balance: number;
  targetAmount: number;
  percent: number;
  size?: "sm" | "lg";
}

/**
 * Jauge canari — signe distinctif de Kangan Finance (section 11) : la
 * progression d'une caisse s'affiche comme un canari stylisé qui se remplit,
 * avec une animation de goutte à chaque versement et des confettis de
 * pièces aux jalons 25/50/75/100 %.
 */
export function JaugeCanari({ balance, targetAmount, percent, size = "lg" }: JaugeCanariProps) {
  const [celebrate, setCelebrate] = useState(false);
  const dims = size === "lg" ? "h-40 w-32" : "h-24 w-20";

  useEffect(() => {
    if ([25, 50, 75, 100].includes(percent)) {
      setCelebrate(true);
      const timeout = setTimeout(() => setCelebrate(false), 1400);
      return () => clearTimeout(timeout);
    }
  }, [percent]);

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className={`relative ${dims}`}>
        <svg viewBox="0 0 100 130" className="h-full w-full overflow-visible">
          <defs>
            <clipPath id="jarClip">
              <path d="M28 46c0-4 4-8 4-8h36s4 4 4 8v52a22 22 0 0 1-44 0V46z" />
            </clipPath>
          </defs>

          {/* Corps de la jarre */}
          <path
            d="M28 46c0-4 4-8 4-8h36s4 4 4 8v52a22 22 0 0 1-44 0V46z"
            fill="none"
            stroke="#0F3D2E"
            strokeWidth="3"
          />
          {/* Goulot */}
          <rect x="38" y="10" width="24" height="14" rx="3" fill="none" stroke="#0F3D2E" strokeWidth="3" />
          <path d="M32 24h36l4 14H28z" fill="none" stroke="#0F3D2E" strokeWidth="3" />

          {/* Remplissage animé */}
          <g clipPath="url(#jarClip)">
            <motion.rect
              x="24"
              width="52"
              height="90"
              fill="#D98E2B"
              initial={{ y: 130 }}
              animate={{ y: 108 - (percent / 100) * 90 }}
              transition={{ type: "spring", stiffness: 60, damping: 14 }}
            />
            <motion.rect
              x="24"
              width="52"
              height="6"
              fill="#F6EFE3"
              opacity={0.5}
              initial={{ y: 130 }}
              animate={{ y: 108 - (percent / 100) * 90 }}
              transition={{ type: "spring", stiffness: 60, damping: 14 }}
            />
          </g>

        </svg>

        {celebrate && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full bg-ocre"
                style={{ left: `${10 + i * 10}%`, top: "10%" }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{ y: 120, opacity: 0, rotate: 360 }}
                transition={{ duration: 1.2, delay: i * 0.05, ease: "easeIn" }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="font-display text-2xl font-bold text-vert-kangan">{percent}%</p>
        <p className="text-sm text-encre/70">
          {formatFcfa(balance)} <span className="text-encre/40">/ {formatFcfa(targetAmount)}</span>
        </p>
      </div>
    </div>
  );
}
