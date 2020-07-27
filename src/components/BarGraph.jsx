// File: src/components/BarGraph.jsx
// Note: BarGraph Component Template
// Date: 03/12/2020
//..................................................................................................
import React from 'react';

import ComponentBase from './ComponentBase';
import ComponentButton from './ComponentButton';
import Format from './Format';
import { MajorTickMarkHorizontal } from './MajorTickMark';
import { MinorTickMarkHorizontal } from './MinorTickMark';

console.log( "Mounting BarGraph.jsx... <BarGraph />" );

/*************************************************************************************************
 * class BarGraph
 *************************************************************************************************/
class BarGraph extends ComponentBase {
    // measurements based on unit length in percentage or decimal fractions
    static BAR_WIDTH    = 20;
    static BAR_HEIGHT   = 40; 
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"bar-graph"}`;
    } // end constructor
    
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render(){
        this.mLastValue = this.props.value;

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
                        className="component-outline bar-graph"
                        display=""
                        x="28%"
                        y="5%"
                        rx="1%"
                        ry="1%"
                        width="60%"
                        height="72%"
                    />
    
                    <rect
                        className="component-surface bar-graph"
                        display=""
                        x="30%"
                        y="6%"
                        width="56%"
                        height="70%"
                    />
    
                    <rect
                        className="component-filter bar-graph"
                        display=""
                        x="23%"
                        y="11%"
                        width="58%"
                        height="68%"
                    />
                </g>
                            
                [/* viewport reserved for vertically aligned text element */]
                <text
                    className="title bar-graph"
                    display=""
                    x="15%"
                    y="50%"
                 >
                    {this.props.metadata.title}
                </text>
                
                {/* viewport: svg-main-content */}
                <svg
                    display=""
                    x="1%"
                    y="1%"
                    width="98%"
                    height="68%"
                    viewBox="0 0 20 40"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <CarlingLabel {...this.props}/>
                    <TickMarks {...this.props}/> 
                    <MinMaxMarkers {...this.props} value={this.props.data.value}/>
                    <ProgressBar {...this.props} />
                </svg>
                
                <text
                    className="units bar-graph"
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
                    viewBox="0 0 20 40"
                />
            </svg>

        );
    } // end function render
} // end class BarGraph

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
                    className="carling-label bar-graph"
                    display=""
                    x="15%"
                    y="50%"
                >
                    <tspan>Carling Technologies</tspan>
                </text> );
        // } else {
            // return null;
        // }            
    } // end function render
}; // end class CarlingLabel

/*************************************************************************************************
 * class ProgressBar
 * A Progress Bar is a colored rectanglar shape on the BarGraph component.
 *************************************************************************************************/
class ProgressBar extends React.Component {
    
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
        
        //___ bar-graph progress value related to negative y-up scheme progression ___
        let value = (BarGraph.BAR_HEIGHT
                        *(this.props.data.value-this.props.metadata.min)
                        /(this.props.metadata.max-this.props.metadata.min));
                                               
        if ( isNaN(value) ) {
            value = BarGraph.BAR_HEIGHT;
        }

        if ( value > BarGraph.BAR_HEIGHT ) {
            value = 0;
        }         
        
        if ( value < 0 ) {
            value = BarGraph.BAR_HEIGHT;
        }
                
        return (
            <rect
                display=""
                x="40%"
                y={50-value}
                width="30%"
                height={value}
                fill={color}
            />
        )
    } // end function render

} // end class ProgressBar

/***********************************************************************************
 * class TickMarks
 * Place a set of major and minor tick marks and the text for the major tick marks
 ***********************************************************************************/
class TickMarks extends React.Component{
    render(){
        let majorTextValues = [];
        let majorMarks = [];
        let minorMarks = [];
        let majorMarkOffset = 0;
        let minorMarkOffset = 0;
        let step = 0;
        let x = 0;
        let y = 0;
        let key = 0;
        
        const { min, max, minorDivisions, majorDivisions, format } = this.props.metadata;
        const value = (max-min)/minorDivisions;
       
        for (let i=0; i<majorDivisions; i++) 
        {
            majorMarkOffset = BarGraph.BAR_WIDTH * 0.4;
            minorMarkOffset = BarGraph.BAR_WIDTH * 0.1;
            
            x = BarGraph.BAR_WIDTH - 2.5;
            y = BarGraph.BAR_HEIGHT ;
            
            majorTextValues.push( { x:x, y:y-(step+i)*majorMarkOffset, value:min+value*(step+i) } );
            majorMarks.push( { x:x, y:y-(step+i)*majorMarkOffset } );
            for (let j=1;j<=minorDivisions*4;j++)
            {
                minorMarks.push( { x:x, y:y-(step+j)*minorMarkOffset } );
            }
        } 
        
        // ___ map majorDivisions to major text values ___ 
        const majorTexts = majorTextValues.map(
            
            function(details) {
                return (
                    <MajorTickText
                        x={details.x}
                        y={details.y}
                        value={Number.isInteger(details.value) ? Format(format, details.value) : details.value}
                        key={key++}
                    />
                )
            })
        
        //___ map majorDivisions to major tick values___
        const majorTicks = majorMarks.map(
            function(details) {
                return (
                    <MajorTickMarkHorizontal
                        x={details.x}
                        y={details.y}
                        key={key++}
                    />
                )
            })

        // ___ map minorDivisions to minor tick values ___
        const minorTicks = minorMarks.map(
            function(details) {
                return (
                    <MinorTickMarkHorizontal
                        x={details.x}
                        y={details.y}
                        key={key++}
                    />
                )
            })
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
class MajorTickText extends React.Component{
    // ___ Typographic Commponent ___
    render() {
        return (
            <text
                className="major-tick-text"
                display=""
                x={this.props.x}
                y={this.props.y}
            >
                {this.props.value}
            </text>
        );
    } // end function render
}; // end class MajorTickMark


/*********************************************************************************************/

export default BarGraph;

// eof
