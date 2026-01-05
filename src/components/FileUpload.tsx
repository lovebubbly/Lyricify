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
            className={`
                relative flex flex-col items-center justify-center gap-3 p-6 min-h-[120px] 
                bg-card/30 border-2 rounded-xl transition-all duration-300
                ${isDragging
                    ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(250,45,72,0.1)]'
                    : hasFile ? 'border-primary bg-primary/10' : 'border-dashed border-border/50 hover:bg-card/50 hover:border-primary/50'}
                cursor-pointer overflow-hidden group
            `}
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
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                accept={accept}
                onChange={handleFileChange}
                aria-label={label}
            />

            {previewUrl && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            )}

            <div className={`relative z-0 transition-colors duration-300 ${hasFile ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {hasFile ? <Check size={24} className="text-primary drop-shadow-md" /> : icon}
            </div>

            <div className="relative z-0 text-center">
                {hasFile ? (
                    <span className="text-xs font-medium text-primary break-all line-clamp-1 px-4">{file.name}</span>
                ) : (
                    <div className="flex flex-col gap-1">
                        <strong className="text-sm font-medium text-foreground">{label}</strong>
                        <span className="text-[10px] text-muted-foreground">
                            Drop file or click to browse
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
