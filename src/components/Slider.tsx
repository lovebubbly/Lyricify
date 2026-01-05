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
        <div className="slider-container">
            <div className="slider-header">
                <span className="slider-label">{label}</span>
                <span className="slider-value">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                className="slider-input"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                style={{ '--progress': `${progress}%` } as React.CSSProperties}
                aria-label={label}
            />
        </div>
    );
}

export default Slider;
