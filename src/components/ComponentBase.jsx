// File: src/components/ComponentBase.jsx
// Note: Super class object for all N2KView monitoring and control components
// Date: 02/10/2020
//..................................................................................................
import React from 'react';


console.log( "Mounting ComponentBase.jsx... <ComponentBase />" );

/*************************************************************************************************
 * class ComponentBase
 *************************************************************************************************/
class ComponentBase extends React.Component {
    static colors = {
        black   : "#000000",
        blue    : "#0000FF",
        cyan    : "#00FFFF",
        grey    : "#808080",
        green   : "#008000",
        orange  : "#FFA500",
        red     : "#FF0000",
        white   : "#FFFFFF",
        yellow  : "#FFFF00",
    }
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.mWidth = props.width;
        this.mHeight = props.height;
        this.mLastValue = "-";
        this.mViewBox="0 0 " + props.width + " " + props.height;

        this.mStyles = {
            position: "absolute",
            top: this.props.metadata.top,
            left: this.props.metadata.left,
            width: this.props.metadata.width,
            height: this.props.metadata.height,
        };
    } // end constructor

    /*********************************************************************************************
     * function shouldComponentUpdate
     *********************************************************************************************/
    shouldComponentUpdate = (nextProps,nextState) => {
        //console.log( "--> ComponentBase.shouldComponentUpdate mode = " + this.props.mode + ", next mode = " + nextProps.mode );
        if ( this.props.mode !== nextProps.mode )
            return true;
        else if ( nextProps.data )
            return nextProps.data.value !== this.lastValue;
        else
            return true;
    } // end function shouldComponentUpdate

    /*********************************************************************************************
     * function GetRangeColor
     *********************************************************************************************/
    GetRangeColor() {
        var color = "#000";
        if ( this.props.metadata.ranges )
        {
            this.props.metadata.ranges.some( range =>
                {
                    let inRange = ( range.min <= this.props.data.value
                                    && this.props.data.value <= range.max );
                    if ( inRange )
                        color = range.color;
                    return inRange;
                }
            ); // end Array.some loop
        }
        return color;
    } // end function GetRangeColor

    /*********************************************************************************************
     * function GetRGBColor
     *********************************************************************************************/
    GetRGBColor( color ) {
        if ( color[0] === "#" )
            return color;
        else if ( ComponentBase.colors[color] )
            return ComponentBase.colors[color];
        else
            return "#888";
    } // end function GetRGBColor

    /*********************************************************************************************
     * function GetTextColor
     * @return "#FFF" (white) or "#000" (black) to ensure the text color contrasts with color.
     *********************************************************************************************/
    GetTextColor ( color ) {
        let rgbColor = this.GetRGBColor( color );
        let r,g,b=0; // red, green, blue as fractions
        if ( rgbColor.length === 4 )
        {
            // "#RGB"
            r = parseInt(rgbColor[1]+color[1],16);
            g = parseInt(rgbColor[2]+color[2],16);
            b = parseInt(rgbColor[3]+color[3],16);
        }
        else if ( rgbColor.length === 7 )
        {
            // "#RRGGBB"
            r = parseInt(rgbColor.substr(1,2),16);
            g = parseInt(rgbColor.substr(3,2),16);
            b = parseInt(rgbColor.substr(5,2),16);
        }
        let o = Math.round(( r*299 + g*587 + b*114 ) / 1000 );
        var textColor = (o>125)?"#000":"#FFF";
        return textColor;
    } // end function GetTextColor

    /*********************************************************************************************/

} // end class ComponentBase

/*************************************************************************************************/

export default ComponentBase;

// eof
