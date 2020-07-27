// File: src/components/ComponentButton.jsx
// Note: A self-contained call-to-action button for N2KView components
// Date: 02/07/2020
//..................................................................................................
import React from 'react';

console.log( "Mounting ComponentButton.jsx... <ComponentButton />" );

const ComponentButton = (props) => (
    <svg
        width="100%"
        height="100%"
        {...props}
    >
        {/* vertical bounding box */}  
        <rect
            display="none"
            x="4%"
            y="15%"
            width="20%"
            height="80%"
            stroke="#FF0"
            strokeWidth="0.1"
            fill="#F00"
            fillOpacity="0.1"
        />
        
        {/* horizontal bounding box */}  
        <rect
            display="none"
            x="4%"
            y="80%"
            width="90%"
            height="15%"
            stroke="#FF0"
            strokeWidth="0.1"
            fill="#F00"
            fillOpacity="0.1"
        />

        {/* component viewport */}
        <svg
            x="4%"
            y="15%"
            width="20%"
            height="80%"
            viewBox={props.viewBox}
            preserveAspectRatio={"xMinYMax meet"}
        >
            <g className="component-button">
                {/* component surface */}
                <rect
                    display=""
                    x="5%"
                    y="43%"
                    rx="5%"
                    ry="5%"
                    width="94%"
                    height="45%"
                    stroke="#363636"
                    strokeWidth="1"
                    fill="url(#button-surface)"
                />
                
                <text
                    className="component-button title"
                    display=""
                    x="50%" 
                    y="72%" 
                >
                    <tspan>{props.title}</tspan>
                </text>
                
                {/* component effect */} 
                <rect
                    display=""
                    x="5%"
                    y="43%"
                    rx="5%"
                    ry="5%"
                    width="92%"
                    height="43%"
                    stroke="#FFF"
                    strokeOpacity={0.4}
                    fill="url(#virtual-light)"
                />
            </g>
        </svg>
    </svg>
)    

export default ComponentButton;

// eof 
