// File: src/components/Indicator.jsx
// Note: Shared functionality for Indicator Component Types
// Date: 01/24/2020
//..................................................................................................
import React from 'react';

import IndicatorBase from './IndicatorBase';
import MultiLineText from './MultiLineText';
import ILinearGradient from './gradients/ILinearGradient';

console.log( "Mounting Indicator.jsx... <Indicator />" );

/*************************************************************************************************
 * class Indicator
 *************************************************************************************************/
class Indicator extends IndicatorBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className = `svg-icon ${"indicator"}`;
    } // end constructor

    /*********************************************************************************************
     * function GetFill
     *********************************************************************************************/
    GetFill(colorStr) {
        switch(colorStr)
        {
            case "red":return "url(#redIndicatorGrad)";
            case "black":return "url(#blackIndicatorGrad)";
            case "green":return "url(#greenIndicatorGrad)";
            case "yellow":return "url(#yellowIndicatorGrad)";
            case "orange":return "url(#orangeIndicatorGrad)";
            case "blue":return "url(#blueIndicatorGrad)";
            default : return "url(#defaultIndicatorGrad)";
        }
    } // end function GetFill

    /*********************************************************************************************
     * function GetTitleColor
     *********************************************************************************************/
    GetTitleColor( value, color ) {
        if ( (value & 0x3) === 0x3 )
            return "#666";
        else
            return this.GetTextColor( color );
    } // end function GetTitleColor

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render(){
        let textStyles = {
            fontSize:( this.mHeight < 40 )?9:13,
            fontWeight:"bold"
        };

        var color = this.GetColor(this.props.data.value&0x3);
        //console.log( "color = 0x" + color.toString(16) );
        var title = this.GetText(this.props.data.value&0x3);
        this.mLastValue = this.props.data.value;

        return (
          <svg
                viewBox={this.mViewBox}
                style={this.mStyles}
                className={this.className}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <ILinearGradient />

                {/* Outer White Housing */}
                <rect
                    x={1.5}
                    y={1.5}
                    width={this.mWidth-3}
                    height={this.mHeight-3}
                    rx={7}
                    ry={7}
                    stroke={((this.props.data.value&0x3)===0x3)?"#666":"#FFF"}
                    strokeWidth={1.2}
                    fill={((this.props.data.value&0x3)===0x3)?"#444":"#CCC"}
                />
                {/* Inner Grey Housing */}
                <rect
                    x={5}
                    y={5}
                    width={this.mWidth-10}
                    height={this.mHeight-10}
                    rx={4}
                    ry={4}
                    stroke="#000"
                    strokeWidth={2}
                    fill={this.GetFill(color)}
                />
                <MultiLineText
                    fill={this.GetTitleColor(this.props.data.value, color)}
                    text={title}
                    centerY={this.mHeight/2+3}
                    styles={textStyles}
                />
            </svg>
        );
    } // end function render

    /*********************************************************************************************/

} // end class Indicator

/*************************************************************************************************/

export default Indicator;

// eof

