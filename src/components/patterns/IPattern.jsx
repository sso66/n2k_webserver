// File: src/components/patterns/ILinearGradient.jsx
// Note: List of pattern definitions to archieving 3D Effects for SVG Icon 
// Date: 01/24/2020
//..................................................................................................
import React from 'react';

console.log("Mounting IPattern.jsx... <IPattern />")


const IPattern = (props) => (
    <svg {...props}>
        <defs>
            <pattern 
                id="stripe" 
                patternUnits="userSpaceOnUse" 
                x="0" 
                y="0" 
                width="6" 
                height="6"
            >
                <path 
                    d="M 0 0 6 0" 
                    fill='none'
                    stroke='#FFF' 
                    strokeOpacity="0.25"
                />
            </pattern>
            
            <pattern 
                id="polkadot" 
                patternUnits="userSpaceOnUse" 
                x="0" 
                y="0" 
                width="36" 
                height="36"
            >
                <circle 
                    cx="12" 
                    cy="12" 
                    r="12" 
                    fill="url(#stripe)" 
                    stroke='#FFF'
                    strokeOpacity="0.25"
                />
            </pattern>
        </defs>
    </svg>
)

export default IPattern;

// eof
