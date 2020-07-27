// File: src/components/gradients/IRadialGradient.jsx
// Desc: List of radial gradient definitions to archieving 3D Effects with SVG 
// Date: 01/22/2020
//..................................................................................................
import React from 'react';

console.log("Mounting IRadialGradient.jsx... <IRadialGradient />")


const IRadialGradient = (props) => (
    <svg {...props}>
        <defs>
            <radialGradient 
                id="three-stops"
                cx="50%" cy="50%" 
                fx="30%" fy="10%"
                spreadMethod="reflect"
            >
                <stop stopColor="#FFF" offset="0%"/>
                <stop stopColor="#333" offset="50%"/>
                <stop stopColor="midnightblue" offset="100%"/>
                {/*                    
                <stop stopColor="#f96" offset="0%"/>
                <stop stopColor="#fc9" offset="50%"/>
                <stop stopColor="#906" offset="100%"/>
                */}
            </radialGradient>
            
            <radialGradient 
                id="three-tones"
                cx="50%" cy="50%"
            >
                <stop stopColor="#333" offset="0%"/>
                <stop stopColor="#FFF" offset="50%"/>
                <stop stopColor="#FF9" offset="100%"/>
            </radialGradient>
            
            <radialGradient id="padded" xlinkHref="#three-tones" spreadMethod="pad"/>
            <radialGradient id="repeated" xlinkHref="#three-tones" spreadMethod="repeat"/>
            <radialGradient id="reflected" xlinkHref="#three-tones" spreadMethod="reflect"/>
        </defs>
    </svg>
)

export default IRadialGradient;

// eof
