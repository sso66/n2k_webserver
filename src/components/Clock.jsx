// File: src/components/Clock.jsx
// Note: Clock Component Template
// Date: 30/12/2020
//..................................................................................................
import React from 'react';

import ComponentBase from './ComponentBase';
import { MajorTickMark } from './MajorTickMark';
import { MinorTickMark } from './MinorTickMark';

console.log( "Mounting Clock.jsx... <Clock />" );

/*************************************************************************************************
 * class Clock
 *************************************************************************************************/
class Clock extends ComponentBase {
    static TEXT_RADIUS = 11; // pixels from center to tick text
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"clock"}`;
    } // end constructor

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render(){
		this.mLastValue = this.props.data.value;
        // console.log( "value = " + JSON.stringify( this.props.value.value ));

        return (
            <svg
                viewBox={this.mViewBox}
                style={this.mStyles}
                className={this.className}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <circle
                    className="component-outline clock"
                    cx="50%"
                    cy="50%"
                    r="37%"
                />

                <circle
                    className="component-surface clock"
                    display=""
                    cx="50%"
                    cy="50%"
                    r="36%"
                />

                <circle
                    className="component-filter clock"
                    display=""
                    cx="50%"
                    cy="50%"
                    r="35%"
                />

                <text
                    className="title"
                    display=""
                    x="50%"
                    y="10px"
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
                    <TickMarks {...this.props}/>

                    {/* Clock Hands go above the text */}
                    <HourHand {...this.props} milliseconds={this.props.data.value}/>
                    <MinuteHand {...this.props} milliseconds={this.props.data.value}/>

                    <circle
                        className="needle-base"
                        display=""
                        cx={18}
                        cy={18}
                        r={1.591549430918954}
                     />
                     <SecondHand {...this.props} milliseconds={this.props.data.value}/>
                </svg>

                <text
                    className="units"
                    display=""
                    x="95%"
                    y="90%"
                >
                    {this.props.data.units}
                </text>
            </svg>
        );
    } // end function render
} // end class Clock

/***********************************************************************************
 * class HourHand
 ***********************************************************************************/
class HourHand extends React.Component {

    render(){
		if ( isNaN(this.props.milliseconds) ) {
            return "";
        }

        let date = new Date(this.props.milliseconds);
        let hours = date.getUTCHours() + date.getUTCMinutes() / 60;

		if ( hours > 12 ) {
			hours -= 12;
		}
        let rotation = hours*30;
        const transform = "rotate( "+rotation+", 18, 18 )";

        return (
            <g transform={transform}>
                <line
                    className="clock hour-hand"
                    x1={18}
                    y1={18}
                    x2={18}
                    y2={8}
                />
            </g>
        );
    } // end function render
} // end class HourHand

/***********************************************************************************
 * class MinuteHand
 ***********************************************************************************/
class MinuteHand extends React.Component {

    render(){
		if ( isNaN(this.props.milliseconds) ) {
            return "";
        }

        let date = new Date(this.props.milliseconds);
        let minutes = date.getUTCMinutes()+date.getUTCSeconds()/60;
        let rotation = minutes*6;
        const transform = "rotate( "+rotation+", 18, 18 )";

        return (
                <g transform={transform}>
                    <line
                        className="clock minute-hand"
                        x1={18}
                        y1={18}
                        x2={18}
                        y2={3}
                    />
                </g>
            );
        } // end function render
} // end class MinuteHand

/***********************************************************************************
 * class SecondHand
 ***********************************************************************************/
class SecondHand extends React.Component {

    render() {
		if ( isNaN(this.props.milliseconds) ) {
            return "";
        }

        let date = new Date(this.props.milliseconds);
        let seconds = Math.round(date.getUTCSeconds());
        let rotation = seconds*6;
        const transform = "rotate( "+rotation+", 18, 18 )";

        return (
            <g transform={transform}>
                <line
                    className="needle"
                    display=""
                    x1={18}
                    y1={21}
                    x2={18}
                    y2={1}
                />
            </g>
            );
        } // end function render
} // end class SecondHand

/***********************************************************************************
 * class TickMarks
 * A set of major and minor tick marks and the text for the major tick marks
 ***********************************************************************************/
class TickMarks extends React.Component{

    render() {
        let minorDivisionAngle = 6; // degrees
        let majorTextValues  = [];
        let majorAngles = [];
        let minorAngles = [];
        let nextAngle = 0;
        let x;
        let y;
        let key = 0;

        for ( let i = 0; i < 12; i++ ) {
            majorAngles.push("rotate( "+nextAngle+", 18, 18 )");

            x = 18 + Clock.TEXT_RADIUS*Math.cos( nextAngle*Math.PI/180);
            y = 18 + Clock.TEXT_RADIUS*Math.sin( nextAngle*Math.PI/180);

			if ( i===0 ) {
				majorTextValues.push( { x:x, y:y, value:"3"} );
            }
			else if ( i===3 ) {
				majorTextValues.push( { x:x, y:y, value:"12" } );
            }
			else if ( i===6 ) {
				majorTextValues.push( { x:x, y:y, value:"9" } );
            }
			else if ( i===9 ) {
				majorTextValues.push( { x:x, y:y, value:"6" } );
            }

            for ( let j = 1; j <5; j++ ) {
                nextAngle -= minorDivisionAngle;
                minorAngles.push("rotate( "+nextAngle+", 18, 18 )");
            }
            nextAngle -= minorDivisionAngle;
        }

        const majorTexts = majorTextValues.map(
            function(details) {
                return (
                    <MajorTickText
                        x={details.x}
                        y={details.y+1}
                        value={details.value}
                        key={key++}
                    />
                )
            })

        const majorTicks = majorAngles.map(
            function(transform) {
                return (
                    <MajorTickMark
                        transform={transform}
                        key={key++}
                    />
                )
            })

        const minorTicks = minorAngles.map(
            function(transform) {
                return (
                    <MinorTickMark
                        transform={transform}
                        key={key++}
                    />
                )
            })
        return (
            <React.Fragment>
                {majorTexts}
                {majorTicks}
                {minorTicks}
            </React.Fragment>);
    } // end function render
}; // end class TickMarks

/*************************************************************************************************
 * class MajorTickText
 *************************************************************************************************/
class MajorTickText extends React.Component{

    render() {
        return (
            <text
                className="major-tick-text clock"
                x={this.props.x}
                y={this.props.y}>
                    {this.props.value}
            </text>
        );
    } // end function render
}; // end class MajorTickMark

/*************************************************************************************************
 * class CarlingLabel
 *************************************************************************************************/
class CarlingLabel extends React.Component {
    render() {
        if ( this.props.height > 90 )
            return (
                <text
                    className="carling-label clock"
                    display=""
                    x="50%"
                    y="35%"
                >
                    <tspan>Carling Technologies</tspan>
                </text> );
        else
            return null;
    } // end function render
}; // end class CarlingLabel

/*************************************************************************************************/

export default Clock;

// eof
