// File: Bus.js
// Note: CAN (Controller Area Network) Bus Data Schema
// Date: 04/15/2020
//..............................................................................
console.log( 'Mounting Bus.js...' );

var BusEnum = {
    UNSPECIFIED : -1,
    PRIMARY     : 0,
    SECONDARY   : 1,
    BOTH        : 2 
};

/************************************************************************************************
 * static function BusName
 * @param directConnection - set this to <code>true</code> and the returned name will
 * be "CAN 1" or "CAN 2".<br>
 * set this to <code>false</code> and the returned name will be "Primary" or "Secondary".
 * @param busNo - one of the constants { UNSPECIFIED | PRIMARY | SECONDARY | BOTH }.
 *************************************************************************************************/
function BusName( busNo ) {
    switch ( busNo )
    {
        case BusEnum.UNSPECIFIED : return "Unspecified Bus";
        case BusEnum.PRIMARY     : return "CAN 1";
        case BusEnum.SECONDARY   : return "CAN 2";
        case BusEnum.BOTH        : return "Both Busses";
        default                  : return "Other Bus";
    }
} // end static function BusName

class Bus {
    /*********************************************************************************************
     * Constructor
     *********************************************************************************************/
    constructor()
    {
        this.mAddress               = -1;
        this.mSystemInstance        = -1;
        this.mFirstAddressClaimTime = null;
        this.mLastAddressClaimTime  = null;
        this.mLastPGNTime           = null;
    } // end Constructor

} // end class Bus

module.exports = { BusEnum, BusName, Bus };

// eof
