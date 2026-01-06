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
        const visibleRange = 5; // Show 5 lines before and after for more context
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
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-background relative overflow-hidden">
            {/* Background Gradient Mesh - optional, could be added here */}

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
            <div className="relative w-full max-w-5xl aspect-video bg-card/40 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm">
                {hasContent && colorPalette ? (
                    <>
                        {/* Dynamic Background - heavier blur */}
                        <div
                            className="absolute inset-[-15%] bg-center bg-cover opacity-90 scale-125"
                            style={{
                                backgroundImage: `url(${coverArtUrl})`,
                                filter: `blur(${Math.max(100, settings.blurIntensity)}px) saturate(1.2)`,
                            }}
                        />

                        {/* Color Overlay with Pulse */}
                        <div
                            className="absolute inset-0 animate-pulse"
                            style={{
                                background: generateGradientBackground(colorPalette),
                                animationDuration: '4s'
                            }}
                        />

                        {/* Dark Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60" />

                        {/* Split Layout: Album Cover Left + Lyrics Right */}
                        <div className="absolute inset-0 flex items-center p-20 gap-20">
                            {/* Left Side: Album Cover */}
                            {/* Left Side: Album Cover & Metadata */}
                            <div className="flex-none flex flex-col items-center gap-6 z-10">
                                <div
                                    className="w-60 h-60 rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-album-breathing"
                                >
                                    <img
                                        src={coverArtUrl}
                                        alt="Album Cover"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Metadata Display */}
                                {(settings.title || settings.artist) && (
                                    <div className="flex flex-col items-center text-center gap-1 animate-fade-in">
                                        {settings.title && (
                                            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight max-w-[280px]">
                                                {settings.title}
                                            </h2>
                                        )}
                                        {settings.artist && (
                                            <p className="text-base text-white/60 font-medium">
                                                {settings.artist}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Lyrics with vertical scroll */}
                            <div className="flex-1 h-full relative overflow-hidden pl-3">
                                <div className="absolute inset-0 flex flex-col items-start justify-center">
                                    {getVisibleLyrics().map((line) => {
                                        const isActive = line.relativeIndex === 0;
                                        const distance = Math.abs(line.relativeIndex);

                                        // Subtitle Lookup (timestamp-based)
                                        const matchingSub = subLyrics.find(sub => {
                                            const overlapStart = Math.max(sub.startTime, line.startTime);
                                            const overlapEnd = Math.min(sub.endTime, line.endTime);
                                            return (overlapEnd - overlapStart) > 0.1;
                                        });

                                        const activeSub = matchingSub && shouldShowSubtitle(line.text, matchingSub.text) ? matchingSub : undefined;

                                        // FIXED uniform height for ALL lines (prevents overlap)
                                        // Height accommodates: Main text + potential subtitle + padding
                                        const lineHeight = settings.fontSize * 3;
                                        const translateY = line.relativeIndex * lineHeight;

                                        return (
                                            <div
                                                key={line.id}
                                                className={`lyric-line w-full text-left absolute left-0 ${isActive ? 'active z-10' : 'z-0'}`}
                                                style={{
                                                    top: '50%',
                                                    height: `${lineHeight}px`,
                                                    transform: `translateY(calc(-50% + ${translateY}px)) scale(${isActive ? 1 : Math.max(0.92, 1 - distance * 0.02)})`,
                                                    opacity: isActive ? 1 : Math.max(0.15, 0.5 - distance * 0.12),
                                                    filter: isActive ? 'blur(0px)' : `blur(${Math.min(distance * 1, 4)}px)`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    transition: 'transform 0.4s ease-out, opacity 0.4s ease-out, filter 0.4s ease-out'
                                                }}
                                            >
                                                {/* Main Lyric */}
                                                <p
                                                    className={`font-semibold leading-tight m-0 ${isActive ? 'text-white font-extrabold tracking-tight' : 'text-white/90'}`}
                                                    style={{
                                                        fontSize: isActive ? settings.fontSize * 1.1 : settings.fontSize * 0.75,
                                                        textShadow: isActive ? '0 4px 20px rgba(0,0,0,0.5)' : 'none',
                                                        letterSpacing: isActive ? '-0.02em' : '-0.01em'
                                                    }}
                                                >
                                                    {line.text}
                                                </p>

                                                {/* English Subtitle (only rendered if exists) */}
                                                {activeSub && (
                                                    <p
                                                        className="font-medium text-white/75 mt-2"
                                                        style={{
                                                            fontSize: settings.fontSize * 0.55,
                                                            textShadow: isActive ? '0 2px 10px rgba(0,0,0,0.4)' : 'none',
                                                            lineHeight: 1.3,
                                                            opacity: isActive ? 1 : 0.7
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
                        </div>

                        {/* Player Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4">
                            <button
                                className="w-11 h-11 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 active:scale-95 transition-transform shadow-lg"
                                onClick={togglePlayback}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                            </button>

                            <div
                                className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative group py-2"
                                onClick={handleTimelineClick}
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ left: `${progress}%` }}
                                />
                            </div>

                            <div className="min-w-[80px] text-right text-xs font-medium tabular-nums text-white/60">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Placeholder when no content */
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20">
                                <rect x="2" y="2" width="20" height="20" rx="4" />
                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">
                            Upload audio, cover art, and lyrics to preview
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}


