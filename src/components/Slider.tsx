'use client';

import React from 'react';
import { SliderProps } from '@/types';

export function Slider({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    onChange
}: SliderProps) {
    const progress = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value));
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground font-medium">{label}</span>
                <span className="text-xs text-foreground font-variant-numeric tabular-nums font-mono">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/90 transition-all
                focus:outline-none focus:ring-2 focus:ring-primary/20
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md 
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                aria-label={label}
            />
        </div>
    );
}

export default Slider;
