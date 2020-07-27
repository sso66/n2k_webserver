// File: src/dialogs/SettingsDialog.jsx
// Note: Data Configuration Settings Modal Dialog
// Date: 03/17/2020
//..................................................................................................
import React from "react";
// Install Accordion and AccordionItem using "npm i react-light-accordion"???
import Accordion from './Accordion';
import AccordionItem from './AccordionItem';
import { MessageTypes } from '../common/MessageTypes';

import './styles/modal.css';

console.log( "Mounting SettingsDialog.jsx... <SettingsDialog />" );

/*************************************************************************************************
 * class SettingsDialog
 *************************************************************************************************/
class SettingsDialog extends React.Component {

    /*********************************************************************************************
     * function OnClose
     *********************************************************************************************/
    OnClose = (e) => {
        this.props.OnClose(e);
    } // end function OnClose

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        if ( !this.props.show )
        {
            return null;
        }

        //___ mock data ___
        // const DummyContent = () => (
          // <p>
            // Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            // tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            // quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            // consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            // cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
            // non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          // </p>
        // );

        return (
            <div className="modal" id="modal">
                <h2 className="heading">Settings</h2>
                <div className="content">
                    <Accordion atomic={true}>
                        <AccordionItem title="Configuration">
                            <ConfigurationSelector
                                client={this.props.client}
                                names={this.props.names}
                                currentValue={this.props.name}
                                OnClose={this.props.OnClose}
                            />
                        </AccordionItem>
                        {/*
                        <AccordionItem title="Title 2">
                            <DummyContent />
                        </AccordionItem>

                        <AccordionItem title="Title 3">
                            <DummyContent />
                        </AccordionItem>
                        */}
                    </Accordion>
                </div>
                <div className="actions">
                    <button className="action-button" onClick = {this.OnClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    } // end function render

    /*********************************************************************************************/
} // end class SettingsDialog

/*************************************************************************************************
 * class ConfigurationSelector
 * This is a Drop Down List containing the names of the configurations supplied by the server
 * plus a button. Pressing the button will send a request to the server to supply a configuration
 * of the name in the drop down list.
 *************************************************************************************************/
class ConfigurationSelector extends React.Component {

    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.state = { selectValue:this.props.currentValue };
    } // end constructor

    /*********************************************************************************************
     * function OnSettingChange
     *********************************************************************************************/
    OnSettingChange = (e) => {
        this.setState({selectValue:e.target.value});
    } // end function OnSettingChange

    /*********************************************************************************************
     * function RequestConfiguration
     * Called when the button is pressed to request a new configuration from the server.
     *********************************************************************************************/
    RequestConfiguration = (e) => {
        this.props.client.send(JSON.stringify({
            type:MessageTypes.CONFIGURATION_SELECT,
            configurationName : this.state.selectValue
        }));
        this.props.OnClose();
    } // end function RequestConfiguration

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        var labelStyle = {
            marginLeft:"10px",
            marginRight:"10px"
        };

        var dropdownStyle = {
            cursor: "pointer",
        };
        //__ styled according to CSS Box Model ___
        const buttonStyle = {
            width: "60px",
            background: "#78f89f",
            marginTop:"1px",
            marginBottom:"1px",
            marginLeft:"10px",
            marginRight:"10px",
            border: "1px solid #000",
            borderRadius: "5px",
            padding: "0.1rem 0.1rem",
            fontSize: "0.8rem",
            lineHeight: "1",
            cursor: "pointer",
        }

        return (
            <div>
                <span style={labelStyle}>Choose Configuration</span>
                <select
                    style={dropdownStyle}
                    value = {this.state.selectValue}
                    onChange = {this.OnSettingChange}
                >
                    {
                        this.props.names.map( (name, key) => (
                            <option value={name} key={key++}>
                                {name}
                            </option>
                        ))
                    }
                </select>
                <button
                    style={buttonStyle}
                    onClick = {this.RequestConfiguration}
                >
                    Load
                </button>
            </div>
        );
    } // end function render

    /*********************************************************************************************/
}; // end class ConfigurationSelector

/*************************************************************************************************/

export default SettingsDialog

// eof
