import { Config } from '@remotion/cli/config';
import path from 'path';

// Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((currentConfiguration) => {
    return {
        ...currentConfiguration,
        resolve: {
            ...currentConfiguration.resolve,
            alias: {
                ...(currentConfiguration.resolve?.alias || {}),
                '@': path.join(process.cwd(), 'src'),
            },
            extensions: [
                ...(currentConfiguration.resolve?.extensions || []),
                ".ts", ".tsx"
            ]
        },
    };
});
