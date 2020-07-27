// File: server/pngs/LoadControllerConnectionStatePGN.js
// Note: AC Load Controller Connection State for Parameter Group Numbers
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing class LoadControllerConnectionStatePGN" );

// ___ pgns package modules ___
const BasePGN = require( './BasePGN.js' );

const PGN_NUMBER    = 127500;
const PGN_NAME      = "127500";

const ConnectionStateEnum =  {
    OFF         : 0,    // High impedance
    LOW         : 1,    // Connected to Ground
    HIGH        : 2,    // Connected to Supply
    TRIPPED     : 3,    // Max. Device Capabilities Exceeded = OFF
    PWM         : 4,    // Pulse Width Modulated = Dimmer
    TIMED_OFF   : 5,    // Connection is OFF for TimeOff then HIGH
    TIMED_ON    : 6,    // Connection is HIGH for TimeOn then OFF
    CYCLE_OFF   : 7,    // Connection is OFF for TimeOff then CYCLE_ON
    CYCLE_ON    : 8,    // Connection is HIGH for TimeOff then CYCLE_OFF
    FAULT       : 128   // Internal Failure = OFF
};
        
/*********************************************************************************************
 * class LoadControllerConnectionStatePGN
 *********************************************************************************************/
class LoadControllerConnectionStatePGN extends BasePGN.BasePGN {
    /*****************************************************************************************
     * Constructor
     *****************************************************************************************/
    constructor() {
        super( [ BasePGN.MessageTypeEnum.FAST_PACKET, PGN_NAME ], false );
    } // end constructor

    /*****************************************************************************************/

} // end class LoadControllerConnectionStatePGN

/*********************************************************************************************/

console.log( "<-- constructing class LoadControllerConnectionStatePGN" );

module.exports = { LoadControllerConnectionStatePGN, ConnectionStateEnum };

// eof

