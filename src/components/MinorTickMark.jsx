// File: src/components/MinorTickMark.jsx
// Note: Minor tick markers for N2K Components
// Date: 02/03/2020
//..................................................................................................
import React from 'react';

console.log("Mounting MinorTickMark.jsx... <MinorTickMark />" );

/*************************************************************************************************
 * class MinorTickMark
 *************************************************************************************************/
class MinorTickMark extends React.Component{

    render() {
        return (
            <line
                className="ticks minor-tick"
                display=""
                x1={32.5}
                y1={18}
                x2={35}
                y2={18}
                transform={this.props.transform}
            />
        );
    } // end function render
}; // end class MinorTickMark

/*************************************************************************************************/

/*************************************************************************************************
 * class MinorTickMarkHorizontal
 *************************************************************************************************/
class MinorTickMarkHorizontal extends React.Component{

    render(){
        return (
            <rect
                className="ticks minor-tick"
                display=""
                x={this.props.x-9}
                y={this.props.y-1}
                width={5}
                height={0.01}
                transform="translate(0,0.5)"
            />
        );
    } // end function render
}; // end class MinorTickMarkHorizontal

/*************************************************************************************************/

export { MinorTickMark, MinorTickMarkHorizontal };

// eof
