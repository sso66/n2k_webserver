// File: src/components/DigitalInvisible.js
// Note: Digital Component Type with no title or units
// Date: 01/24/2020
//..................................................................................................
import React from 'react';

import Format from './Format';
import DigitalBase from './DigitalBase';
import MultiLineText from './MultiLineText';

console.log( "Mounting DigitalInvisible.jsx... <DigitalInVisible />" );

/*************************************************************************************************
 * class DigitalInvisible
 *************************************************************************************************/
class DigitalInvisible extends DigitalBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.mValueY = 32;
        this.className=`svg-icon ${"digital-invisible"}`;
    } // end constructor

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render(){
        let color = this.GetRangeColor();
        let textColor = this.GetTextColor(color);
        let textStyles = {
            fontSize: 18,
            fontWeight: "bold"
        };
        return (
            <svg
                viewBox={this.mViewBox}
                style={this.mStyles}
                className={this.className}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <rect
                    className="numeric-background"
                    x="7%"
                    y="30%"
                    width="86%"
                    height="42%"
                    fill={color}
                />

                {/* value text */}
                <MultiLineText
        			fill={textColor}
        			text={Format(this.props.metadata.format,this.props.data.value)}
        			centerY={this.mValueY}
        			width={this.mWidth*0.9}
        			styles={textStyles}/>
            </svg>
        );
    } // end function render

    /**********************************************************************************************/

} // end class DigitalInvisible

/*************************************************************************************************/

export default DigitalInvisible

// eof
