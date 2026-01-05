'use client';

import React from 'react';
import { RenderProgress } from '@/types';

interface LoadingOverlayProps {
    progress: RenderProgress;
    onCancel?: () => void;
}

export function LoadingOverlay({ progress, onCancel }: LoadingOverlayProps) {
    if (progress.status === 'idle' || progress.status === 'complete') {
        return null;
    }

    const statusMessages: Record<string, string> = {
        preparing: 'Preparing video...',
        rendering: 'Rendering frames...',
        encoding: 'Encoding video...',
        error: 'An error occurred'
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in gap-6">
            {progress.status === 'error' ? (
                <>
                    <div className="text-6xl animate-bounce">⚠️</div>
                    <p className="text-lg font-bold text-destructive">
                        {progress.message || 'Something went wrong'}
                    </p>
                    {onCancel && (
                        <button
                            className="glass-button bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full font-medium transition-colors"
                            onClick={onCancel}
                        >
                            Dismiss
                        </button>
                    )}
                </>
            ) : (
                <>
                    <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
                    <p className="text-lg font-medium text-secondary-foreground">
                        {statusMessages[progress.status] || progress.message}
                    </p>
                    <div className="w-[300px] h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-rose-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                        {Math.round(progress.progress)}% complete
                        {progress.estimatedTimeRemaining !== undefined && (
                            <> • ~{Math.ceil(progress.estimatedTimeRemaining)}s remaining</>
                        )}
                    </p>
                    {onCancel && (
                        <button
                            className="mt-4 px-6 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default LoadingOverlay;
