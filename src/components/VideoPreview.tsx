'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { LyricLine, ColorPalette, VideoSettings } from '@/types';
import { formatTime, getActiveLine } from '@/lib/srtParser';
import { generateGradientBackground } from '@/lib/colorExtractor';
import { shouldShowSubtitle } from '@/lib/languageUtils';

interface VideoPreviewProps {
    audioUrl: string | null;
    coverArtUrl: string | null;
    mainLyrics: LyricLine[];
    subLyrics: LyricLine[];
    colorPalette: ColorPalette | null;
    settings: VideoSettings;
}

export function VideoPreview({
    audioUrl,
    coverArtUrl,
    mainLyrics,
    subLyrics,
    colorPalette,
    settings
}: VideoPreviewProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeMainIndex, setActiveMainIndex] = useState(-1);

    // Update active lyric indices
    useEffect(() => {
        if (mainLyrics.length > 0) {
            setActiveMainIndex(getActiveLine(mainLyrics, currentTime));
        }
    }, [currentTime, mainLyrics]);

    // Audio time update handler
    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }, []);

    // Audio loaded handler
    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    }, []);

    // Play/pause toggle
    const togglePlayback = useCallback(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    // Timeline click handler
    const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current && duration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = percent * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, [duration]);

    // Audio ended handler
    const handleAudioEnded = useCallback(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const hasContent = audioUrl && coverArtUrl && mainLyrics.length > 0;

    // Get surrounding lyrics for display
    const getVisibleLyrics = () => {
        const visibleRange = 3; // Show 3 lines before and after
        const start = Math.max(0, activeMainIndex - visibleRange);
        const end = Math.min(mainLyrics.length, activeMainIndex + visibleRange + 1);
        return mainLyrics.slice(start, end).map((line, idx) => ({
            ...line,
            relativeIndex: start + idx - activeMainIndex
        }));
    };

    // Get active sub lyric (only if main lyric is not already English)
    const getActiveSub = (mainText: string) => {
        const sub = subLyrics.find(
            s => s.startTime <= currentTime && s.endTime > currentTime
        );

        // Skip subtitle if main text is already English
        if (!shouldShowSubtitle(mainText, sub?.text)) {
            return undefined;
        }

        return sub;
    };

    return (
        <div className="main-content">
            {/* Hidden audio element */}
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleAudioEnded}
                />
            )}

            {/* Video Preview Container */}
            <div className="video-preview-container">
                {hasContent && colorPalette ? (
                    <>
                        {/* Dynamic Background with Mesh Movement */}
                        <div
                            className="dynamic-bg-animated"
                            style={{
                                position: 'absolute',
                                inset: '-10%',
                                backgroundImage: `url(${coverArtUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: `blur(${settings.blurIntensity}px) saturate(1.3)`,
                                opacity: 0.85
                            }}
                        />

                        {/* Color Overlay with Pulse */}
                        <div
                            className="color-overlay-animated"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: generateGradientBackground(colorPalette)
                            }}
                        />

                        {/* Dark Overlay for Text Readability */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
                            }}
                        />

                        {/* Split Layout: Album Cover Left + Lyrics Right */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '60px',
                                gap: '60px'
                            }}
                        >
                            {/* Left Side: Album Cover */}
                            <div
                                style={{
                                    flex: '0 0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '20px'
                                }}
                            >
                                <div
                                    className="album-cover-animated"
                                    style={{
                                        width: '280px',
                                        height: '280px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <img
                                        src={coverArtUrl}
                                        alt="Album Cover"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Right Side: Lyrics */}
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    maxHeight: '100%'
                                }}
                            >
                                {getVisibleLyrics().map((line) => {
                                    const isActive = line.relativeIndex === 0;
                                    const activeSub = getActiveSub(line.text);
                                    const distance = Math.abs(line.relativeIndex);

                                    return (
                                        <div
                                            key={line.id}
                                            className={`lyric-line ${isActive ? 'active' : ''}`}
                                            style={{
                                                textAlign: 'left',
                                                marginBottom: isActive ? '14px' : '10px',
                                                opacity: isActive ? 1 : Math.max(0.15, 0.5 - distance * 0.12),
                                                transform: isActive
                                                    ? 'scale(1) translateX(0)'
                                                    : `scale(${Math.max(0.88, 1 - distance * 0.04)}) translateX(${-6 * distance}px)`,
                                                filter: isActive ? 'blur(0px)' : `blur(${Math.min(distance * 1.2, 3.5)}px)`,
                                            }}
                                        >
                                            {/* Main Lyric Line */}
                                            <p
                                                className={isActive ? 'lyric-text' : ''}
                                                style={{
                                                    fontSize: isActive ? settings.fontSize : settings.fontSize * 0.72,
                                                    fontWeight: isActive ? 700 : 500,
                                                    color: '#ffffff',
                                                    textShadow: isActive
                                                        ? '0 3px 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.15)'
                                                        : '0 2px 15px rgba(0,0,0,0.4)',
                                                    lineHeight: 1.25,
                                                    margin: 0,
                                                    letterSpacing: isActive ? '-0.02em' : '0'
                                                }}
                                            >
                                                {line.text}
                                            </p>

                                            {/* Translation (only for active line) */}
                                            {isActive && activeSub && (
                                                <p
                                                    className="lyric-subtitle"
                                                    style={{
                                                        fontSize: settings.fontSize * 0.48,
                                                        fontWeight: 500,
                                                        color: colorPalette.vibrant,
                                                        marginTop: '8px',
                                                        textShadow: `0 2px 20px ${colorPalette.vibrant}40`,
                                                        letterSpacing: '0.01em'
                                                    }}
                                                >
                                                    {activeSub.text}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Player Controls */}
                        <div className="player-controls">
                            <button
                                className="play-button"
                                onClick={togglePlayback}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
                            </button>

                            <div className="timeline" onClick={handleTimelineClick}>
                                <div
                                    className="timeline-progress"
                                    style={{ width: `${progress}%` }}
                                />
                                <div
                                    className="timeline-handle"
                                    style={{ left: `${progress}%` }}
                                />
                            </div>

                            <div className="time-display">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Placeholder when no content */
                    <div className="video-preview-placeholder">
                        <div className="video-preview-placeholder-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="20" height="20" rx="2" />
                                <polygon points="10 8 16 12 10 16 10 8" />
                            </svg>
                        </div>
                        <p className="video-preview-placeholder-text">
                            Upload audio, cover art, and lyrics to preview
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VideoPreview;
