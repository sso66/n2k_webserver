// File: src/components/Gauge.jsx
// Note: Radial Gauge Component Template
// Date: 03/12/2020
//..................................................................................................
import React from 'react';

import ComponentBase from './ComponentBase';
import ComponentButton from './ComponentButton';
import Format from './Format';
import { MajorTickMark } from './MajorTickMark';
import { MinorTickMark } from './MinorTickMark';

console.log( "Mounting Gauge.jsx... <Gauge />" );

/*************************************************************************************************
 * class Gauge
 *************************************************************************************************/
class Gauge extends ComponentBase {
    // ___ all angles are measured clockwise in degrees from the positive x axis ___
    static START_ANGLE          = 30;
    static END_ANGLE            = -210;
    static ANGLE_RANGE          = Gauge.START_ANGLE-Gauge.END_ANGLE; // degrees
    static TEXT_RADIUS          = 11; // pixels from center to tick text
    static COLOR_BAND_RADIUS    = 16;
    static COLOR_BAND_THICKNESS = 2;
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"gauge"}`;
    } // end constructor

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render(){
        //console.log( "--> Gauge.render props = " + JSON.stringify( this.props ));
        this.mLastValue = this.props.data.value;

        // This is the color of the Numeric Background, determined from the colors of the ranges.
        var color = this.GetRangeColor();
        return (
            <svg
                viewBox={this.mViewBox}
                style={this.mStyles}
                className={this.className}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <g className="component-container">
                    <circle
                        className="component-outline gauge"
                        cx="50%"
                        cy="50%"
                        r="37%"
                    />

                    <circle
                        className="component-surface gauge"
                        display=""
                        cx="50%"
                        cy="50%"
                        r="35%"
                    />

                    <circle
                        className="component-filter gauge"
                        display=""
                        cx="50%"
                        cy="50%"
                        r="36%"
                    />
                </g>

                <text
                    className="title"
                    display=""
                    x="50%"
                    y="8%"
                >
                    {this.props.metadata.title}
                </text>

                {/* viewport: svg-main-content */}
                <svg
                    x="1%"
                    y="16%"
                    width="98%"
                    height="68%"
                    viewBox="0 0 36 36"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <CarlingLabel {...this.props}/>
                    <Ranges {...this.props} />
                    <NumericBackground {...this.props} color={color}/>
                    <TickMarks {...this.props}/>

                    {/* data value object */}
                    <text
                        className="value"
                        display=""
                        x="50%"
                        y="86%"
                        fill={this.GetTextColor(color)}
                    >
                        {Format(this.props.metadata.format,this.props.data.value)}
                    </text>

                    {/* Needle goes above the text */}
                    <Needle {...this.props} value={this.props.data}/>
                    <MinMaxMarkers {...this.props} value={this.props.data}/>
                </svg>

                <text
                    className="units gauge"
                    display=""
                    x="95%"
                    y="90%"
                >
                    {this.props.data.units}
                </text>

                <ComponentButton
                    display=""
                    title="Reset"
                    viewBox="0 0 40 40"
                />
            </svg>
        );
    } // end function render
} // end class Gauge

/***********************************************************************************
 * class Needle
 * A needle's rotation based on current value within the limited range values.
 ***********************************************************************************/
class Needle extends React.Component {

    render() {
        var rotation = Gauge.END_ANGLE-10;

        if ( this.props.data && !isNaN(this.props.data.value) )
        {
            rotation = Gauge.START_ANGLE-Gauge.ANGLE_RANGE
                        /(this.props.metadata.max-this.props.metadata.min)
                        *(this.props.metadata.max-this.props.data.value);

            if ( rotation > Gauge.START_ANGLE+10 )
                rotation = Gauge.START_ANGLE+10;
            if ( rotation < Gauge.END_ANGLE-10 )
                rotation = Gauge.END_ANGLE-10;
        }

        let transform = `rotate(${rotation}, 18, 18 )`;

        return (
                <g transform={transform}>
                    <circle
                        className="needle-base"
                        cx={18}
                        cy={18}
                        r={1.591549430918954}

                    />
                    <line
                        className="needle"
                        x1={16}
                        y1={18}
                        x2={32}
                        y2={18}
                    />
                </g>
            );
        } // end render
} // end class Needle

/***********************************************************************************
 * class MinMarker
 ***********************************************************************************/
class MinMarker extends React.Component {

    render() {
        // if(this.props.showMinValue)
            return (
                <polygon
                    className="min-max-markers min-mark"
                    display=""
                    points="0,2 4,2 4,2 2,4"
                    transform="rotate(20, 18, 18) translate(16 -2) scale(0.9)"
                />
            );
        } // end render
} // end class MinMarker

/***********************************************************************************
 * class MaxMarker
 ***********************************************************************************/
class MaxMarker extends React.Component {

    render() {
        // if(this.props.showMinValue)
            return (
                <polygon
                    className="min-max-markers max-mark"
                    display=""
                    points="0,2 4,2 4,2 2,4"
                    transform="rotate(300, 18, 18) translate(16 -2) scale(0.9)"
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
                {/*
                <ComponentButton
                    display=""
                    title="Reset"
                />
                */}
            </React.Fragment>
            );
        } // end render
} // end class MinMaxMarkers

/***********************************************************************************
 * class NumericBackground
 ***********************************************************************************/
class NumericBackground extends React.Component{

    render(){
        return (
            <rect
                className="numeric-background"
                x="31%"
                y="73%"
                height="6"
                width="38%"
                fill={this.props.color}
            />
        );
    } // end function render
}; // end class NumericBackground

/***********************************************************************************
 * class TickMarks
 * A set of major and minor tick marks; and the text for the major tick marks
 ***********************************************************************************/
class TickMarks extends React.Component{

    render(){
        let majorDivisionAngle = Gauge.ANGLE_RANGE/this.props.metadata.majorDivisions;
        let minorDivisionAngle = majorDivisionAngle/this.props.metadata.minorDivisions;
        let majorTextValues  = [];
        let majorAngles = [];
        let minorAngles = [];
        let nextAngle = 0;
        let x;
        let y;
        let key = 0;

        for (let i=0;i<this.props.metadata.majorDivisions;i++)
        {
            majorAngles.push("rotate( "+(Gauge.START_ANGLE+nextAngle)+", 18, 18 )");

            x = 18+Gauge.TEXT_RADIUS*Math.cos((Gauge.START_ANGLE+nextAngle)*Math.PI/180);
            y = 18+Gauge.TEXT_RADIUS*Math.sin((Gauge.START_ANGLE+nextAngle)*Math.PI/180);

            let tickValue = this.props.metadata.max
                            + (this.props.metadata.max-this.props.metadata.min)
                            * nextAngle/Gauge.ANGLE_RANGE;
            majorTextValues.push( {x:x, y:y, tickValue:tickValue } );
            for (let j=1;j<this.props.metadata.minorDivisions;j++)
            {
                nextAngle -= minorDivisionAngle;
                minorAngles.push("rotate( "+(Gauge.START_ANGLE+nextAngle)+", 18, 18 )");
            }
            nextAngle -= minorDivisionAngle;
        }
        majorAngles.push("rotate( "+Gauge.END_ANGLE+", 18, 18 )");

        x = 18+Gauge.TEXT_RADIUS*Math.cos((Gauge.END_ANGLE)*Math.PI/180);
        y = 18+Gauge.TEXT_RADIUS*Math.sin((Gauge.END_ANGLE)*Math.PI/180);

        majorTextValues.push( {x:x, y:y, tickValue:this.props.metadata.min } );

        let majorTexts = majorTextValues.map(
            function(details) {
                return (
                    <MajorTickText
                        x={details.x}
                        y={details.y}
                        tickValue={details.tickValue}
                        key={key++}
                    />
                )
            }
        )

        let majorTicks = majorAngles.map(
            function(transform) {
                return (
                    <MajorTickMark
                        transform={transform}
                        key={key++}
                    />
                )
            }
        )

        let minorTicks = minorAngles.map(
            function(transform) {
                return (
                    <MinorTickMark
                        transform={transform}
                        key={key++}
                    />
                )
            }
        );

        return (
            <React.Fragment>
                {majorTexts}
                {majorTicks}
                {minorTicks}
            </React.Fragment>
         );
    } // end function render
}; // end class TickMarks

/*************************************************************************************************
 * class MajorTickText
 *************************************************************************************************/
class MajorTickText extends React.Component {

    render() {
        return (
            <text
                className="major-tick-text gauge"
                x={this.props.x}
                y={this.props.y}
            >
                {this.props.tickValue}
            </text>
        );
    } // end function render
}; // end class MajorTickMark

/*************************************************************************************************
 * class Ranges
 * This is the set of color bands that show the ranges on Gauge's' surface
 *************************************************************************************************/
class Ranges extends React.Component{

    render() {
        let key = 0;

        if ( !this.props.metadata.ranges ) {
            return "";
        }
        let dataRange = this.props.metadata.max-this.props.metadata.min;
        let maxLimit  = this.props.metadata.max;
        let rangeMaps = this.props.metadata.ranges.map(
            function(details) {
                let minAngle = Gauge.START_ANGLE-Gauge.ANGLE_RANGE/dataRange*(maxLimit-details.min);
                let maxAngle = Gauge.START_ANGLE-Gauge.ANGLE_RANGE/dataRange*(maxLimit-details.max);

                if ( minAngle < Gauge.END_ANGLE )
                    minAngle = Gauge.END_ANGLE;

                if ( maxAngle > Gauge.START_ANGLE )
                    maxAngle = Gauge.START_ANGLE;

                return (
                    <Range
                        min={minAngle}
                        max={maxAngle}
                        color={details.color}
                        key={key++}
                    />
                );
            })

        return (
            <React.Fragment>
                {rangeMaps}
            </React.Fragment>
        );
    } // end function render
}; // end class Ranges

/*************************************************************************************************
 * class Range
 * A colored circular arc drawn on the Gauge at a radius of 18 from the center.
 *************************************************************************************************/
class Range extends React.Component{

    render(){
        let angle = this.props.min;
        let path = "M"+this.GetXY(angle);

        while ( angle < this.props.max ) {
            angle += 2;
            path += " L"+this.GetXY(angle);
        }
        path += " L"+this.GetXY(this.props.max);

        return (
            <g
                className="range"
                display=""
                fill="transparent"
                stroke={this.props.color}
                strokeWidth={Gauge.COLOR_BAND_THICKNESS}
            >
                <path d={path} />
            </g>
        );
    } // end function render

    GetXY(angle) {
        let x = 18+Gauge.COLOR_BAND_RADIUS*Math.cos(angle*Math.PI/180);
        let y = 18+Gauge.COLOR_BAND_RADIUS*Math.sin(angle*Math.PI/180);

        return x + " " + y;
    }
}; // end class Range

/*************************************************************************************************
 * class CarlingLabel
 *************************************************************************************************/
class CarlingLabel extends React.Component {

    render() {
        // console.log("label's height? " + this.props.height)

        // if ( this.props.height > 90 ) {
            return (
                <text
                    className="carling-label gauge"
                    display=""
                    x="50%"
                    y="35%"
                >
                    <tspan>Carling Technologies</tspan>
                </text> );
    } // end function render
}; // end class CarlingLabel

/*************************************************************************************************/

export default Gauge;

// eof

