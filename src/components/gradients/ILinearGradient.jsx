// File: src/components/gradients/ILinearGradient.jsx
// Note: List of linear gradient definitions to archieving 3D Effects for SVG Icon 
// Date: 02/06/2020
//..................................................................................................
import React from 'react';

console.log("Mounting ILinearGradient.jsx... <ILinearGradient />")


const ILinearGradient = (props) => (
    <svg {...props}>
        <defs>
            {/* Component Button */}
            <linearGradient
                id="button-surface"
                gradientUnits="objectBoundingBox"
                x1={1}
                y1={0}
                x2={1}
                y2={1}
            >
                <stop stopColor="#434343" offset={0} />
                <stop stopColor="#000000" offset={0.67} />
            </linearGradient>
            
            <linearGradient
                id="virtual-light"
                gradientUnits="objectBoundingBox"
                x1={0}
                y1={0}
                x2={0}
                y2={1}
            >
                <stop stopColor="#EEE" offset={0} stopOpacity={1} />
                <stop stopColor="#EEE" offset={0.4} stopOpacity={0} />
            </linearGradient>            
            
            <linearGradient 
                id="green-gradient"
                x1="20%"
                y1="20%"
                x2="80%"
                y2="80%"
            >
                <stop stopColor="#EEEEEE" offset="0" />
                <stop stopColor="forestGreen" offset="0.3" />
                <stop stopColor="lightBlue" offset="1" />
            </linearGradient>


            {/* Active Button */}
            <linearGradient 
                id="defaultGrad" 
                gradientUnits="userSpaceOnUse"
                gradientTransform="rotate(30)"
            >
                <stop offset="15%" stopColor="#A0A0A0"/>
                <stop offset="85%" stopColor="#C0C0C0"/>
                <stop offset="100%" stopColor="#FFFF00"/> 
            </linearGradient>


            {/* Indicator */}                        
            <linearGradient id="redIndicatorGrad">
                <stop offset="5%"  stopColor="#900000"/>
                <stop offset="50%" stopColor="#D00000"/>
                <stop offset="95%" stopColor="#900000"/>
            </linearGradient>
            <linearGradient id="blackIndicatorGrad">
                <stop offset="5%"  stopColor="#000000"/>
                <stop offset="50%" stopColor="#444444"/>
                <stop offset="95%" stopColor="#000000"/>
            </linearGradient>
            <linearGradient id="greenIndicatorGrad">
                <stop offset="5%"  stopColor="#009000"/>
                <stop offset="50%" stopColor="#00D000"/>
                <stop offset="95%" stopColor="#009000"/>
            </linearGradient>
            <linearGradient id="yellowIndicatorGrad">
                <stop offset="5%"  stopColor="#909000"/>
                <stop offset="50%" stopColor="#D0D000"/>
                <stop offset="95%" stopColor="#909000"/>
            </linearGradient>
            <linearGradient id="orangeIndicatorGrad">
                <stop offset="5%"  stopColor="#904000"/>
                <stop offset="50%" stopColor="#D08000"/>
                <stop offset="95%" stopColor="#904000"/>
            </linearGradient>
            <linearGradient id="blueIndicatorGrad">
                <stop offset="5%"  stopColor="#000090"/>
                <stop offset="50%" stopColor="#0000FF"/>
                <stop offset="95%" stopColor="#000090"/>
            </linearGradient>
            <linearGradient id="defaultIndicatorGrad">
                <stop offset="5%"  stopColor="#606060"/>
                <stop offset="50%" stopColor="#404040"/>
                <stop offset="95%" stopColor="#606060"/>
            </linearGradient>
            

            {/* Push Button */}
            <linearGradient id="redGrad" gradientTransform="rotate(35)">
                <stop offset="5%" stopColor="#900000"/>
                <stop offset="95%" stopColor="#D00000"/>
            </linearGradient>
            <linearGradient id="blackGrad" gradientTransform="rotate(35)">
                <stop offset="5%" stopColor="#000000"/>
                <stop offset="95%" stopColor="#505050"/>
            </linearGradient>
            <linearGradient id="greenGrad" gradientTransform="rotate(35)">
                <stop offset="5%" stopColor="#009000"/>
                <stop offset="95%" stopColor="#00D000"/>
            </linearGradient>
            <linearGradient id="yellowGrad" gradientTransform="rotate(35)">
                <stop offset="5%" stopColor="#CC0"/>
                <stop offset="95%" stopColor="#FF0"/>
            </linearGradient>
            <linearGradient id="orangeGrad" gradientTransform="rotate(35)">
                <stop offset="5%" stopColor="#C60"/>
                <stop offset="95%" stopColor="#D80"/>
            </linearGradient>
            <linearGradient id="blueGrad" gradientTransform="rotate(35)">
                <stop offset="5%" stopColor="#0000A0"/>
                <stop offset="95%" stopColor="#0000D0"/>
            </linearGradient>
            <linearGradient id="defaultGrad" gradientTransform="rotate(35)">
                <stop offset="5%" stopColor="#505050"/>
                <stop offset="95%" stopColor="#C0C0C0"/>
            </linearGradient>
        </defs>
    </svg>
)

export default ILinearGradient;

// eof
