// File: src/components/Tank.jsx
// Note: Tank Component Template: UIViewDatasource
// Date: 03/12/2020
//..................................................................................................
import React from 'react';

import ComponentBase from './ComponentBase';
import ComponentButton from './ComponentButton';
import Cylinder from './Cylinder';         
import Format from './Format';

console.log( "Mounting Tank.jsx... <Tank />" );

/*************************************************************************************************
 * class Tank
 *************************************************************************************************/
class Tank extends ComponentBase {
    static CYLINDER_WIDTH    = 20;
    static CYLINDER_HEIGHT   = 60; 
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"tank"}`;
    } // end constructor

    /*********************************************************************************************
     * function SetLanguage
     *********************************************************************************************/

    /*********************************************************************************************
     * function OnResetMinMax
     *********************************************************************************************/

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render(){
        // console.log( "Tank mviewBox: " + this.mViewBox );
        
        this.mLastValue = this.props.value;
        let color = "#000"
        
        return (
            <svg
                viewBox={this.mViewBox}
                style={this.mStyles}
                className={this.className}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <g>
                    <rect 
                        className="component-outline tank"
                        display=""
                        x="2%"
                        y="11%"
                        rx="0.5%"
                        ry="0.5%"
                        width="96%"
                        height="70%"
                    />
    
                    <rect
                        className="component-surface tank"
                        display=""
                        x="3%"
                        y="12%"
                        width="94%"
                        height="68%"
                    />
    
                    <rect
                        className="component-filter tank"
                        display=""
                        x="3%"
                        y="13%"
                        width="92%"
                        height="70%"
                    />
                    
                </g>
                [/* viewport reserved for vertically aligned text element */]
                <text
                    className="title tank"
                    display=""
                    x="50%"
                    y="8%"
                 >
                    {this.props.metadata.title}
                </text>
                
                {/* viewport: svg-main-content */}
                <svg
                    display=""
                    x="1%"
                    y="11%"
                    width="98%"
                    height="68%"
                    viewBox="0 0 20 40"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <Cylinder {...this.props} /> 
                    <TankMark {...this.props} />
                </svg>
                
                {/* data value object */}
                <text
                    className="value tank"
                    display=""
                    x="50%"
                    y="85%"
                    fill={this.GetTextColor(color)}
                >
                    {Format(this.props.metadata.format,this.props.data.value)}
                </text>
                
                <text
                    className="units tank"
                    display=""
                    x="90%"
                    y="90%"
                >
                    {this.props.data.units}
                </text>
                
                {/* assign title text with html entity & symbol use case */}
                <ComponentButton
                    display=""
                    // title="&copy;✌"                                         
                    title="Clear"
                    viewBox="0 0 30 60"
                />
            </svg>

        );
    } // end function render
} // end class Tank

/***********************************************************************************
 * class MinMarker
 ***********************************************************************************/
class MinMarker extends React.Component {

    render() {
        if(this.props.showMinValue) 
            return (
                <polygon
                    className="min-max-markers min-mark"
                    display=""
                    points="0,2 4,2 4,2 2,4"
                    transform="rotate(90, 18, 18) translate(-22 10) scale(0.9)"
                />
            );
        } // end render
} // end class MinMarker

/***********************************************************************************
 * class MaxMarker
 ***********************************************************************************/
class MaxMarker extends React.Component {
    
    render() {
        if(this.props.showMinValue)
            return (
                <polygon
                    className="min-max-markers max-mark"
                    display=""
                    points="0,2 4,2 4,2 2,4"
                    
                    transform="rotate(90, 18, 18) translate(18 10) scale(0.9)"
                />
            );
        } // end render
} // end class MaxMarker

/***********************************************************************************
 * class MinMaxMarkers
 ***********************************************************************************/
class MinMaxMarkers extends React.Component {
    
    render(){
        if ( !this.props.showMinValue && !this.props.showMaxValue )
            return "";
        return (
            <React.Fragment>
                <MinMarker {...this.props} />
                <MaxMarker {...this.props} />
                
                <ComponentButton
                    display=""
                    title="Reset"
                />
            </React.Fragment>
            );
        } // end render
} // end class MinMaxMarkers


/*************************************************************************************************
 * class CarlingLabel
 *************************************************************************************************/
class CarlingLabel extends React.Component {
    
    render() {
        // if ( this.props.height > 90 ) {
            return (
                <text
                    className="carling-label tank"
                    display=""
                    x="50%"
                    y="-5"
                >
                    <tspan>Carling Technologies</tspan>
                </text> );
        // } else {
            // return null;
        // }            
    } // end function render
}; // end class CarlingLabel

/*************************************************************************************************
 * class TankMark
 * A Tank Mark is a colored elliptical arc shape on the Tank or TankModern modules
 *************************************************************************************************/
class TankMark extends React.Component {
    
    render() {
       // const { ranges, min, max } = this.metadata;
       
       let color = "#000";
       
        if ( this.props.metadata.ranges )
        {
            this.props.metadata.ranges.some( range =>
                {
                    let inRange = ( range.min <= this.props.data.value
                                    && this.props.data.value <= range.max );
                    if ( inRange ) {
                        color = range.color;
                    }                        
                    return inRange;
                }
            ); // end Array.some method list comprehension
        }
        
        //___ tank progress value related to negative y-up scheme progression ___
        let value = (Tank.CYLINDER_HEIGHT
                        *(this.props.data.value-this.props.metadata.min)
                        /(this.props.metadata.max-this.props.metadata.min));
                       
        if ( isNaN(value) ) {
            value = Tank.CYLINDER_HEIGHT;
        }

        if ( value > Tank.CYLINDER_HEIGHT ) {
            value = 0;
        }         
        
        if ( value < 0 ) {
            value = Tank.CYLINDER_HEIGHT;
        }

        return (
            <React.Fragment>
            
                <rect
                    className="value tank"
                    display=""
                    x="10%"
                    y={value}
                    width="80%"
                    height={value}
                    fill={color}
                />
            </React.Fragment>                
        )
    } // end function render

} // end class TankMark

export default Tank;

// eof
