'use client';

import React, { useCallback, useState } from 'react';
import { FileUploadProps } from '@/types';
import { Check, Upload } from 'lucide-react';

export function FileUpload({
    label,
    accept,
    icon,
    file,
    onFileSelect,
    previewUrl
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    }, [onFileSelect]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    }, [onFileSelect]);

    const hasFile = file !== null;

    return (
        <div
            className={`upload-zone ${isDragging ? 'active' : ''} ${hasFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={previewUrl ? {
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            } : undefined}
        >
            <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                aria-label={label}
            />

            {previewUrl && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)'
                }} />
            )}

            <div className="upload-zone-icon" style={{ position: 'relative', zIndex: 1 }}>
                {hasFile ? <Check size={24} /> : icon}
            </div>

            <div className="upload-zone-text" style={{ position: 'relative', zIndex: 1 }}>
                {hasFile ? (
                    <span className="upload-zone-filename">{file.name}</span>
                ) : (
                    <>
                        <strong>{label}</strong>
                        <br />
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>
                            Drop file or click to browse
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

export default FileUpload;
