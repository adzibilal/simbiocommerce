/**
 * Converts a hex color string to "R G B" format for CSS custom properties.
 * e.g. "#3C50E0" -> "60 80 224"
 */
export function hexToRgbString(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "60 80 224";
  return `${r} ${g} ${b}`;
}

/**
 * Darkens a hex color by mixing with black (ratio 0–1, where 1 = full black).
 */
function darken(hex: string, ratio: number): string {
  const clean = hex.replace("#", "");
  const r = Math.round(parseInt(clean.substring(0, 2), 16) * (1 - ratio));
  const g = Math.round(parseInt(clean.substring(2, 4), 16) * (1 - ratio));
  const b = Math.round(parseInt(clean.substring(4, 6), 16) * (1 - ratio));
  return `${r} ${g} ${b}`;
}

/**
 * Lightens a hex color by mixing with white (ratio 0–1, where 1 = full white).
 */
function lighten(hex: string, ratio: number): string {
  const clean = hex.replace("#", "");
  const r = Math.round(parseInt(clean.substring(0, 2), 16) + (255 - parseInt(clean.substring(0, 2), 16)) * ratio);
  const g = Math.round(parseInt(clean.substring(2, 4), 16) + (255 - parseInt(clean.substring(2, 4), 16)) * ratio);
  const b = Math.round(parseInt(clean.substring(4, 6), 16) + (255 - parseInt(clean.substring(4, 6), 16)) * ratio);
  return `${r} ${g} ${b}`;
}

/**
 * Generates a <style> tag string that injects primary color CSS variables.
 */
export function buildPrimaryColorStyle(primaryColor: string): string {
  const rgb = hexToRgbString(primaryColor);
  const darkRgb = darken(primaryColor, 0.35);
  const lightRgb = lighten(primaryColor, 0.15);
  return `:root{--primary-rgb:${rgb};--primary-dark-rgb:${darkRgb};--primary-light-rgb:${lightRgb};}`;
}
