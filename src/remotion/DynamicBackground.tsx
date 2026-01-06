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

            {/* Color gradient overlay - Safe access */}
            {colorPalette && colorPalette.palette && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `
            radial-gradient(ellipse at 20% 20%, ${colorPalette.palette[0] || '#000000'}99, transparent 50%),
            radial-gradient(ellipse at 80% 30%, ${colorPalette.palette[1] || '#000000'}77, transparent 50%),
            radial-gradient(ellipse at 40% 80%, ${colorPalette.palette[2] || '#000000'}66, transparent 50%),
            radial-gradient(ellipse at 90% 90%, ${colorPalette.dominant || '#000000'}55, transparent 40%)
          `,
                        opacity: 0.6,
                        transform: `rotate(${rotation * 0.05}deg)`
                    }}
                />
            )}

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

            {/* Floating Particles Layer */}
            <AbsoluteFill>
                {[...Array(20)].map((_, i) => {
                    // Semi-random deterministic properties based on index
                    const size = 10 + (i * 7) % 40;
                    const xBase = (i * 13) % 100;
                    const yBase = (i * 17) % 100;

                    // Movement offsets
                    const xOffset = interpolate(
                        frame % (fps * (10 + i % 5)),
                        [0, (fps * (10 + i % 5)) / 2, fps * (10 + i % 5)],
                        [0, 30 + (i % 3) * 20, 0],
                        { easing: Easing.inOut(Easing.sin) }
                    );

                    const yOffset = interpolate(
                        frame % (fps * (12 + (i * 3) % 4)),
                        [0, (fps * (12 + (i * 3) % 4)) / 2, fps * (12 + (i * 3) % 4)],
                        [0, -40 - (i % 2) * 30, 0],
                        { easing: Easing.inOut(Easing.sin) }
                    );

                    const opacity = interpolate(
                        frame % (fps * (5 + i % 3)),
                        [0, (fps * (5 + i % 3)) / 2, fps * (5 + i % 3)],
                        [0.2, 0.6, 0.2]
                    );

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${xBase}%`,
                                top: `${yBase}%`,
                                width: size,
                                height: size,
                                borderRadius: '50%',
                                background: 'white',
                                filter: 'blur(10px)',
                                opacity: opacity * 0.4,
                                transform: `translate(${xOffset}px, ${yOffset}px)`,
                            }}
                        />
                    );
                })}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

export default DynamicBackground;
