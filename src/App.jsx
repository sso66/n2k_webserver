// File: src/App.jsx
// Note: Main entry for N2KView Marine Digital Dashboard UI
// Date: 04/20/2020
//..................................................................................................
import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import ACBreakerDetailsDialog from './dialogs/ACBreakerDetailsDialog';
import DCBreakerDetailsDialog from './dialogs/DCBreakerDetailsDialog';
import SettingsDialog from './dialogs/SettingsDialog';

import ComponentRenderer from './components/ComponentRenderer';

import { MessageTypes } from './common/MessageTypes';
import { Modes } from './Modes';

import ILinearGradient from './components/gradients/ILinearGradient';
import IRadialGradient from './components/gradients/IRadialGradient';
import IPattern from './components/patterns/IPattern';
import ColorMatrixFilter from './components/filters/ColorMatrixFilter';

import './App.sass';

console.log( "Mounting App.jsx... <App />" );

const client = new W3CWebSocket('ws://'+window.location.hostname+':8000');

/*************************************************************************************************
 * class App
 *************************************************************************************************/
class App extends React.Component {

    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.state = {
            components : [],
            mode : Modes.DISPLAY,
            configurationNames : [],

        };
    } // end constructor


    /*********************************************************************************************
     * function OnKeyPress
     *********************************************************************************************/
    OnKeyPress = (event) => {
        console.log( event.key + " was pressed.");
        if ( event.key === "ArrowRight" )
        {
            this.state.client.send(JSON.stringify({
                type:MessageTypes.SCREEN_SELECT,
                direction:"next"
            }));
        }
        else if ( event.key === "ArrowLeft" )
        {
            this.state.client.send(JSON.stringify({
                type:MessageTypes.SCREEN_SELECT,
                direction:"prev"
            }));
        }
    } // end function OnKeyPress

    /*********************************************************************************************
     * function componentDidMount
     *********************************************************************************************/
    componentDidMount() {
        client.onerror = (err) => {
            console.log( "Connection Error" + err.message )
        }// end function onerror
        
        // console.log( "--> componentDidMount, client = " + JSON.stringify(client) );
        client.onopen = () => {
            // ___ PLEASE DO NOT REMOVE THIS FOLLOWING LOGGING CODE ___
            // console.log(
               // "Websocket Properties & Methods:"
               // + "\n1. Buffered Amount: " + client.bufferedAmount
               // + "\n2. Extensions: " + client.extensions
               // + "\n3. Protocol: " + client.prototol
               // + "\n4. Ready State: " + client.readyState
               // + "\n5. Absolute URL: " + client.url
            // );
            if (client.readyState === client.OPEN) {
                console.log( "WebSocket client " + client.url + " connected to N2K Webserver..." );
            }  
        } // end function onopen
           
        client.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);

            // We will try to keep the mode from the previous screen, but if the new screen cannot
            // support it, we default back to the DISPLAY mode
            var updatedMode = this.state.mode;
            if ( updatedMode === Modes.SET_SWITCH && !dataFromServer.hasLockableBreakers )
                updatedMode = Modes.DISPLAY;
            else if ( updatedMode === Modes.AC_BREAKER_DETAILS_DETAILS && !dataFromServer.hasBreakerDetails )
                updatedMode = Modes.DISPLAY;
            else if ( updatedMode === Modes.DC_BREAKER_DETAILS_DETAILS && !dataFromServer.hasBreakerDetails )
                updatedMode = Modes.DISPLAY;

            let v; // loop variables

            switch ( dataFromServer.type )
            {
                case MessageTypes.BREAKER_DETAILS :
                    console.log( JSON.stringify(dataFromServer));
                    this.setState( {
                        breakerDetails : dataFromServer
                        }
                    );
                    break;

                case MessageTypes.CONFIGURATION_NAMES :
                    console.log(message.data);
                    this.setState( {
                        configurationNames : dataFromServer.configurationNames
                        }
                    );
                    break;

                case MessageTypes.SCREEN_LAYOUT:
                    console.log( "--> App received SCREEN_LAYOUT, name = '" + dataFromServer.configurationName+ "'" );
                    let newControls = [];
                    dataFromServer.controls.forEach( control =>
                        newControls.push( {
                            metadata : control,
                            data     : { value : "-", units : control.units }
                        }));
                    // this line seems to be required to prevent previous components from being
                    // reused - showing some old controls on the new screen.
                    this.setState( { components : [] } );
                    this.setState( {
                        client : client,
                        width : dataFromServer.width,
                        height : dataFromServer.height,
                        configurationName : dataFromServer.configurationName,
                        backgroundColor : dataFromServer.backgroundColor,
                        backgroundImage : dataFromServer.backgroundImage,
                        hasLockableBreakers : dataFromServer.hasLockableBreakers,
                        hasBreakerDetails : dataFromServer.hasBreakerDetails,
                        mode : updatedMode,
                        components : newControls
                        }
                    );
                    break;
                case MessageTypes.VALUES:
                    //console.log(message.data);
                    let components = this.state.components;
                    for ( let c=0; c<components.length; c++ )
                    {
                        components[c].value = "-";
                        if ( dataFromServer.updates )
                        {
                            for ( v=0; v<dataFromServer.updates.length; v++ )
                            {
                                if ( c === dataFromServer.updates[v].index )
                                {
                                    components[c].data = dataFromServer.updates[v].data;
                                    break;
                                }
                            } // end inner loop
                        }
                    } // end outer loop

                    this.setState( { components : components } );

                    break;

                default :
                    console.log( "Received unknown message from server:" );
                    console.log( message.data );
            }
        } // end function onmessage
        
    } // end function componentDidMount

    /*********************************************************************************************
     * function ToggleModal
     *********************************************************************************************/
    ToggleModal = () => {
        console.log( "--> App.ToggleModal mode = " + this.state.mode );
        switch ( this.state.mode )
        {
            case Modes.AC_BREAKER_DETAILS :
                this.RequestACBreakerDetails( null, null );
                break;

            case Modes.DC_BREAKER_DETAILS :
                this.RequestDCBreakerDetails( null, null );
                break;

            case Modes.SETTINGS :
                this.setState( { mode : Modes.DISPLAY } );
                break;

            default :
                this.setState( { mode : Modes.SETTINGS } );
                break;
        }
        console.log( "<-- App.ToggleModal mode = " + this.state.mode );
    } // end function ToggleModal
    
    /*********************************************************************************************
     * function ToggleKeyCursor
     *********************************************************************************************/
    ToggleKeyCursor = () => {
        if ( this.state.mode === Modes.SET_LOCK )
            this.setState( { mode : Modes.DISPLAY } );
        else
            this.setState( { mode : Modes.SET_LOCK } );
    } // end function ToggleKeyCursor

    /*********************************************************************************************
     * function ToggleDetailCursor
     *********************************************************************************************/
    ToggleDetailsCursor = () => {
        console.log( "--> App.ToggleDetailsCursor" );
        switch ( this.state.mode )
        {
            case Modes.AC_BREAKER_DETAILS :
                console.log( "    Setting mode to DISPLAY - 1" );
                this.RequestBreakerDetails( null, null );
                break;

            case Modes.CHOOSE_BREAKER_FOR_DETAILS :
                console.log( "    Setting mode to DISPLAY - 2" );
                this.setState( { mode : Modes.DISPLAY } );
                break;

            case Modes.DC_BREAKER_DETAILS :
                console.log( "    Setting mode to DISPLAY - 1" );
                this.RequestBreakerDetails( null, null );
                break;

            default :
                console.log( "    Setting mode to CHOOSE_BREAKER_FOR_DETAILS" );
                this.setState( { mode : Modes.CHOOSE_BREAKER_FOR_DETAILS } );
                break;
        }
        console.log( "<-- App.ToggleDetailsCursor" );
    } // end function ToggleDetailsCursor

    /*********************************************************************************************
     * function RequestACBreakerDetails
     * This will send a message to the server to request the breaker details for the selected
     * breaker.
     *********************************************************************************************/
    RequestACBreakerDetails = ( instance, channel ) => {
        console.log( "--> App.RequestACBreakerDetails instance = " + instance + ", channel = " + channel );
        if ( instance === null || channel === null )
        {
            this.setState( { mode : Modes.DISPLAY } );
            // Send the request with no instance or channel to stop the server from making the
            // requests
            client.send(JSON.stringify({
                type:MessageTypes.BREAKER_DETAILS_REQUEST
            }));
        }
        else
        {
            this.setState( { mode : Modes.AC_BREAKER_DETAILS } );
            client.send(JSON.stringify({
                type:MessageTypes.BREAKER_DETAILS_REQUEST,
                instance: instance,
                channel: channel
            }));
        }
        console.log( "<-- App.RequestACBreakerDetails" );
    } // end function RequestACBreakerDetails

    /*********************************************************************************************
     * function RequestDCBreakerDetails
     * This will send a message to the server to request the breaker details for the selected
     * breaker.
     *********************************************************************************************/
    RequestDCBreakerDetails = ( instance, channel ) => {
        console.log( "--> App.RequestDCBreakerDetails instance = " + instance + ", channel = " + channel );
        if ( instance === null || channel === null )
        {
            this.setState( { mode : Modes.DISPLAY } );
            // Send the request with no instance or channel to stop the server from making the
            // requests
            client.send(JSON.stringify({
                type:MessageTypes.BREAKER_DETAILS_REQUEST
            }));
        }
        else
        {
            this.setState( { mode : Modes.DC_BREAKER_DETAILS } );
            client.send(JSON.stringify({
                type:MessageTypes.BREAKER_DETAILS_REQUEST,
                instance: instance,
                channel: channel
            }));
        }
        console.log( "<-- App.RequestDCBreakerDetails" );
    } // end function RequestDCBreakerDetails

    /*********************************************************************************************
     * function CommandBreaker
     *********************************************************************************************/
    CommandBreaker = ( instance, channel, action ) => {
        client.send(JSON.stringify({
            type:MessageTypes.SWITCH_PRESS,
            instance: instance,
            channel: channel,
            action : action
        }));
    } // end function CommandBreaker

    /*********************************************************************************************
     * function LockBreaker
     *********************************************************************************************/
    LockBreaker = ( instance, channel ) => {
        client.send(JSON.stringify({
            type:MessageTypes.SWITCH_LOCK,
            instance: instance,
            channel: channel
        }));
    } // end function LockBreaker

    /*********************************************************************************************
     * function UnlockBreaker
     *********************************************************************************************/
    UnlockBreaker = ( instance, channel ) => {
        client.send(JSON.stringify({
            type:MessageTypes.SWITCH_UNLOCK,
            instance: instance,
            channel: channel
        }));
    } // end function UnlockBreaker

    /*********************************************************************************************
     * function SelectScreen
     *********************************************************************************************/
    SelectScreen = ( screenName ) => {
        client.send(JSON.stringify({ // websocket client
            type:MessageTypes.SCREEN_SELECT,
            screenName: screenName
        }));
    } // end function SelectScreen

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        //console.log( "--> App.render mode = " + this.state.mode );
        //console.log( "    breakerDetails = " + JSON.stringify( this.state.breakerDetails ));
        const xZoom = window.innerWidth / this.state.width;
        const yZoom = window.innerHeight / this.state.height;
        var cursorType;
        switch( this.state.mode )
        {
            case Modes.SET_LOCK :
                cursorType = 'url(assets/key25.png),auto';
                break;
            case Modes.CHOOSE_BREAKER_FOR_DETAILS:
                cursorType = 'url(assets/details25.png),auto';
                break;
            default :
                cursorType = 'default';
                break;
        }
        //console.log( "xZoom="+xZoom+", yZoom="+yZoom );
        var zoom, xOffset, yOffset;
        if ( xZoom > yZoom )
        {
            // zooming to fill the screen vertically
            zoom = yZoom;
            xOffset = this.state.width*(zoom-1)/2 + (window.innerWidth-this.state.width*zoom)/2;
            yOffset = this.state.height*(zoom-1)/2;
        }
        else
        {
            // zooming to fill the screen horizontally
            zoom = xZoom;
            xOffset = this.state.width*(zoom-1)/2;
            yOffset = this.state.height*(zoom-1)/2 + (window.innerHeight-this.state.height*zoom)/2;
        }
        var xform = "matrix("+zoom+",0,0,"+zoom+","+xOffset+","+yOffset+")";
        //console.log( "width="+this.state.width+", height="+this.state.height+", xform="+xform );

        const screenStyle = {
            width: this.state.width,
            height: this.state.height,
            cursor: cursorType,
            transform: xform
        };

        const backgroundStyle = {
            width: this.state.width,
            height: this.state.height,
        };

        if ( this.state.backgroundImage !== undefined )
        {
            backgroundStyle.backgroundImage = `url("/`+this.state.configurationName+`/`+this.state.backgroundImage+`")`;
            backgroundStyle.backgroundPosition = 'center';
            backgroundStyle.backgroundSize = 'cover';
            backgroundStyle.backgroundRepeat = 'no-repeat';
        }
        else if ( this.state.backgroundColor !== undefined )
        {
            backgroundStyle.backgroundColor = this.state.backgroundColor;
        }

        //console.log( "<-- App.render" );
        return (
            <React.Fragment>
                <div
                    // className="screen-style" // reserved for media queries
                    style={screenStyle}
                    onKeyDown={this.OnKeyPress}
                    tabIndex="0"
                >
                    <div style={backgroundStyle} />

                    {this.state.components.map((c, component) => (
                        <ComponentRenderer
                            metadata={c.metadata}
                            client={client}
                            data={c.data}
                            key={component}
                            app={this}
                        />
                    ))}

                    <ACBreakerDetailsDialog
                        client={client}
                        breakerDetails={this.state.breakerDetails}
                        OnClose={this.ToggleModal}
                        show={this.state.mode === Modes.AC_BREAKER_DETAILS }
                    />
                    <DCBreakerDetailsDialog
                        client={client}
                        breakerDetails={this.state.breakerDetails}
                        OnClose={this.ToggleModal}
                        show={this.state.mode === Modes.DC_BREAKER_DETAILS }
                    />
                    <SettingsDialog
                        client={client}
                        names={this.state.configurationNames}
                        name={this.state.configurationName}
                        OnClose={this.ToggleModal}
                        show={this.state.mode === Modes.SETTINGS }
                    />
                    <input
                        className="toggle-button"
                        id="settings-button"
                        onClick={event =>{this.ToggleModal();}}
                    >
                    </input>
                    <LockButton visible = {this.state.hasLockableBreakers} clickFunction = {this.ToggleKeyCursor} />
                    <DetailsButton visible = {this.state.hasBreakerDetails} clickFunction = {this.ToggleDetailsCursor} />
                </div>

                {/* SVG paint server API declaration */}
                <ILinearGradient />
                <IRadialGradient />
                <IPattern />
                <ColorMatrixFilter />
            </React.Fragment>
        );
    } // end render

    /*********************************************************************************************/
} // end class App

/*************************************************************************************************
 * class LockButton
 *************************************************************************************************/
class LockButton extends React.Component {

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
    if ( this.props.visible )
        return (
            <input
                className="toggle-button"
                id="key-button"
                onClick={event =>{this.props.clickFunction();}}
            />
        );
    else
        return null;
    } // end render

    /*********************************************************************************************/
} // end class LockButton

/*************************************************************************************************
 * class DetailsButton
 *************************************************************************************************/
class DetailsButton extends React.Component {

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
    if ( this.props.visible )
        return (
            <input
                className="toggle-button"
                id="details-button"
                onClick={event =>{this.props.clickFunction();}}
            />
        );
    else
        return null;
    } // end render

    /*********************************************************************************************/

} // end class DetailsButton

/*************************************************************************************************/

export default App;

// eof
