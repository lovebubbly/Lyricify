import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { LyricDisplayProps, LyricLine } from '@/types';
import { shouldShowSubtitle } from '@/lib/languageUtils';

export const LyricDisplay: React.FC<LyricDisplayProps> = ({
    mainLyrics,
    subLyrics,
    colorPalette,
    fontSize
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Find current active line
    const activeMainIndex = useMemo(() => {
        for (let i = 0; i < mainLyrics.length; i++) {
            if (frame >= mainLyrics[i].startFrame && frame < mainLyrics[i].endFrame) {
                return i;
            }
        }
        // Find next upcoming line
        for (let i = 0; i < mainLyrics.length; i++) {
            if (frame < mainLyrics[i].startFrame) {
                return i > 0 ? i - 1 : -1;
            }
        }
        return mainLyrics.length - 1;
    }, [frame, mainLyrics]);

    // Find matching sub lyric for a given main text
    const getActiveSub = (mainText: string) => {
        const sub = subLyrics.find(
            s => frame >= s.startFrame && frame < s.endFrame
        );

        // Skip subtitle if main text is already English
        if (!shouldShowSubtitle(mainText, sub?.text)) {
            return undefined;
        }

        return sub;
    };

    // Get visible lines (surrounding the active line)
    const visibleLines = useMemo(() => {
        const range = 3;
        const start = Math.max(0, activeMainIndex - range);
        const end = Math.min(mainLyrics.length, activeMainIndex + range + 1);
        return mainLyrics.slice(start, end).map((line, idx) => ({
            ...line,
            displayIndex: start + idx,
            relativeIndex: start + idx - activeMainIndex
        }));
    }, [activeMainIndex, mainLyrics]);

    // Calculate line properties
    const getLineStyles = (line: LyricLine & { displayIndex: number; relativeIndex: number }) => {
        const isActive = line.relativeIndex === 0;
        const isWithinRange = frame >= line.startFrame && frame < line.endFrame;

        // Smooth transition progress
        const transitionProgress = isWithinRange
            ? spring({
                frame: frame - line.startFrame,
                fps,
                config: { damping: 20, stiffness: 100 }
            })
            : isActive ? 1 : 0;

        // Calculate vertical position
        const baseOffset = line.relativeIndex * (fontSize * 1.8);
        const yOffset = interpolate(
            transitionProgress,
            [0, 1],
            [baseOffset + 20, baseOffset]
        );

        // Scale
        const scale = interpolate(
            transitionProgress,
            [0, 1],
            [0.9, 1.05]
        );

        // Opacity
        const opacity = isActive
            ? interpolate(transitionProgress, [0, 1], [0.5, 1])
            : interpolate(Math.abs(line.relativeIndex), [0, 1, 3], [1, 0.5, 0.2]);

        // Blur
        const blur = isActive ? 0 : Math.min(Math.abs(line.relativeIndex) * 1.5, 4);

        return {
            transform: `translateY(${yOffset}px) scale(${isActive ? scale : 0.9})`,
            opacity,
            filter: `blur(${blur}px)`,
            fontSize: isActive ? fontSize : fontSize * 0.85,
            fontWeight: isActive ? 700 : 500,
            color: '#ffffff',
            textShadow: '0 4px 30px rgba(0,0,0,0.6)',
            transition: 'none',
            willChange: 'transform, opacity, filter'
        };
    };

    return (
        <AbsoluteFill
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 60px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}
        >
            {visibleLines.map((line) => {
                const styles = getLineStyles(line);
                const isActive = line.relativeIndex === 0;

                return (
                    <div
                        key={line.id}
                        style={{
                            position: 'absolute',
                            textAlign: 'center',
                            maxWidth: '80%',
                            lineHeight: 1.4,
                            ...styles
                        }}
                    >
                        {/* Main lyric text */}
                        <p style={{ margin: 0 }}>
                            {line.text}
                        </p>

                        {/* Translation (only for active line, skip if main is English) */}
                        {(() => {
                            const activeSub = getActiveSub(line.text);
                            return isActive && activeSub && (
                                <p
                                    style={{
                                        margin: 0,
                                        marginTop: 12,
                                        fontSize: fontSize * 0.5,
                                        fontWeight: 400,
                                        color: colorPalette.vibrant,
                                        opacity: 0.85,
                                        textShadow: '0 2px 15px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {activeSub.text}
                                </p>
                            );
                        })()}
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};

export default LyricDisplay;
