'use client';

import React from 'react';
import { Music, Image, FileText, Languages, Download, Sparkles } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { Slider } from './Slider';
import { UploadedFiles, VideoSettings, FileUrls } from '@/types';

interface SidebarProps {
    files: UploadedFiles;
    fileUrls: FileUrls;
    settings: VideoSettings;
    onFileChange: (key: keyof UploadedFiles, file: File | null) => void;
    onSettingsChange: (key: keyof VideoSettings, value: number) => void;
    onRender: () => void;
    isRendering: boolean;
    canRender: boolean;
}

export function Sidebar({
    files,
    fileUrls,
    settings,
    onFileChange,
    onSettingsChange,
    onRender,
    isRendering,
    canRender
}: SidebarProps) {
    return (
        <aside className="w-[340px] h-screen flex flex-col bg-background/40 backdrop-blur-2xl border-r border-white/10 shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-rose-600 rounded-xl shadow-lg shadow-primary/20">
                        <Sparkles size={22} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Lyricify</span>
                    <span className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 font-medium border border-white/10">BETA</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col gap-8">
                {/* Media Section */}
                <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Media Files</p>

                    <div className="flex flex-col gap-3">
                        <FileUpload
                            label="Audio Track"
                            accept=".mp3,.wav,audio/*"
                            icon={<Music size={20} />}
                            file={files.audio}
                            onFileSelect={(file) => onFileChange('audio', file)}
                        />

                        <FileUpload
                            label="Cover Art"
                            accept=".png,.jpg,.jpeg,image/*"
                            icon={<Image size={20} />}
                            file={files.coverArt}
                            onFileSelect={(file) => onFileChange('coverArt', file)}
                            previewUrl={fileUrls.coverArt}
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Lyrics Section */}
                <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Lyrics (SRT Format)</p>

                    <div className="flex flex-col gap-3">
                        <FileUpload
                            label="Main Lyrics"
                            accept=".srt"
                            icon={<FileText size={20} />}
                            file={files.mainLyrics}
                            onFileSelect={(file) => onFileChange('mainLyrics', file)}
                        />

                        <FileUpload
                            label="Translation (Optional)"
                            accept=".srt"
                            icon={<Languages size={20} />}
                            file={files.subLyrics}
                            onFileSelect={(file) => onFileChange('subLyrics', file)}
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Settings Section */}
                <div className="flex flex-col gap-6">
                    {/* Song Info Inputs */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            Song Info
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] text-muted-foreground/70 ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="Song Title"
                                    value={settings.title || ''}
                                    onChange={(e) => onSettingsChange('title', e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] text-muted-foreground/70 ml-1">Artist</label>
                                <input
                                    type="text"
                                    placeholder="Artist Name"
                                    value={settings.artist || ''}
                                    onChange={(e) => onSettingsChange('artist', e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Visual Settings Sliders */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            Visuals
                        </p>
                        <Slider
                            label="Font Size"
                            value={settings.fontSize}
                            min={20}
                            max={56}
                            step={1}
                            unit="px"
                            onChange={(val) => onSettingsChange('fontSize', val)}
                        />
                        <Slider
                            label="Blur Intensity"
                            value={settings.blurIntensity}
                            min={20}
                            max={150}
                            step={5}
                            unit="px"
                            onChange={(val) => onSettingsChange('blurIntensity', val)}
                        />

                        {/* FPS Selector */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                                Frame Rate
                            </label>
                            <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                                <button
                                    onClick={() => onSettingsChange('fps', 30)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${settings.fps === 30
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }`}
                                >
                                    30 FPS
                                </button>
                                <button
                                    onClick={() => onSettingsChange('fps', 60)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${settings.fps === 60
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }`}
                                >
                                    60 FPS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
                <button
                    className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300
                    ${canRender && !isRendering
                            ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-white/5 text-muted-foreground cursor-not-allowed'}
                    ${isRendering ? 'animate-pulse cursor-wait' : ''}
                    `}
                    onClick={onRender}
                    disabled={!canRender || isRendering}
                >
                    <Download size={18} />
                    {isRendering ? 'Rendering...' : 'Export Video'}
                </button>

                <p className="mt-4 text-center text-[10px] text-muted-foreground font-medium">
                    <kbd className="inline-block px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-sans mr-1">⌘</kbd>
                    +
                    <kbd className="inline-block px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-sans ml-1">Enter</kbd>
                    to export
                </p>
            </div>
        </aside>
    );
}

export default Sidebar;
