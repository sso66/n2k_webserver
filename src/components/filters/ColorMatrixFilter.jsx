// File: src/components/filters/ColorMatrixFilter.jsx
// Note: List of filter definitions to archieving 3D Effects with SVG 
// Date: 01/23/2020
//..................................................................................................
import React from 'react'

console.log("Mounting ColorMatrixFilter.jsx... <ColorMatrixFilter />")

const ColorMatrixFilter = props => (
    <svg>
        <defs>
            <filter id="glow">
                <feColorMatrix 
                    type="matrix"
                    values=
                    "
                    0 0 0 0 0
                    0 0 0 0.9 0
                    0 0 0 0.9 0
                    0 0 0 0 1
                    "
                />
        
                <feGaussianBlur 
                    stdDeviation="3.5"
                    result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    </svg>
)

export default ColorMatrixFilter;

// eof
