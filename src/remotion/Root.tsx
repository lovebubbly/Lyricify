import React from 'react';
import { Composition } from 'remotion';
import { LyricVideo } from './LyricVideo';
import { LyricVideoProps } from '@/types';

const defaultProps: LyricVideoProps = {
    audioUrl: '',
    coverArtUrl: '',
    mainLyrics: [],
    subLyrics: [],
    colorPalette: {
        dominant: '#000000',
        palette: ['#000000', '#333333'],
        vibrant: '#ffffff',
        isDark: true
    },
    settings: {
        fontSize: 36,
        blurIntensity: 80,
        fps: 60,
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
            fps={60}
            width={1920}
            height={1080}
            defaultProps={defaultProps as any}
            calculateMetadata={async ({ props }) => {
                const typedProps = props as unknown as LyricVideoProps;
                return {
                    durationInFrames: typedProps.durationInFrames || 300,
                    fps: typedProps.settings?.fps || 60,
                    width: typedProps.settings?.width || 1920,
                    height: typedProps.settings?.height || 1080,
                };
            }}
        />
    );
};
