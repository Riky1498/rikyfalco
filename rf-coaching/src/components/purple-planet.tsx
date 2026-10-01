"use client";

import { useEffect, useRef } from "react";

/**
 * Pianeta viola animato — globo di punti che ruota, usato nell'hero della Dashboard.
 *
 *   <PurplePlanet className="size-[420px]" />
 *
 * I punti delle terre emerse sono generati a runtime su una sfera di Fibonacci e
 * filtrati con un'approssimazione dei continenti (vedi LAND): niente dataset esterni,
 * nessuna rete, nessun asset da scaricare.
 */

// Continenti approssimati come ellissi (lat, lon, semiasse lat, semiasse lon).
const LAND: [number, number, number, number][] = [
  [12, 14, 24, 19], [-18, 25, 16, 12],            // Africa
  [52, 18, 12, 26],                                // Europa
  [48, 92, 24, 52], [21, 78, 12, 10], [5, 112, 12, 14], // Asia, India, sud-est
  [52, -100, 20, 34], [28, -102, 12, 18],          // Nord America
  [-10, -60, 17, 14], [-34, -66, 12, 8],           // Sud America
  [-25, 134, 11, 19],                              // Australia
  [72, -41, 8, 14],                                // Groenlandia
];

function onLand(lat: number, lon: number) {
  if (lat < -72) return true; // Antartide
  return LAND.some(([la, lo, ra, ro]) => {
    const dLon = Math.abs(((lon - lo + 540) % 360) - 180) - 180;
    return ((lat - la) / ra) ** 2 + (dLon / ro) ** 2 <= 1;
  });
}

type Dot = { x: number; y: number; z: number; city: number };

function buildDots(n: number): Dot[] {
  const out: Dot[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = ((theta % (2 * Math.PI)) * (180 / Math.PI) + 540) % 360 - 180;
    if (!onLand(lat, lon)) continue;
    // ~6% dei punti sono "città" che pulsano
    out.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, city: Math.random() < 0.06 ? Math.random() * 6.283 : -1 });
  }
  return out;
}

export function PurplePlanet({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dots = buildDots(6000);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = cv.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const TILT = -0.41; // ~23.5°
    const draw = (t: number) => {
      const spin = reduce ? 0.6 : t / 9000;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) / 2 - 2;
      ctx.clearRect(0, 0, w, h);

      // alone esterno
      const halo = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R * 1.25);
      halo.addColorStop(0, "rgba(139,92,246,.30)");
      halo.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, 6.2832);
      ctx.fill();

      // corpo del pianeta
      const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, 0, cx, cy, R);
      body.addColorStop(0, "#1a1030");
      body.addColorStop(1, "#0a0617");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 6.2832);
      ctx.fill();

      const cos = Math.cos(spin);
      const sin = Math.sin(spin);
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      for (const d of dots) {
        // rotazione attorno all'asse Y, poi inclinazione
        const x1 = d.x * cos - d.z * sin;
        const z1 = d.x * sin + d.z * cos;
        if (z1 < -0.05) continue; // faccia nascosta
        const y2 = d.y * ct - z1 * st;
        const z2 = d.y * st + z1 * ct;
        const depth = 0.45 + 0.55 * z2;
        const px = cx + x1 * R;
        const py = cy - y2 * R;
        const pulse = d.city >= 0 ? 0.55 + 0.45 * Math.sin(t / 620 + d.city) : 1;
        if (d.city >= 0) {
          ctx.fillStyle = `rgba(221,214,254,${(0.55 * depth * pulse).toFixed(3)})`;
          ctx.fillRect(px - 1.4, py - 1.4, 2.8, 2.8);
        } else {
          ctx.fillStyle = `rgba(167,139,250,${(0.5 * depth).toFixed(3)})`;
          ctx.fillRect(px - 0.9, py - 0.9, 1.8, 1.8);
        }
      }

      // anello
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.23);
      ctx.scale(1, 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.18, 0, 6.2832);
      ctx.strokeStyle = "rgba(196,181,253,.22)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
