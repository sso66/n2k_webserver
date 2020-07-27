// File: src/components/PushButtonColored.js
// Note: Shared functionality for PushButton Component Types
// Date: 01/24/2020
//..................................................................................................
import React from 'react';

import BreakerDecoration from './BreakerDecoration';
import PushButtonBase from './PushButtonBase';
import MultiLineText from './MultiLineText';
import ILinearGradient from './gradients/ILinearGradient';

console.log("Mounting PushButtonColored.jsx... <PushButtonColored />" );

/*********************************************************************************************
 * class PushButtonColored
 *********************************************************************************************/

class PushButtonColored extends PushButtonBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"push-button-colored"}`;
    } // end constructor

    /*********************************************************************************************
     * function GetFill
     *********************************************************************************************/
    GetFill(colorStr) {
        switch(colorStr)
        {
            case "red"      : return "url(#redGrad)";
            case "black"    : return "url(#blackGrad)";
            case "green"    : return "url(#greenGrad)";
            case "yellow"   : return "url(#yellowGrad)";
            case "orange"   : return "url(#orangeGrad)";
            case "blue"     : return "url(#blueGrad)";
            default         : return colorStr;
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
    render() {
        var textStyles = {
            fontSize:13,
            fontWeight:"bold"
        };
//        console.log( "--> PushButtonColored.render props = " + JSON.stringify( this.props ));
        var color = this.GetColor(this.props.data.value);
        var title = this.GetText(this.props.data.value);
        var cursorType = this.GetCursorType();

        var pushButtonStyles = {
            ...this.mStyles ,
            cursor : cursorType
        };
//        console.log( "--> PushButtonColored.render mMode = " + this.props.mMode + ", styles = " + JSON.stringify( pushButtonStyles ));
//        console.log( "    cursorType = " + cursorType );
//        console.log( "    " + this.props.metadata.title + " value = 0x" + this.props.data.value.toString(16) + ", color=0x"+color.toString(16));

        this.lastValue = this.props.data.value;

        return (
            <div onMouseDown={this.OnMouseDown}  onMouseUp={this.OnMouseUp}>
                <svg
                    viewBox={this.mViewBox}
                    style={pushButtonStyles}
                    className={this.className}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    <ILinearGradient />

                    <rect
                        display=""
                        x="1%"
                        y="2%"
                        width="98%"
                        height="96%"
                        rx={this.mHeight*0.49}  ry={this.mHeight*0.48}
                        fill="#222"
                    />
                    <rect
                        display=""
                        x="3%"
                        y="6%"
                        width="94%"
                        height="88%"
                        rx={this.mHeight*0.48}  ry={this.mHeight*0.46}
                        fill={this.GetFill(color)}
                    />
                    <MultiLineText
                        fill={this.GetTitleColor(this.props.data.value, color)}
                        text={title}
                        centerY={this.mHeight/2+2}
                        width={100}
                        styles={textStyles}
                    />

                    <BreakerDecoration {...this.props} color={color}/>
                </svg>
            </div>
        );
    } // end function render

    /*********************************************************************************************/

} // end class PushButtonColored

/*************************************************************************************************/

export default PushButtonColored;

// eof
