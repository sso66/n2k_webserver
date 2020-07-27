// File: server/pgns/CarlingRequestPGN
// Note: Carling Request Types for Parameter Group Numbers
// Date: 014/6/2020
//..............................................................................
console.log( "--> constructing CarlingRequestPGN" );

// ___ devices package modules __
const Bus     = require( '../devices/Bus' );
const Device  = require( '../devices/Device' );
const Name    = require( '../devices/Name' );

// ___ pgns package modules ___
const BasePGN = require( './BasePGN' );

const PGN_NUMBER = 61184;
const PGN_NAME   = "61184_CARLING_REQUEST_FOR_INFORMATION";

const BOX_STATUS              = 1;
const BREAKER_STATUS          = 2;
const BREAKER_CONFIGURATION   = 3;
const BOX_POWER_INFORMATION   = 7;
const REPORT_UPTIME           = 20;
const REPORT_TOTAL_HOURS      = 21;

const AC_GENII_BREAKER_STATUS           = 0x42;
const AC_GENII_BREAKER_CONFIGURATION    = 0x43;

/*************************************************************************************************
 * class CarlingRequestPGN
	"61184_CARLING_REQUEST_FOR_INFORMATION" : {
                name:"Carling Request For Information",
                priority:2,
				singleFrame:true,
				fields : {
                    "Manufacturer Code"             : { type:"uint11", position:0, testValue:"1046"},
                    "Reserved"                      : { type:"uint2",  position:1, testValue:"3"},
                    "Industry Group"                : { type:"uint3",  position:2, testValue:"0"},
					"Message Type"                  : { type:"uint8",  position:3, testValue:"5"},
					"Breaker Mapping 1"             : { type:"uint8s", position:4 },
					"Breaker Mapping 2"             : { type:"uint8s", position:5 },
                    "Reserved 2"                    : { type:"uint5",  position:6 },
                    "Breaker Mapping 3"             : { type:"uint3",  position:7 },
					"Info Requested"                : { type:"uint8s", position:8 }
				}
			},
 *************************************************************************************************/
class CarlingRequestPGN extends BasePGN.BasePGN {

    /*********************************************************************************************
     * Constructor
     *********************************************************************************************/
    constructor( industryGroup, manufCode, messageType, breakerNo = -1 ) {
        var fieldData = [ BasePGN.MessageTypeEnum.SINGLE_FRAME,
                 PGN_NAME ];
        super( fieldData, false );
        this.mData[1] = PGN_NUMBER;
        this.SetNumberField( "Manufacturer Code", manufCode );
        this.SetNumberField( "Reserved", 3 );
        this.SetNumberField( "Industry Group", industryGroup );
        this.SetNumberField( "Message Type", 5 );
        this.SetNumberField( "Reserved 2", 0x1F );

        if ( breakerNo <= 0 )
        {
            // request all breakers
            this.SetNumberField( "Breaker Mapping 1", (0xFF) );
            this.SetNumberField( "Breaker Mapping 2", (0xFF) );
            this.SetNumberField( "Breaker Mapping 3", (0x07) );
        }
        else if ( breakerNo <= 8 )
        {
            this.SetNumberField( "Breaker Mapping 1", 1<<(8-breakerNo) );
            this.SetNumberField( "Breaker Mapping 2", 0 );
            this.SetNumberField( "Breaker Mapping 3", 0 );
        }
        else if ( breakerNo <= 16 )
        {
            this.SetNumberField( "Breaker Mapping 1", 0 );
            this.SetNumberField( "Breaker Mapping 2", 1<<(16-breakerNo) );
            this.SetNumberField( "Breaker Mapping 3", 0 );
        }
        else if ( breakerNo <= 19 )
        {
            this.SetNumberField( "Breaker Mapping 1", 0 );
            this.SetNumberField( "Breaker Mapping 2", 0 );
            this.SetNumberField( "Breaker Mapping 3", 1<<(19-breakerNo) );
        }
        this.SetNumberField( "Info Requested", messageType );
       // if ( messageType == 67 )
       // {
           // console.log( "--- Created Carling Request PGN for Message Type " + messageType );
           // console.log( "    " + JSON.stringify( this ));
       // }
    } // end constructor
} // end class CarlingRequestPGN

/*************************************************************************************************
 * function Process
 * @param msg - BasePgn
 *************************************************************************************************/
function Process( msg ) {
    console.log( "--> CarlingRequestPGN.Process" );
    console.log( "    msg = " + JSON.stringify( msg ));
    console.log( "<-- CarlingRequestPGN.Process" );
} // end function Process

/*************************************************************************************************/

console.log( "<-- constructing CarlingRequestPGN" );

module.exports = {  PGN_NUMBER, CarlingRequestPGN, Process,
                    BOX_STATUS,
                    BREAKER_STATUS,
                    BREAKER_CONFIGURATION,
                    BOX_POWER_INFORMATION,
                    REPORT_UPTIME,
                    REPORT_TOTAL_HOURS,
                    AC_GENII_BREAKER_STATUS,
                    AC_GENII_BREAKER_CONFIGURATION
                 };

// eof
