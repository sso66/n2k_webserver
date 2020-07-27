// File: src/components/MajorTickMark.jsx
// Note: Major tick markers for N2K Components
// Date: 02/03/2020
//..................................................................................................
import React from 'react';

console.log("Mounting MajorTickMark.jsx... <MajorTickMark />" );

/*************************************************************************************************
 * class MajorTickMark
 *************************************************************************************************/
class MajorTickMark extends React.Component{

    render() {
        return (
            <line
                className="ticks major-tick"
                display=""
                x1={32}
                y1={18}
                x2={35}
                y2={18}
                transform={this.props.transform}
            />
        );
    } // end function render
}; // end class MajorTickMark

/*************************************************************************************************/

/*************************************************************************************************
 * class MajorTickMarkHorizontal
 *************************************************************************************************/
class MajorTickMarkHorizontal extends React.Component{

    render() {
        return (
            <rect
                className="ticks major-tick"
                display=""
                x={this.props.x-9.5}
                y={this.props.y-1}
                width={6}
                height={0.08}
                transform="translate(0,0.5)"
            />
        );
    } // end function render
}; // end class MajorTickMarkHorizontal

/*************************************************************************************************/

export { MajorTickMark, MajorTickMarkHorizontal };

// eof

