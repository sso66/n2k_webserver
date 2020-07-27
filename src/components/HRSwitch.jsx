// File: src/components/HWSwitch.js
// Note: HR-Series Rocker Switch Component Template
// Date: 01/23/2020
//..................................................................................................
import React from 'react';

import { Modes } from '../Modes';
import { ParameterNames } from '../common/Parameters';
import BreakerDecoration from './BreakerDecoration';
import ComponentBase from './ComponentBase';
import MultiLineText from './MultiLineText';

import * as Controls from '../common/Controls';
import { SwitchActions } from '../common/SwitchActions';

const MARGIN = 1; //pixels
const LINE_OFFSET_X = 15; //pixels
const LINE_OFFSET_Y = 25; //pixels
const LINE_WIDTH  = 5; //pixels
const ROCKER_OFFSET_X = LINE_OFFSET_X+5; //pixels
const ROCKER_OFFSET_Y = LINE_OFFSET_Y+5; //pixels

console.log( "Mounting HRSwitch.jsx... <HRSwitch />" );

/*************************************************************************************************
 * class HRSwitch
 *************************************************************************************************/
class HRSwitch extends ComponentBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"hr-switch"}`;
        this.title = "";
        this.color = 0xFFF;
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
     * function GetCursorType
     *********************************************************************************************/
    GetCursorType() {
        //console.log( "--> PushButtonBase.GetCursorType parameter = " + this.props.metadata.parameter );
        if ( this.props.metadata.parameter !== ParameterNames.SWITCH_GROUP )
        {
            switch( this.props.app.state.mode )
            {
                case Modes.SET_LOCK :
                    return 'url(assets/key25.png),auto';
                case Modes.CHOOSE_BREAKER_FOR_DETAILS:
                    return 'url(assets/details25.png),auto';
                default :
                    return 'pointer';
            } // end switch
        }
        return 'pointer';
    } // end function GetCursorType

    /*********************************************************************************************
     * function OnMouseDown
     *********************************************************************************************/
    OnMouseDown =(event)=> {
        console.log( "--> HRSwitch OnMouseDown,  mode = " + this.props.app.state.mode );
        if ( this.props.app.state.mode === Modes.CHOOSE_BREAKER_FOR_DETAILS )
        {
            console.log( "HRSwitch Detail Request " );
            this.props.app.RequestBreakerDetails( this.props.metadata.instance, this.props.metadata.channel );
        }
        else if ( this.props.app.state.mode === Modes.SET_LOCK )
        {
            console.log( "HRSwitch Lock " + this.props.metadata.control + " Down, value = 0x" + this.props.data.value.toString(16) );
            if ((this.props.data.value&0x0010) === 0x0010)
            {
                // Switch is showing locked; we must unlock it
                this.props.app.UnlockBreaker( this.props.metadata.instance, this.props.metadata.channel );
            }
            else
            {
                // Switch is showing unlocked; we must lock it
                this.props.app.LockBreaker( this.props.metadata.instance, this.props.metadata.channel );
            }
        }
        else if ( this.props.app.state.mode === Modes.DISPLAY )
        {
            // This is a normal button press
            if ( Controls.IsMomentary(this.props.metadata.control ))
            {
                console.log( this.props.metadata.control + " Mouse Down target y = " + event.nativeEvent.offsetY);
                if ( event.nativeEvent.offsetY > 110 )
                {
                    this.props.app.CommandBreaker( this.props.metadata.instance, this.props.metadata.channel, SwitchActions.TURN_ON );
                }        
            }
            else if ( event.nativeEvent.offsetY < 90 )
            {
                console.log( this.props.metadata.control + " Mouse Down target y = " + event.nativeEvent.offsetY);
                this.props.app.CommandBreaker( this.props.metadata.instance, this.props.metadata.channel, SwitchActions.TURN_OFF );
            }
        }
    } // end function OnMouseDown

    /*********************************************************************************************
     * function OnMouseUp
     *********************************************************************************************/
    OnMouseUp=(event)=> {
        if ( Controls.IsMomentary(this.props.metadata.control ))
        {
            //console.log( this.props.metadata.control + " Mouse Up target y = " + event.nativeEvent.offsetY);
            this.props.app.CommandBreaker( this.props.metadata.instance, this.props.metadata.channel, SwitchActions.TURN_OFF );
        }
        else if ( event.nativeEvent.offsetY > 110 )
        {
            //console.log( this.props.metadata.control + "  Mouse Up target y = " + event.nativeEvent.offsetY);
            this.props.app.CommandBreaker( this.props.metadata.instance, this.props.metadata.channel, SwitchActions.TURN_ON );
        }
    } // end function OnMouseUp

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        var color = "";
        var title = "-";
        var titleColor = "#FFF";
        var cursorType = this.GetCursorType();

        var switchStyles = {
            ...this.mStyles ,
            cursor : cursorType
        };

        switch (this.props.data.value&0x03)
        {
            case 0:
                color = this.props.metadata.offColor;
                if ( this.props.metadata.offTitle !== undefined )
                    title = this.props.metadata.offTitle;
                else
                    title = this.props.metadata.title;
                break;
            case 1:
                color = this.props.metadata.onColor;
                if ( this.props.metadata.onTitle !== undefined )
                    title = this.props.metadata.onTitle;
                else
                    title = this.props.metadata.title;
                break;
            case 2:
                color = this.props.metadata.errorColor;
                if ( this.props.metadata.errorTitle !== undefined )
                    title = this.props.metadata.errorTitle;
                else
                    title = this.props.metadata.title;
                break;
            default :
                color = 0xC0C0C0;
                title = this.props.metadata.title;
                titleColor = "#666";
                break;
        }
        //console.log( "value = " + this.props.data.value + ", offColor = " + this.props.metadata.offColor + ", color = " + color );
        this.mLastValue = this.props.data.value;
        const textStyles = { fontSize:13, fontWeight:"bold" };
        return (
            <div onMouseDown={this.OnMouseDown} onMouseUp={this.OnMouseUp}>
                <svg
                    viewBox={this.mViewBox}
                    preserveAspectRatio={this.preserveAspectRatio}
                    style={switchStyles}
                    className={this.className}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    <defs>
                        <linearGradient id="redGrad" gradientTransform="rotate(35)">
                            <stop offset="5%" stopColor="#900000"/>
                            <stop offset="95%" stopColor="#D00000"/>
                        </linearGradient>
                        <linearGradient id="blackGrad" gradientTransform="rotate(35)">
                            <stop offset="5%" stopColor="#000000"/>
                            <stop offset="95%" stopColor="#101010"/>
                        </linearGradient>
                        <linearGradient id="greenGrad" gradientTransform="rotate(35)">
                            <stop offset="5%" stopColor="#009000"/>
                            <stop offset="95%" stopColor="#00D000"/>
                        </linearGradient>
                        <linearGradient id="yellowGrad" gradientTransform="rotate(35)">
                            <stop offset="5%" stopColor="#CC0"/>
                            <stop offset="95%" stopColor="#FF0"/>
                        </linearGradient>
                        <linearGradient id="orangeGrad" gradientTransform="rotate(35)">
                            <stop offset="5%" stopColor="#C60"/>
                            <stop offset="95%" stopColor="#D80"/>
                        </linearGradient>
                        <linearGradient id="blueGrad" gradientTransform="rotate(35)">
                            <stop offset="5%" stopColor="#0000A0"/>
                            <stop offset="95%" stopColor="#0000D0"/>
                        </linearGradient>
                        <linearGradient id="defaultGrad" gradientTransform="rotate(35)">
                            <stop offset="5%" stopColor="#505050"/>
                            <stop offset="95%" stopColor="#C0C0C0"/>
                        </linearGradient>
                    </defs>
                    <filter id="blurMe">
                       <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                    </filter>
                    <rect
                        display=""
                        x={MARGIN}
                        y={MARGIN}
                        width={100-MARGIN*2}
                        height={200-MARGIN*2}
                        rx="5"  ry="5"
                        fill="#222"
                    />
                    {/* line across middle of breaker */}
                    <rect
                        x="20"
                        y="100"
                        height="2"
                        width="60"
                        stroke="none"
                        fill="#888"
                        filter="url(#blurMe)"
                    /> );
                    <ShadingOff {...this.props}/>
                    <ShadingOn {...this.props}/>
                    {/* colored rectangle */}
                    <rect
                        display=""
                        x={LINE_OFFSET_X}
                        y={LINE_OFFSET_Y}
                        width={100-LINE_OFFSET_X*2}
                        height={200-LINE_OFFSET_Y*2}
                        rx="3"  ry="3"
                        stroke={this.GetFill(color)}
                        strokeWidth={LINE_WIDTH}
                        fill="none"
                    />
                    {/* black airgap between rocker and base */}
                    <rect
                        display=""
                        x={ROCKER_OFFSET_X-3}
                        y={ROCKER_OFFSET_Y-3}
                        width={100-ROCKER_OFFSET_X*2+6}
                        height={200-ROCKER_OFFSET_Y*2+6}
                        rx="3"  ry="3"
                        stroke="#000"
                        strokeWidth="2"
                        fill="none"
                    />
                    <MultiLineText
                        fill={titleColor}
                        text={title}
                        centerY={(ROCKER_OFFSET_Y+100)/2}
                        width={100-ROCKER_OFFSET_X*2}
                        styles={textStyles}
                    />
                    <BreakerDecoration {...this.props} color="#FFF"/>
                </svg>
            </div>
        );
    } // end function render
    /*********************************************************************************************/
} // end class HRSwitch

/*************************************************************************************************
 * class ShadingOff
 *************************************************************************************************/
class ShadingOff extends React.Component{
    render(){
        if ((this.props.data.value&0x03) === 0)
        {
            // switch is OFF
            const pts = [ [ROCKER_OFFSET_X,200-ROCKER_OFFSET_Y-10],
                          [100-ROCKER_OFFSET_X-5,200-ROCKER_OFFSET_Y-10],
                          [100-ROCKER_OFFSET_X-2,110],
                          [100-ROCKER_OFFSET_X,110],
                          [100-ROCKER_OFFSET_X,200-ROCKER_OFFSET_Y-5],
                          [ROCKER_OFFSET_X,200-ROCKER_OFFSET_Y-5] ];
            var points = pts[0].join(" ");
            for ( var i=1; i<pts.length; i++ )
                points += ", " + pts[i].join(" ");
            //console.log( "points = " + points );
            return (
                <polygon
                    points={points}
                    stroke="none"
                    fill="#888"
                    fillOpacity="0.7"
                    filter="url(#blurMe)"
                /> );
        }
        else
            return null;
    } // end function render
}; // end class ShadingOff

/*************************************************************************************************
 * class ShadingOn
 *************************************************************************************************/
class ShadingOn extends React.Component{
    render(){
        const pts = [ [ROCKER_OFFSET_X,ROCKER_OFFSET_Y-5],
                      [100-ROCKER_OFFSET_X,ROCKER_OFFSET_Y-5],
                      [100-ROCKER_OFFSET_X,90],
                      [100-ROCKER_OFFSET_X-3,90],
                      [100-ROCKER_OFFSET_X-5,ROCKER_OFFSET_Y+5],
                      [ROCKER_OFFSET_X,ROCKER_OFFSET_Y+5] ];
        var points = pts[0].join(" ");
        for ( var i=1; i<pts.length; i++ )
            points += ", " + pts[i].join(" ");
        //console.log( "points = " + points );
        if ((this.props.data.value&0x03) === 1)
        {
            // switch is ON
            return (
                <polygon
                    points={points}
                    stroke="none"
                    fill="#888"
                    fillOpacity="0.7"
                    filter="url(#blurMe)"
                /> );
        }
        else if (this.props.data.value === 2)
        {
            // switch is TRIPPED
            return (
                <polygon
                    points={points}
                    stroke="none"
                    fill="#800"
                    fillOpacity="0.7"
                    filter="url(#blurMe)"
                /> );
        }
        else
            return null;
    } // end function render
}; // end class ShadingOn

/*************************************************************************************************/

export default HRSwitch;

// eof
