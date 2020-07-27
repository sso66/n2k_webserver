// File: server/pngs/ISORequest
// Note: ISO 11783 Multi-packet Request Types for Parameter Group Numbers
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing ISORequestPgn" );

// ___ devices package modules __
const Bus     = require( '../devices/Bus' );
const Device  = require( '../devices/Device' );
const Name    = require( '../devices/Name' );

// ___ pgns package modules ___
const BasePGN = require( './BasePGN' );

const PGN_NUMBER = 59904;
const PGN_NAME   = PGN_NUMBER.toString();

var gLastGlobalAddressClaimRequestReceivedAt = new Date();

/*************************************************************************************************
 * class ISORequestPGN
 *************************************************************************************************/
class ISORequestPGN extends BasePGN.BasePGN {

    /*********************************************************************************************
     * Constructor
     *********************************************************************************************/
    constructor( requestedPgn, busIdentifier ) {
        var fieldData = [ BasePGN.MessageTypeEnum.SINGLE_FRAME, PGN_NAME ];
        super( fieldData, false, busIdentifier );
        this.SetNumberField( "PGN", requestedPgn );
		// console.log( "--- Created ISO Request PGN for PGN " + requestedPgn );
    } // end constructor

} // end class ISORequestPGN

/*************************************************************************************************
 * function Process
 * @param msg - BasePgn
 *************************************************************************************************/
function Process( msg ) {
    console.log( "--> ISORequestPGN.Process" );
    console.log( "    msg = " + JSON.stringify( msg ));
    var pgn = msg.GetNumberFromField( "PGN" );
    
    switch ( pgn ) 
    {
       // case LabelPGN.pgnNo :
           // var labelPGN : LabelPGN = new LabelPGN();
           // TransmissionController.Send( labelPGN );
           // break;
       // case MaretronLabelPGN.pgnNo :
           // var maretronLabelPGN : MaretronLabelPGN = new MaretronLabelPGN();
           // TransmissionController.Send( maretronLabelPGN );
           // break;
       // case AlertOperatingModePGN.pgnNo :
           // Log.addMessage( "Received request for Alert Operating Mode" );
           // // use any event parameter here so that the parameter is not null.
           // VesselOperatingMode.TransmitAlertOperatingMode( new Event( "" ) );
           // break;
        case 60928 : // ISOAddressClaimPGN.pgnNo 
            if ( msg.mDestAddress == 255 )
                mLastGlobalAddressClaimRequestReceivedAt = new Date();
            break;
    } // end switch
    console.log( "<-- ISORequestPGN.Process" );
} // end function Process

/*************************************************************************************************/

console.log( "<-- constructing ISORequestPgn" );

module.exports = { PGN_NUMBER, ISORequestPGN, Process };

// eof
