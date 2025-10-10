/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB values to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Generate weight gradient color based on weight value
 */
export const getWeightGradientColor = (weight: number, baseColor: string, maxValue: number = 21): string => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return baseColor;
  
  // Calculate intensity based on weight (0 to 1)
  const intensity = Math.min(weight / maxValue, 1);
  
  // Create a gradient that goes from light to dark (more saturated)
  // Lower weights get lighter colors, higher weights get darker/more saturated colors
  const darkenFactor = intensity; // Range from 0 to 1
  const newR = Math.floor(rgb.r * (1 - darkenFactor * 0.4)); // Darken by up to 40%
  const newG = Math.floor(rgb.g * (1 - darkenFactor * 0.4));
  const newB = Math.floor(rgb.b * (1 - darkenFactor * 0.4));
  
  return rgbToHex(newR, newG, newB);
};
