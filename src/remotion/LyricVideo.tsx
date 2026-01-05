import React from 'react';
import { AbsoluteFill, Audio, Sequence } from 'remotion';
import { LyricVideoProps } from '@/types';
import { DynamicBackground } from './DynamicBackground';
import { LyricDisplay } from './LyricDisplay';

export const LyricVideo: React.FC<LyricVideoProps> = ({
    audioUrl,
    coverArtUrl,
    mainLyrics,
    subLyrics,
    colorPalette,
    settings,
    durationInFrames
}) => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#000000',
                overflow: 'hidden'
            }}
        >
            {/* Audio Track */}
            <Audio src={audioUrl} />

            {/* Dynamic Background */}
            <Sequence from={0} durationInFrames={durationInFrames}>
                <DynamicBackground
                    coverArtUrl={coverArtUrl}
                    colorPalette={colorPalette}
                    blurIntensity={settings.blurIntensity}
                />
            </Sequence>

            {/* Lyrics Display */}
            <Sequence from={0} durationInFrames={durationInFrames}>
                <LyricDisplay
                    mainLyrics={mainLyrics}
                    subLyrics={subLyrics}
                    colorPalette={colorPalette}
                    fontSize={settings.fontSize}
                />
            </Sequence>
        </AbsoluteFill>
    );
};

export default LyricVideo;
