/**
 * Mago in pixel-art mostrato accanto al saluto della Dashboard.
 *
 * Disegnato come SVG (griglia 16×20, un rect per pixel): nessun asset da caricare,
 * nitido a ogni densità di schermo. Fiamme, fluttuazione e aura sono CSS (.mage in globals.css).
 * Puramente decorativo: nascosto agli screen reader, non intercetta mai il puntatore.
 */

const DARK = "#1b1030";
const HOOD = "#3b2566";
const HOOD_HI = "#5b3fa0";
const TRIM = "#c4b5fd";
const BEARD = "#e9e6f5";
const SKIN = "#2a1c42";
const STAFF = "#6b4a2f";

type Px = [number, number, number, number, string]; // x, y, w, h, colore

const PIXELS: Px[] = [
  // cappello a punta
  [7, 0, 2, 1, HOOD_HI], [6, 1, 4, 1, HOOD], [5, 2, 6, 1, HOOD],
  [4, 3, 8, 1, HOOD], [4, 4, 8, 1, HOOD_HI], [3, 5, 10, 1, HOOD],
  [3, 6, 10, 1, TRIM],
  // volto in ombra sotto il cappuccio
  [5, 7, 6, 1, SKIN], [5, 8, 6, 1, SKIN],
  [6, 7, 1, 1, TRIM], [9, 7, 1, 1, TRIM], // occhi che brillano
  // barba
  [5, 9, 6, 1, BEARD], [6, 10, 4, 1, BEARD], [7, 11, 2, 1, BEARD],
  // spalle e veste
  [4, 10, 1, 2, HOOD], [11, 10, 1, 2, HOOD],
  [4, 12, 8, 1, HOOD_HI], [4, 13, 8, 1, HOOD],
  [3, 14, 10, 1, HOOD], [3, 15, 10, 1, HOOD_HI],
  [2, 16, 12, 1, HOOD], [2, 17, 12, 1, HOOD],
  [2, 18, 12, 1, DARK], [3, 19, 10, 1, DARK],
  // bordo luminoso della veste
  [6, 13, 4, 1, TRIM], [7, 16, 2, 1, TRIM],
  // bastone con orbe
  [13, 4, 1, 15, STAFF],
  [12, 2, 3, 1, TRIM], [13, 1, 1, 1, TRIM], [12, 3, 3, 1, "#a78bfa"],
  // mano
  [11, 12, 2, 1, SKIN],
];

export function RiccardoMage({ className = "" }: { className?: string }) {
  return (
    <span className={`mage ${className}`} aria-hidden="true">
      <svg viewBox="0 0 16 20" shapeRendering="crispEdges" className="size-full">
        {PIXELS.map(([x, y, w, h, fill], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
        ))}
      </svg>
    </span>
  );
}
