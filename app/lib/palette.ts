'use client';

import { useEffect } from 'react';

export interface PaletteColors {
  gl: [number, number, number];
  darkGl: [number, number, number];
  complementaryGl: [number, number, number];
  css: string;
  cssRgba: string;
  darkCss: string;
  darkCssRgba: string;
  repelCss: string;
  repelRgba: string;
}

interface ColorStop {
  hour: number;
  h: number;
  s: number;
  l: number;
}

const STOPS: ColorStop[] = [
  { hour: 4, h: 250, s: 45, l: 55 },
  { hour: 7, h: 35, s: 75, l: 65 },
  { hour: 12, h: 207, s: 62, l: 85 },
  { hour: 17, h: 10, s: 70, l: 72 },
  { hour: 21, h: 260, s: 40, l: 65 },
];

function lerpHue(a: number, b: number, t: number): number {
  const diff = ((b - a + 540) % 360) - 180;
  return (((a + diff * t) % 360) + 360) % 360;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(h + 1 / 3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1 / 3);
  }
  return [r, g, b];
}

const toHex = (v: number) =>
  Math.round(v * 255)
    .toString(16)
    .padStart(2, '0');

function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToCssRgba(r: number, g: number, b: number): string {
  return `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
}

export function getAccentColor(date?: Date): PaletteColors {
  const d = date ?? new Date();
  const fractionalHour = d.getHours() + d.getMinutes() / 60;

  let aIdx = STOPS.length - 1;
  let bIdx = 0;
  for (let i = 0; i < STOPS.length; i++) {
    if (fractionalHour < STOPS[i].hour) {
      bIdx = i;
      aIdx = (i - 1 + STOPS.length) % STOPS.length;
      break;
    }
    if (i === STOPS.length - 1) {
      aIdx = i;
      bIdx = 0;
    }
  }

  const a = STOPS[aIdx];
  const b = STOPS[bIdx];

  let gap = b.hour - a.hour;
  if (gap <= 0) gap += 24;
  let pos = fractionalHour - a.hour;
  if (pos < 0) pos += 24;
  const t = pos / gap;

  const h = lerpHue(a.h, b.h, t);
  const s = lerp(a.s, b.s, t);
  const l = lerp(a.l, b.l, t);

  const [r, g, bVal] = hslToRgb(h, s, l);

  const compH = (h + 40) % 360;
  const compS = Math.max(s * 0.4, 20);
  const compL = Math.min(l * 0.35, 30);
  const [cr, cg, cb] = hslToRgb(compH, compS, compL);

  const darkAccentS = Math.max(s, 50);
  const darkAccentL = Math.min(l, 45);
  const [dr, dg, db] = hslToRgb(h, darkAccentS, darkAccentL);

  const repelH = (h + 30) % 360;
  const repelS = Math.max(s, 60);
  const repelL = 68;
  const [rr, rg, rb] = hslToRgb(repelH, repelS, repelL);

  return {
    gl: [r, g, bVal],
    darkGl: [dr, dg, db],
    complementaryGl: [cr, cg, cb],
    css: rgbToHex(r, g, bVal),
    cssRgba: rgbToCssRgba(r, g, bVal),
    darkCss: rgbToHex(dr, dg, db),
    darkCssRgba: rgbToCssRgba(dr, dg, db),
    repelCss: rgbToHex(rr, rg, rb),
    repelRgba: rgbToCssRgba(rr, rg, rb),
  };
}

export const currentPalette: PaletteColors = getAccentColor();

function applyPalette() {
  const p = getAccentColor();
  Object.assign(currentPalette, p);
  const style = document.documentElement.style;
  style.setProperty('--accent', p.css);
  style.setProperty('--accent-rgb', p.cssRgba);
  style.setProperty('--accent-dark', p.darkCss);
  style.setProperty('--accent-dark-rgb', p.darkCssRgba);
  style.setProperty('--repel-rgb', p.repelRgba);
}

export function usePalette(): void {
  useEffect(() => {
    applyPalette();
    const id = setInterval(applyPalette, 300_000);
    return () => clearInterval(id);
  }, []);
}
