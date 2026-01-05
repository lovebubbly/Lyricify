import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { DynamicBackgroundProps } from '@/types';

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
    coverArtUrl,
    colorPalette,
    blurIntensity
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Slow pulsing animation
    const pulseProgress = interpolate(
        frame % (fps * 8), // 8 second cycle
        [0, fps * 4, fps * 8],
        [1, 1.1, 1],
        { easing: Easing.inOut(Easing.sin) }
    );

    // Slow rotation for subtle movement
    const rotation = interpolate(
        frame,
        [0, fps * 60], // 60 second full rotation
        [0, 360],
        { extrapolateRight: 'wrap' }
    );

    // Opacity breathing
    const opacityPulse = interpolate(
        frame % (fps * 6),
        [0, fps * 3, fps * 6],
        [0.7, 0.85, 0.7],
        { easing: Easing.inOut(Easing.sin) }
    );

    return (
        <AbsoluteFill>
            {/* Base blurred cover art */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-20%',
                    backgroundImage: `url(${coverArtUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: `blur(${blurIntensity}px) saturate(1.2)`,
                    transform: `scale(${pulseProgress}) rotate(${rotation * 0.1}deg)`,
                    opacity: opacityPulse
                }}
            />

            {/* Color gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
            radial-gradient(ellipse at 20% 20%, ${colorPalette.palette[0]}99, transparent 50%),
            radial-gradient(ellipse at 80% 30%, ${colorPalette.palette[1]}77, transparent 50%),
            radial-gradient(ellipse at 40% 80%, ${colorPalette.palette[2]}66, transparent 50%),
            radial-gradient(ellipse at 90% 90%, ${colorPalette.dominant}55, transparent 40%)
          `,
                    opacity: 0.6,
                    transform: `rotate(${rotation * 0.05}deg)`
                }}
            />

            {/* Dark overlay for text readability */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.35)'
                }}
            />

            {/* Vignette effect */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)'
                }}
            />
        </AbsoluteFill>
    );
};

export default DynamicBackground;
