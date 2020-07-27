// File: src/dialogs/ACBreakerDetailsDialog.jsx
// Note: 
// Date: 03/12/2020
//..................................................................................................
import React from "react";

import './styles/modal.css';

console.log( "Mounting ACBreakerDetailsDialog.jsx... <ACBreakerDetailsDialog />" );

/*************************************************************************************************
 * class ACBreakerDetailsDialog
 *************************************************************************************************/
class ACBreakerDetailsDialog extends React.Component {
    
    /*********************************************************************************************
     * function OnClose
     *********************************************************************************************/
    OnClose = (e) => {
        console.log( "--> ACBreakerDetailsDialog.OnClose" );
        this.props.OnClose(e);
        console.log( "<-- ACBreakerDetailsDialog.OnClose" );
    } // end function OnClose
    
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        if ( !this.props.show ) 
        {
            return null;
        }
        
        var title               = "AC Breaker Status ";
        var actualState         = "Actual State: ";
        var defaultState        = "Default State: ";
        var defaultLockState    = "Default Lock State: ";
        var breakerGroup        = "Breaker Group: ";
        var breakerPresent      = "Breaker Present: ";
        var breakerOn           = "Breaker On: ";
        var breakerLocked       = "Breaker Locked: ";
        var overCurrentTrip     = "Over Current Trip: ";
        var hasGFCI             = "Has GFCI: ";
        var GFCITrip            = "GFCI Trip: ";
        var GFCIEndOfLife       = "GFCI End Of Life: ";
        var onCircuitFault      = "On Circuit Fault: ";
        var offCircuitFault     = "Off Circuit Fault: ";
        
        if ( this.props.breakerDetails ) 
        {
            title += this.props.breakerDetails.instance + " Breaker #" + this.props.breakerDetails.channel;
            switch ( this.props.breakerDetails.breakerState.value & 0x03 )
            {
                case 0 : 
                    actualState += "Off";
                    break;
                case 1 : 
                    actualState += "On";
                    break;
                case 2 : 
                    actualState += "Error";
                    break;
                default : 
                    actualState += "-";
                    break;
            }
            
            if ( this.props.breakerDetails.breakerConfiguration )
            {
                if ( this.props.breakerDetails.breakerConfiguration.defaultToLastState )
                    defaultState += "Last State";
                else if ( this.props.breakerDetails.breakerConfiguration.defaultState )
                    defaultState += "On";
                else
                    defaultState += "Off";
                
                if ( this.props.breakerDetails.breakerConfiguration.defaultLockState )
                    defaultLockState += "On";
                else
                    defaultLockState += "Off";
                
                breakerGroup += this.props.breakerDetails.breakerConfiguration.breakerGroup;
            }
            else
            {
                defaultState += "-";
                defaultLockState += "-";
                breakerGroup += "-";
            }
            
            if ( this.props.breakerDetails.breakerStatus )
            {
                breakerPresent += this.props.breakerDetails.breakerStatus.breakerPresent?"Yes":"No";
                breakerOn += this.props.breakerDetails.breakerStatus.breakerOn?"Yes":"No";
                breakerLocked += this.props.breakerDetails.breakerStatus.breakerLocked?"Yes":"No";
                overCurrentTrip += this.props.breakerDetails.breakerStatus.overcurrrentTrip?"Yes":"No";
                hasGFCI += this.props.breakerDetails.breakerStatus.breakerIsGFCI?"Yes":"No";
                GFCITrip += this.props.breakerDetails.breakerStatus.GFCITrip?"Yes":"No";
                GFCIEndOfLife += this.props.breakerDetails.breakerStatus.GFCIEndOfLife?"Yes":"No";
                onCircuitFault += this.props.breakerDetails.breakerStatus.onCircuitFault?"Yes":"No";
                offCircuitFault += this.props.breakerDetails.breakerStatus.offCircuitFault?"Yes":"No";
            }
            else
            {
                defaultState += "-";
                defaultLockState += "-";
                breakerGroup += "-";
            }
            
        }
        
        return (
            <div className="modal" id="modal">
                <h2 className="heading">{title}</h2>
                <div className="content">
                    {actualState}<br />
                    {defaultState}<br />
                    {defaultLockState}<br />
                    {breakerGroup}<br />
                    <hr style={{height:5}} />
                    {breakerPresent}<br />
                    {breakerOn}<br />
                    {breakerLocked}<br />
                    {overCurrentTrip}<br />
                    {hasGFCI}<br />
                    {GFCITrip}<br />
                    {GFCIEndOfLife}<br />
                    {onCircuitFault}<br />
                    {offCircuitFault}<br />
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
        
} // end class ACBreakerDetailsDialog

/*************************************************************************************************/

export default ACBreakerDetailsDialog

// eof

