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
  fps: 60,
  width: 1920,
  height: 1080,
  title: '',
  artist: ''
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
    value: number | string
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      console.log('Saving settings:', newSettings); // Debug
      if (typeof window !== 'undefined') {
        localStorage.setItem('lyricify-settings', JSON.stringify(newSettings));
      }
      return newSettings;
    });
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lyricify-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('Loaded settings:', parsed); // Debug
          setSettings(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (e) {
          console.error('Failed to parse saved settings', e);
        }
      }
    }
  }, []);

  // Helper to get audio duration
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(url);
      };
      audio.onerror = (e) => {
        reject(e);
        URL.revokeObjectURL(url);
      };
    });
  };

  // Handle render
  const handleRender = useCallback(async () => {
    if (!files.audio || !files.coverArt) return;

    setRenderProgress({
      status: 'preparing',
      progress: 0,
      message: 'Preparing assets...'
    });

    try {
      // Get audio duration to calculate frames
      const duration = await getAudioDuration(files.audio);
      const durationInFrames = Math.ceil(duration * settings.fps);

      setRenderProgress({
        status: 'rendering',
        progress: 10,
        message: 'Rendering video on server... (This may take a while)'
      });

      const formData = new FormData();
      formData.append('audio', files.audio);
      formData.append('coverArt', files.coverArt);

      const renderData = {
        mainLyrics,
        subLyrics,
        colorPalette,
        settings,
        durationInFrames
      };

      formData.append('data', JSON.stringify(renderData));

      const response = await fetch('/api/render', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Rendering failed');
      }

      setRenderProgress({
        status: 'encoding',
        progress: 90,
        message: 'Downloading video...'
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lyric-video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setRenderProgress({
        status: 'complete',
        progress: 100,
        message: 'Complete!'
      });

      // Reset after delay
      setTimeout(() => {
        setRenderProgress({
          status: 'idle',
          progress: 0,
          message: ''
        });
      }, 3000);

    } catch (error) {
      console.error('Export failed:', error);
      setRenderProgress({
        status: 'idle', // Reset to idle so user can try again
        progress: 0,
        message: ''
      });
      alert(`Export failed: ${(error as Error).message}`);
    }
  }, [files.audio, files.coverArt, mainLyrics, subLyrics, colorPalette, settings]);

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
    <div className="flex h-screen overflow-hidden bg-background font-sans">
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
