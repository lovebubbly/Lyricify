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
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Sparkles size={22} color="white" />
                    </div>
                    <span className="sidebar-logo-text">Lyricify</span>
                    <span className="sidebar-logo-badge">BETA</span>
                </div>
            </div>

            {/* Content */}
            <div className="sidebar-content">
                {/* Media Section */}
                <div className="sidebar-section">
                    <p className="section-title">Media Files</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <FileUpload
                            label="Audio Track"
                            accept=".mp3,.wav,audio/*"
                            icon={<Music size={24} />}
                            file={files.audio}
                            onFileSelect={(file) => onFileChange('audio', file)}
                        />

                        <FileUpload
                            label="Cover Art"
                            accept=".png,.jpg,.jpeg,image/*"
                            icon={<Image size={24} />}
                            file={files.coverArt}
                            onFileSelect={(file) => onFileChange('coverArt', file)}
                            previewUrl={fileUrls.coverArt}
                        />
                    </div>
                </div>

                <div className="divider" />

                {/* Lyrics Section */}
                <div className="sidebar-section">
                    <p className="section-title">Lyrics (SRT Format)</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <FileUpload
                            label="Main Lyrics"
                            accept=".srt"
                            icon={<FileText size={24} />}
                            file={files.mainLyrics}
                            onFileSelect={(file) => onFileChange('mainLyrics', file)}
                        />

                        <FileUpload
                            label="Translation (Optional)"
                            accept=".srt"
                            icon={<Languages size={24} />}
                            file={files.subLyrics}
                            onFileSelect={(file) => onFileChange('subLyrics', file)}
                        />
                    </div>
                </div>

                <div className="divider" />

                {/* Settings Section */}
                <div className="sidebar-section" style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>
                    <p className="section-title">Visual Settings</p>

                    <Slider
                        label="Font Size"
                        value={settings.fontSize}
                        min={20}
                        max={56}
                        step={2}
                        unit="px"
                        onChange={(value) => onSettingsChange('fontSize', value)}
                    />

                    <Slider
                        label="Blur Intensity"
                        value={settings.blurIntensity}
                        min={20}
                        max={150}
                        step={5}
                        unit="px"
                        onChange={(value) => onSettingsChange('blurIntensity', value)}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button
                    className={`glass-button primary render-button ${isRendering ? 'animate-pulse' : ''}`}
                    onClick={onRender}
                    disabled={!canRender || isRendering}
                    style={{ opacity: canRender && !isRendering ? 1 : 0.5 }}
                >
                    <Download size={18} />
                    {isRendering ? 'Rendering...' : 'Export Video'}
                </button>

                <p className="keyboard-hint">
                    <kbd>⌘</kbd> + <kbd>Enter</kbd> to export
                </p>
            </div>
        </aside>
    );
}

export default Sidebar;
