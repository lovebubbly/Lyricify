'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar, VideoPreview, LoadingOverlay } from '@/components';
import {
  UploadedFiles,
  FileUrls,
  VideoSettings,
  LyricLine,
  ColorPalette,
  RenderProgress
} from '@/types';
import { readAndParseSRT } from '@/lib/srtParser';
import { extractColors } from '@/lib/colorExtractor';
import { createFileUrl, revokeFileUrl } from '@/lib/audioUtils';

const defaultSettings: VideoSettings = {
  fontSize: 36,
  blurIntensity: 80,
  fps: 30,
  width: 1920,
  height: 1080
};

export default function Home() {
  // File states
  const [files, setFiles] = useState<UploadedFiles>({
    audio: null,
    coverArt: null,
    mainLyrics: null,
    subLyrics: null
  });

  // File URL states (for audio/image preview)
  const [fileUrls, setFileUrls] = useState<FileUrls>({
    audio: null,
    coverArt: null
  });

  // Parsed lyrics
  const [mainLyrics, setMainLyrics] = useState<LyricLine[]>([]);
  const [subLyrics, setSubLyrics] = useState<LyricLine[]>([]);

  // Color palette from cover art
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);

  // Video settings
  const [settings, setSettings] = useState<VideoSettings>(defaultSettings);

  // Render progress
  const [renderProgress, setRenderProgress] = useState<RenderProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  // Handle file changes
  const handleFileChange = useCallback(async (
    key: keyof UploadedFiles,
    file: File | null
  ) => {
    setFiles(prev => ({ ...prev, [key]: file }));

    // Handle audio file
    if (key === 'audio') {
      if (fileUrls.audio) {
        revokeFileUrl(fileUrls.audio);
      }
      if (file) {
        const url = createFileUrl(file);
        setFileUrls(prev => ({ ...prev, audio: url }));
      } else {
        setFileUrls(prev => ({ ...prev, audio: null }));
      }
    }

    // Handle cover art file
    if (key === 'coverArt') {
      if (fileUrls.coverArt) {
        revokeFileUrl(fileUrls.coverArt);
      }
      if (file) {
        const url = createFileUrl(file);
        setFileUrls(prev => ({ ...prev, coverArt: url }));

        // Extract colors from cover art
        try {
          const colors = await extractColors(url);
          setColorPalette(colors);
        } catch (error) {
          console.error('Failed to extract colors:', error);
        }
      } else {
        setFileUrls(prev => ({ ...prev, coverArt: null }));
        setColorPalette(null);
      }
    }

    // Handle main lyrics SRT
    if (key === 'mainLyrics' && file) {
      try {
        const parsed = await readAndParseSRT(file, settings.fps);
        setMainLyrics(parsed.lines);
      } catch (error) {
        console.error('Failed to parse main lyrics:', error);
        setMainLyrics([]);
      }
    } else if (key === 'mainLyrics' && !file) {
      setMainLyrics([]);
    }

    // Handle sub lyrics SRT
    if (key === 'subLyrics' && file) {
      try {
        const parsed = await readAndParseSRT(file, settings.fps);
        setSubLyrics(parsed.lines);
      } catch (error) {
        console.error('Failed to parse sub lyrics:', error);
        setSubLyrics([]);
      }
    } else if (key === 'subLyrics' && !file) {
      setSubLyrics([]);
    }
  }, [fileUrls, settings.fps]);

  // Handle settings changes
  const handleSettingsChange = useCallback((
    key: keyof VideoSettings,
    value: number
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle render (mock for now)
  const handleRender = useCallback(async () => {
    setRenderProgress({
      status: 'preparing',
      progress: 0,
      message: 'Preparing video...'
    });

    // Simulate render progress
    const steps = [
      { status: 'preparing' as const, progress: 10, message: 'Loading assets...' },
      { status: 'rendering' as const, progress: 30, message: 'Rendering frames...' },
      { status: 'rendering' as const, progress: 50, message: 'Rendering frames...' },
      { status: 'rendering' as const, progress: 70, message: 'Rendering frames...' },
      { status: 'encoding' as const, progress: 85, message: 'Encoding video...' },
      { status: 'encoding' as const, progress: 95, message: 'Finalizing...' },
      { status: 'complete' as const, progress: 100, message: 'Complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setRenderProgress(prev => ({
        ...prev,
        ...step,
        estimatedTimeRemaining: Math.ceil((100 - step.progress) / 10)
      }));
    }

    // Show completion briefly then reset
    setTimeout(() => {
      setRenderProgress({
        status: 'idle',
        progress: 0,
        message: ''
      });
      // Mock download
      alert('Video rendered successfully! (This is a demo - full rendering requires Remotion server-side setup)');
    }, 1000);
  }, []);

  // Handle cancel render
  const handleCancelRender = useCallback(() => {
    setRenderProgress({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  // Check if can render
  const canRender = files.audio !== null &&
    files.coverArt !== null &&
    mainLyrics.length > 0;

  // Keyboard shortcut for render
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canRender) {
        e.preventDefault();
        handleRender();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRender, handleRender]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (fileUrls.audio) revokeFileUrl(fileUrls.audio);
      if (fileUrls.coverArt) revokeFileUrl(fileUrls.coverArt);
    };
  }, []);

  const isRendering = renderProgress.status !== 'idle' &&
    renderProgress.status !== 'complete';

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        files={files}
        fileUrls={fileUrls}
        settings={settings}
        onFileChange={handleFileChange}
        onSettingsChange={handleSettingsChange}
        onRender={handleRender}
        isRendering={isRendering}
        canRender={canRender}
      />

      {/* Video Preview */}
      <VideoPreview
        audioUrl={fileUrls.audio}
        coverArtUrl={fileUrls.coverArt}
        mainLyrics={mainLyrics}
        subLyrics={subLyrics}
        colorPalette={colorPalette}
        settings={settings}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        progress={renderProgress}
        onCancel={handleCancelRender}
      />
    </div>
  );
}
