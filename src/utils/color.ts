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
  
  // Lighten the color by increasing RGB values (reverse gradient)
  const lightenFactor = 0.3 + (intensity * 0.7); // Range from 0.3 to 1.0
  const newR = Math.floor(rgb.r + (255 - rgb.r) * lightenFactor);
  const newG = Math.floor(rgb.g + (255 - rgb.g) * lightenFactor);
  const newB = Math.floor(rgb.b + (255 - rgb.b) * lightenFactor);
  
  return rgbToHex(newR, newG, newB);
};
