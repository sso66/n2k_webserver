// File: src/components/Digital.jsx
// Note: Digital Component Template
// Date: 02/07/2020
//..................................................................................................
import React from 'react';

import Format from './Format';
import DigitalBase from './DigitalBase';
import MultiLineText from './MultiLineText';

console.log( "Mounting Digital.jsx... <Digital />" );

/*************************************************************************************************
 * class Digital
 *************************************************************************************************/
class Digital extends DigitalBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"digital"}`;
        if ( this.mHeight < 75 )
        {
            this.mMaxFontSize = 18;
            this.mValueY = 32;
        }
        else
        {
            this.mMaxFontSize = 26;
            this.mValueY = 60;
        }
    } // end constructor

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render(){
        let textStyles = {
            fontSize:this.mMaxFontSize,
            fontWeight:"bold"
        };
        let color = this.GetRangeColor();
        let value = "-";
        if ( this.props.data )
            value = this.props.data.value;
        let units = "";
        if ( this.props.data )
            units = this.props.data.units;
        return (
            <svg
                viewBox={this.mViewBox}
                className={this.className}
                style={this.mStyles}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <rect
                    className="component-outline digital"
                    display=""
                    x="1%"
                    y="11"
                    width="98%"
                    height={this.mHeight-23}
                />

                <rect
                    className="component-surface digital"
                    display=""
                    x="2%"
                    y="12"
                    width="96%"
                    height={this.mHeight-25}
                />

                <rect
                    className="component-border digital"
                    display=""
                    x="3%"
                    y="13"
                    width="94%"
                    height={this.mHeight-27}
                />

                <text
                    className="title digital"
                    x="50%"
                    y="8"
                >
                    {this.props.metadata.title}
                </text>

                <CarlingLabel {...this.props}/>

                <rect
                    className="numeric-background"
                    display=""
                    x="7%"
                    y="28%"
                    width="86%"
                    height="42%"
                    fill={color}
                />

                {/* viewport: svg-main-content */}
                <MultiLineText
                    fill={this.GetTextColor(color)}
                    text={Format(this.props.metadata.format,value)}
                    centerY={this.mValueY}
                    width={this.mWidth}
                    styles={textStyles}/>

                <text
                    className="units digital"
                    display=""
                    x={this.mWidth-5}
                    y={this.mHeight-3}
                >
                    {units}
                </text>
            </svg>
        );
    } // end function render
} // end class DigitalBase

/*************************************************************************************************
 * class CarlingLabel
 *************************************************************************************************/
class CarlingLabel extends React.Component {
    render() {
        if ( this.props.height > 90 )
            return (
                <text
                    className="carling-label digital"
                    display=""
                    x="50%"
                    y="22%"
                >
                    Carling Technologies
                </text> );
        else
            return null;
    } // end function render
}; // end class CarlingLabel

/*************************************************************************************************/

export default Digital

// eof
