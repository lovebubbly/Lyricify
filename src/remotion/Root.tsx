import React from 'react';
import { Composition } from 'remotion';
import { LyricVideo } from './LyricVideo';

const defaultProps = {
    audioUrl: '',
    coverArtUrl: '',
    mainLyrics: [],
    subLyrics: [],
    colorPalette: null,
    settings: {
        fontSize: 36,
        blurIntensity: 80,
        fps: 30,
        width: 1920,
        height: 1080
    },
    durationInFrames: 300
};

export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="LyricVideo"
            component={LyricVideo as any}
            durationInFrames={300}
            fps={30}
            width={1920}
            height={1080}
            defaultProps={defaultProps as any}
        />
    );
};
