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
        <div className="loading-overlay animate-fade-in">
            {progress.status === 'error' ? (
                <>
                    <div style={{ fontSize: '48px' }}>⚠️</div>
                    <p className="loading-text" style={{ color: 'var(--error)' }}>
                        {progress.message || 'Something went wrong'}
                    </p>
                    {onCancel && (
                        <button className="glass-button" onClick={onCancel}>
                            Dismiss
                        </button>
                    )}
                </>
            ) : (
                <>
                    <div className="loading-spinner" />
                    <p className="loading-text">
                        {statusMessages[progress.status] || progress.message}
                    </p>
                    <div className="loading-progress">
                        <div
                            className="loading-progress-bar"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {Math.round(progress.progress)}% complete
                        {progress.estimatedTimeRemaining !== undefined && (
                            <> • ~{Math.ceil(progress.estimatedTimeRemaining)}s remaining</>
                        )}
                    </p>
                    {onCancel && (
                        <button
                            className="glass-button"
                            onClick={onCancel}
                            style={{ marginTop: '16px' }}
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
