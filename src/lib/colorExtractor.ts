import ColorThief from 'colorthief';
import { ColorPalette } from '@/types';

/**
 * Extract dominant colors from an image
 * Uses ColorThief library for color extraction
 */
export async function extractColors(imageSrc: string): Promise<ColorPalette> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                const colorThief = new ColorThief();

                // Get dominant color
                const dominant = colorThief.getColor(img);

                // Get palette (8 colors)
                const paletteRgb = colorThief.getPalette(img, 8);

                // Convert to hex
                const dominantHex = rgbToHex(dominant[0], dominant[1], dominant[2]);
                const palette = paletteRgb.map(
                    (rgb: number[]) => rgbToHex(rgb[0], rgb[1], rgb[2])
                );

                // Find most vibrant color (highest saturation)
                const vibrant = findMostVibrant(paletteRgb);

                // Determine if dominant is dark
                const isDark = isColorDark(dominant[0], dominant[1], dominant[2]);

                resolve({
                    dominant: dominantHex,
                    palette,
                    vibrant,
                    isDark
                });
            } catch (error) {
                // Fallback colors if extraction fails
                resolve({
                    dominant: '#1a1a1a',
                    palette: ['#fa2d48', '#fc3c5c', '#ff6b7a', '#4a4a4a'],
                    vibrant: '#fa2d48',
                    isDark: true
                });
            }
        };

        img.onerror = () => {
            // Fallback colors
            resolve({
                dominant: '#1a1a1a',
                palette: ['#fa2d48', '#fc3c5c', '#ff6b7a', '#4a4a4a'],
                vibrant: '#fa2d48',
                isDark: true
            });
        };

        img.src = imageSrc;
    });
}

/**
 * Convert RGB to Hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Find the most vibrant color from a palette (highest saturation)
 */
function findMostVibrant(palette: number[][]): string {
    let maxSaturation = 0;
    let vibrantColor = palette[0];

    for (const rgb of palette) {
        const saturation = getColorSaturation(rgb[0], rgb[1], rgb[2]);
        if (saturation > maxSaturation) {
            maxSaturation = saturation;
            vibrantColor = rgb;
        }
    }

    return rgbToHex(vibrantColor[0], vibrantColor[1], vibrantColor[2]);
}

/**
 * Calculate color saturation (0-1)
 */
function getColorSaturation(r: number, g: number, b: number): number {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (max === 0) return 0;

    return (max - min) / max;
}

/**
 * Determine if a color is dark (for text contrast)
 */
function isColorDark(r: number, g: number, b: number): boolean {
    // Calculate relative luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 128;
}

/**
 * Generate a gradient background CSS value from palette
 */
export function generateGradientBackground(palette: ColorPalette): string {
    const colors = [palette.dominant, ...palette.palette.slice(0, 3)];

    return `
    radial-gradient(ellipse at 20% 20%, ${colors[0]}88, transparent 50%),
    radial-gradient(ellipse at 80% 30%, ${colors[1]}66, transparent 50%),
    radial-gradient(ellipse at 40% 80%, ${colors[2]}55, transparent 50%),
    radial-gradient(ellipse at 90% 90%, ${colors[3]}44, transparent 40%)
  `;
}

/**
 * Adjust color brightness
 */
export function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}
