// File: src/dialogs/DCBreakerDetailsDialog.jsx
// Note: 
// Date: 03/12/2020
//..................................................................................................
import React from "react";

import './styles/modal.css';

console.log( "Mounting DCBreakerDetailsDialog.jsx... <DCBreakerDetailsDialog />" );

/*************************************************************************************************
 * class DCBreakerDetailsDialog
 *************************************************************************************************/
class DCBreakerDetailsDialog extends React.Component {
    
    /*********************************************************************************************
     * function OnClose
     *********************************************************************************************/
    OnClose = (e) => {
        console.log( "--> DCBreakerDetailsDialog.OnClose" );
        this.props.OnClose(e);
        console.log( "<-- DCBreakerDetailsDialog.OnClose" );
    } // end function OnClose
    
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        if ( !this.props.show ) 
        {
            return null;
        }
        
        var title               = "DC Breaker Status ";
        var tripDelay           = "Trip Delay: ";
        var factoryMaxRating    = "Factory Max Rating: ";
        var actualState         = "Actual State: ";
        var inrushDelay         = "Inrush Delay: ";
        var currentRating       = "Current Rating: ";
        var defaultState        = "Default State: ";
        var defaultDimValue     = "Default Dim Value: ";
        var current             = "Current: ";
        var defaultLockState    = "Default Lock State: ";
        var actualDimValue      = "Actual Dim Value: ";
        var voltage             = "Voltage: ";
        var dimmingAllowed      = "Dimming Allowed: ";
        var flashMap            = "Flash Map: ";
        var ecbModel            = "ECB Model: ";
        var ecbSwVersion        = "ECB S/W Version: ";

        var shortLoad           = "Short Load: ";
        var breakerLocked       = "Breaker Locked: ";
        var stateMismatch       = "State Mismatch: ";
        var adcError            = "ADC Error: ";
        var abnormalLow         = "Abnormal Low: ";
        var breakerTripped      = "Breaker Tripped: ";
        var fuseDestructFailed  = "Fuse Destruct Failed: ";
        var addressError        = "Address Error: ";
        var abnormalHigh        = "Abnormal High: ";
        var breakerOn           = "Breaker On: ";
        var fuseDestruct        = "Fuse Destruct: ";
        var commsError          = "Comms Error: ";
        var busControl          = "Bus Control: ";
        var openLoad            = "Open Load: ";
        var arc                 = "Arc: ";
        var breakerComms        = "Breaker Comms: ";
        
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
                
                dimmingAllowed += this.props.breakerDetails.breakerConfiguration.dimmingAllowed?"Yes":"No";
                tripDelay += this.props.breakerDetails.breakerConfiguration.tripDelay + "ms";
                inrushDelay += this.props.breakerDetails.breakerConfiguration.inrushDelay + "ms";
                currentRating += this.props.breakerDetails.breakerConfiguration.currentRating + "A";
                defaultDimValue += this.props.breakerDetails.breakerConfiguration.defaultDimValue + "%";
                factoryMaxRating += this.props.breakerDetails.breakerConfiguration.factoryMaximumRating + "A";
                flashMap += this.props.breakerDetails.breakerConfiguration.flashMapIndex;
            }
            else
            {
                defaultState += "-";
                defaultLockState += "-";
                dimmingAllowed += "-";
                tripDelay += "-";
                inrushDelay += "-";
                currentRating += "-";
                defaultDimValue += "-";
                flashMap += "-";
            }
            
            if ( this.props.breakerDetails.breakerStatus )
            {
                current += this.props.breakerDetails.breakerStatus.current + "A";
                actualDimValue += this.props.breakerDetails.breakerStatus.dimValue + "%";
                voltage += this.props.breakerDetails.breakerStatus.voltage + "A";
                ecbModel += this.props.breakerDetails.breakerStatus.breakerModel.toString();
                ecbSwVersion += this.props.breakerDetails.breakerStatus.ecbSoftwareVersion.toString();

                shortLoad += this.props.breakerDetails.breakerStatus.shortLoad?"Yes":"No";
                breakerLocked += this.props.breakerDetails.breakerStatus.breakerLocked?"Yes":"No";
                stateMismatch += this.props.breakerDetails.breakerStatus.stateMismatch?"Yes":"No";
                adcError += this.props.breakerDetails.breakerStatus.adcError?"Yes":"No";
                abnormalLow += this.props.breakerDetails.breakerStatus.abnormalLow?"Yes":"No";
                breakerTripped += this.props.breakerDetails.breakerStatus.breakerTripped?"Yes":"No";
                fuseDestructFailed += this.props.breakerDetails.breakerStatus.fuseDestructFailed?"Yes":"No";
                addressError += this.props.breakerDetails.breakerStatus.addressError?"Yes":"No";
                abnormalHigh += this.props.breakerDetails.breakerStatus.abnormalHigh?"Yes":"No";
                breakerOn += this.props.breakerDetails.breakerStatus.breakerOn?"Yes":"No";
                fuseDestruct += this.props.breakerDetails.breakerStatus.fuseDestruct?"Yes":"No";
                commsError += this.props.breakerDetails.breakerStatus.commsError?"Yes":"No";
                busControl += this.props.breakerDetails.breakerStatus.busControl?"Yes":"No";
                openLoad += this.props.breakerDetails.breakerStatus.openLoad?"Yes":"No";
                arc += this.props.breakerDetails.breakerStatus.arc?"Yes":"No";
                breakerComms += this.props.breakerDetails.breakerStatus.breakerCommunicating?"Yes":"No";
            }
            else
            {
                current += "-";
                actualDimValue += "-";
                voltage += "-";
                ecbModel += "-";
                ecbSwVersion += "-";

                shortLoad += "-";
                breakerLocked += "-";
                stateMismatch += "-";
                adcError += "-";
                abnormalLow += "-";
                breakerTripped += "-";
                fuseDestructFailed += "-";
                addressError += "-";
                abnormalHigh += "-";
                breakerOn += "-";
                fuseDestruct += "-";
                commsError += "-";
                busControl += "-";
                openLoad += "-";
                arc += "-";
                breakerComms += "-";
            }
            
        }
        
        return (
            <div className="modal" id="modal">
                <h2 className="heading">{title}</h2>
                <div className="content">
                    {tripDelay}<br />
                    {factoryMaxRating}<br />
                    {actualState}<br />
                    {inrushDelay}<br />
                    {currentRating}<br />
                    {defaultState}<br />
                    {defaultDimValue}<br />
                    {current}<br />
                    {defaultLockState}<br />
                    {actualDimValue}<br />
                    {voltage}<br />
                    {dimmingAllowed}<br />
                    {flashMap}<br />
                    {ecbModel}<br />
                    {ecbSwVersion}<br />
                    
                    <hr style={{height:5}} />
                    {shortLoad}<br />
                    {breakerLocked}<br />
                    {stateMismatch}<br />
                    {adcError}<br />
                    {abnormalLow}<br />
                    {breakerTripped}<br />
                    {fuseDestructFailed}<br />
                    {addressError}<br />
                    {abnormalHigh}<br />
                    {breakerOn}<br />
                    {fuseDestruct}<br />
                    {commsError}<br />
                    {busControl}<br />
                    {openLoad}<br />
                    {arc}<br />
                    {breakerComms}<br />
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
        
} // end class DCBreakerDetailsDialog

/*************************************************************************************************/

export default DCBreakerDetailsDialog

// eof

