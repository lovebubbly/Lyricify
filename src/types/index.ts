// SRT File Types
export interface LyricLine {
  id: number;
  startTime: number;    // in seconds
  endTime: number;      // in seconds
  startFrame: number;   // at given FPS
  endFrame: number;     // at given FPS
  text: string;
}

export interface ParsedSRT {
  lines: LyricLine[];
  duration: number;     // total duration in seconds
}

// Color Extraction Types
export interface ColorPalette {
  dominant: string;     // hex color
  palette: string[];    // array of accent colors
  vibrant: string;      // most vibrant color for accents
  isDark: boolean;      // whether the dominant color is dark
}

// App State Types
export interface UploadedFiles {
  audio: File | null;
  coverArt: File | null;
  mainLyrics: File | null;
  subLyrics: File | null;
}

export interface FileUrls {
  audio: string | null;
  coverArt: string | null;
}

export interface VideoSettings {
  fontSize: number;       // 16-48
  blurIntensity: number;  // 20-120
  fps: number;            // typically 30
  width: number;          // 1920
  height: number;         // 1080
}

export interface LyricState {
  mainLyrics: LyricLine[];
  subLyrics: LyricLine[];
  currentMainIndex: number;
  currentSubIndex: number;
  currentFrame: number;
  isPlaying: boolean;
}

// Remotion Composition Props
export interface LyricVideoProps {
  audioUrl: string;
  coverArtUrl: string;
  mainLyrics: LyricLine[];
  subLyrics: LyricLine[];
  colorPalette: ColorPalette;
  settings: VideoSettings;
  durationInFrames: number;
}

export interface DynamicBackgroundProps {
  coverArtUrl: string;
  colorPalette: ColorPalette;
  blurIntensity: number;
}

export interface LyricDisplayProps {
  mainLyrics: LyricLine[];
  subLyrics: LyricLine[];
  colorPalette: ColorPalette;
  fontSize: number;
}

// Render State
export interface RenderProgress {
  status: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'complete' | 'error';
  progress: number;       // 0-100
  message: string;
  estimatedTimeRemaining?: number;
}

// Component Props
export interface FileUploadProps {
  label: string;
  accept: string;
  icon: React.ReactNode;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  previewUrl?: string | null;
}

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}
