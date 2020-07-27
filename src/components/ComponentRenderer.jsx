// File: src/components/ComponentRenderer.jsx
// Note: List of available N2KView component types with specific viewport dimensions
// Date: 02/11/2020
//..................................................................................................
import React from 'react';

import { Controls } from "../common/Controls";

import ActiveButton from './ActiveButton';
import BarGraph from './BarGraph'
import Clock from './Clock';
import Digital from './Digital';
import DigitalInvisible from './DigitalInvisible';
import Gauge from './Gauge';
import HRSwitch from './HRSwitch';
import Indicator from './Indicator';
import PushButtonColored from './PushButtonColored';
import Tank from './Tank';
import Text from './Text';


console.log( "Mounting ComponentRenderer.jsx... <ComponentRenderer />" );

/*************************************************************************************************
 * class ComponentRenderer
 *************************************************************************************************/

class ComponentRenderer extends React.Component {
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        //console.log( "ComponentRenderer props = " + JSON.stringify( this.props ));
        switch ( this.props.metadata.control )
        {
            case Controls.ACTIVE_BUTTON2x1 :
                return (
                   <ActiveButton
                        metadata={this.props.metadata}
                        value={this.props.value}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={50}
                    />
                 );
            case Controls.ACTIVE_BUTTON4x1 :
                return (
                   <ActiveButton
                        metadata={this.props.metadata}
                        value={this.props.value}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={25}
                    />
                 );
            case Controls.BAR_GRAPH :
                return (
                   <BarGraph
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={50}
                        height={100}
                    />
                 );
            case Controls.CLOCK:
                return (
                   <Clock
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={100}
                    />
                 );
            case Controls.DIGITAL1x1 :
                return (
                   <Digital
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={100}
                    />
                 );
            case Controls.DIGITAL2x1 :
                return (
                   <Digital
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={50}
                    />
                 );
            case Controls.DIGITAL2x1INVISIBLE :
                return (
                   <DigitalInvisible
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={50}
                    />
                 );
            case Controls.GAUGE :
                return (
                   <Gauge
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={100}
                    />
                 );
            case Controls.HR_SWITCH:
            case Controls.MOMENTARY_HR_SWITCH:
                return (
                   <HRSwitch
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={200}
                />
                 );
            case Controls.INDICATOR1x1 :
                return (
                   <Indicator
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={100}
                    />
                 );
            case Controls.INDICATOR2x1 :
                return (
                   <Indicator
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={50}
                    />
                 );
            case Controls.INDICATOR4x1 :
                return (
                   <Indicator
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={25}
                    />
                 );
            case Controls.PUSH_BUTTON1x1 :
            case Controls.MOMENTARY_PUSH_BUTTON1x1 :
                return (
                   <PushButtonColored
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={100}
                    />
                 );
            case Controls.PUSH_BUTTON2x1 :
            case Controls.MOMENTARY_PUSH_BUTTON2x1 :
                return (
                    <PushButtonColored
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={50}
                    />
                 );
            case Controls.TANK :
                return (
                   <Tank
                        metadata={this.props.metadata}
                        data={this.props.data}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={200}
                />
                 );
            case Controls.TEXT1x1 :
                return (
                   <Text
                        metadata={this.props.metadata}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={100}
                />
                 );
            case Controls.TEXT2x1 :
                return (
                   <Text
                        metadata={this.props.metadata}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={50}
                    />
                 );
            case Controls.TEXT4x1 :
                return (
                   <Text
                        metadata={this.props.metadata}
                        app={this.props.app}
                        mode={this.props.app.state.mode}
                        width={100}
                        height={25}
                    />
                 );
            default :
                console.log( "Unable to find control " + this.props.metadata.control );
                return ( <p>Unknown control {this.props.metadata.control}</p> );
        }; // end switch
    } // end function render

    /*********************************************************************************************/

} // end class ComponentRenderer

/*************************************************************************************************/

export default ComponentRenderer

// eof
