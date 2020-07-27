// File: server/pgns/NMEACommandPGN.js
// Note: NMEA 2000 fast packet types for Parameter Group Numbers
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing class NMEACommandPGN" );

// ___ pgns package modules ___
const BasePGN = require( './BasePGN.js' );

const PGN_NUMBER = 126208;
const PGN_NAME   = "126208_CMD";

const FUNCTION_CODE = 1;

console.log( "    NMEACommandPgn, " + JSON.stringify( BasePGN ));
class NMEACommandPGN extends BasePGN.BasePGN {

    /*****************************************************************************************
     * Constructor
     *****************************************************************************************/
    constructor(commandedPGN) {
        super( [ BasePGN.MessageTypeEnum.FAST_PACKET, PGN_NAME ], false );
        this.mNoOfPairs = 0;
        this.SetNumberField( "Function Code", FUNCTION_CODE );
        this.SetNumberField( "Commanded PGN", commandedPGN );
        this.SetNumberField( "Priority Setting", 8 );
        this.SetNumberField( "Reserved", 15 );
        this.SetNumberField( "Number Of Pairs", 0 );
    } // end constructor

    /*****************************************************************************************
     * function SetFieldValuePair
     * @param parameter - start counting at 1 from the Protocol definition
     *****************************************************************************************/
    SetFieldValuePair( parameter, value ) {
        this.mNoOfPairs++;
        if ( this.mNoOfPairs == 1 )
        {
            this.SetNumberField( "First Field No", parameter );
            this.SetNumberField( "First Field Value", value );
        }
        else if ( this.mNoOfPairs == 2 )
        {
            this.SetNumberField( "Second Field No", parameter );
            this.SetNumberField( "Second Field Value", value );
        }
        else if ( this.mNoOfPairs == 3 )
        {
            this.SetNumberField( "Third Field No", parameter );
            this.SetNumberField( "Third Field Value", value );
        }
        else if ( this.mNoOfPairs == 4 )
        {
            this.SetNumberField( "Fourth Field No", parameter );
            this.SetNumberField( "Fourth Field Value", value );
        }
        else if ( this.mNoOfPairs == 5 )
        {
            this.SetNumberField( "Fifth Field No", parameter );
            this.SetNumberField( "Fifth Field Value", value );
        }
        this.SetNumberField( "Number Of Pairs", this.mNoOfPairs );
    } // end function SetFieldValuePair


} // end class NMEACommandPGN

console.log( "<-- constructing class NMEACommandPGN" );

module.exports = { NMEACommandPGN };

// eof
