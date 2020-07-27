// File: Device.js
// Note: Availability of devices on NMEA 2000 network
// Date: 04/15/2020
//..............................................................................
console.log( "--> constructing class Device" );

const Bus           = require( './Bus' );
const ProductCodes  = require( './ProductCodes' );

const IndustryEnum = {
    GLOBAL            : 0,
    ON_HIGHWAY        : 1,
    AGRICULTURAL      : 2,
    CONSTRUCTION      : 3,
    MARINE            : 4,
    GEN_SETS          : 5 };

const ManufacturerEnum = {
    AIRMAR            : 135,
    CARLING           : 176,
    CARLING_ALT       : 1046, // in group GLOBAL
    MARETRON          : 137,
    SEA_RECOVERY      : 285 };


const gDevices = [];

class Device {
    /*****************************************************************************************
     * constructor
     *****************************************************************************************/
    constructor( systemInstance=-1, address=-1, busIdentifier=Bus.BusEnum.UNSPECIFIED ) {
        this.mPrimaryBus = new Bus.Bus();
        this.mSecondaryBus = new Bus.Bus();
        this.mActiveBus = busIdentifier;
        this.mDeviceInstance = -1;
        this.mIndustryGroup = -1;
        this.mManufacturerCode = -1;
        this.mFunctionCode = -1;
        this.mClassCode = -1;
        this.mUniqueNumber = -1;
        this.mProductCode = -1;
        this.mName = null; // Name
        if ( busIdentifier == Bus.BusEnum.PRIMARY )
        {
            this.mPrimaryBus.mSystemInstance            = systemInstance;
            this.mPrimaryBus.mAddress                   = address;
            this.mPrimaryBus.mFirstAddressClaimTime     = new Date();
            this.mPrimaryBus.mLastAddressClaimTime      = new Date();
        }
        else if ( busIdentifier == Bus.BusEnum.SECONDARY )
        {
            this.mSecondaryBus.mSystemInstance          = systemInstance;
            this.mSecondaryBus.mAddress                 = address;
            this.mSecondaryBus.mFirstAddressClaimTime   = new Date();
            this.mSecondaryBus.mLastAddressClaimTime    = new Date();
        }
    } // end constructor

    /*****************************************************************************************
     * Determine if the device is a Carling AC or DC switch box based on the Product Code
     * of the Device and the Manufacturer Code of the Device.
     * @return return <code>true</code> if Device is a Carling AC or DC switch box.
     *****************************************************************************************/
    IsCarlingSwitchBox() {
       // console.log( "Testing for Carling Switch Box, productCode = " + this.mProductCode );
        return ( IsCarlingDevice( this.mIndustryGroup, this.mManufacturerCode )
            && ProductCodes.CARLING_SWITCHES.indexOf( this.mProductCode ) >= 0 );
    } // end function IsCarlingSwitchBox

    /*****************************************************************************************
     * Determine if the device is a Carling AC Gen 2 switch box based on the Product Code
     * of the Device and the Manufacturer Code of the Device.
     * @return return <code>true</code> if Device is a Carling AC Gen 2 switch box.
     *****************************************************************************************/
    IsCarlingGen2ACSwitchBox() {
        return ( IsCarlingDevice( this.mIndustryGroup, this.mManufacturerCode ) 
            && ProductCodes.CARLING_GEN2_AC_SWITCHES.indexOf( this.mProductCode ) >= 0 );
    } // end function IsCarlingGen2ACSwitchBox

    /*****************************************************************************************
     * Determine if the device is a Carling AC switch box based on the Product Code
     * of the Device and the Manufacturer Code of the Device.
     * @return <code>true</code> if Device is a Carling AC switch box.
     *****************************************************************************************/
    IsCarlingACSwitchBox() {
        return ( IsCarlingDevice( this.mIndustryGroup, this.mManufacturerCode) 
            && ProductCodes.CARLING_AC_SWITCHES.indexOf( this.mProductCode ) >= 0 );
    } // end function IsCarlingACSwitchBox
    
    /*****************************************************************************************
     * Determine if the device is a Carling DC Gen 2 switch box based on the Product Code
     * of the Device and the Manufacturer Code of the Device.
     * @return <code>true</code> if Device is a Carling DC switch box.
     *****************************************************************************************/
    IsCarlingDCSwitchBox() {
        return ( IsCarlingDevice( this.mIndustryGroup, this.mManufacturerCode) 
            && ProductCodes.CARLING_DC_SWITCHES.indexOf( this.mProductCode ) >= 0 );
    } // end function IsCarlingDCSwitchBox
    
    /*****************************************************************************************
     * function SetLastPgnTime
     * @param busIdentifier : Bus.BusEnum
     * @param time : Date
     *****************************************************************************************/
    SetLastPgnTime( busIdentifier, time = null ) {
        if ( time == null )
            time = new Date();
        if ( busIdentifier == Bus.BusEnum.SECONDARY )
            this.mSecondaryBus.mLastPGNTime = time;
        else
            this.mPrimaryBus.mLastPGNTime = time;
    } // end function SetLastPgnTime

    /*****************************************************************************************/
} // end class Device

/*****************************************************************************************
 * static function AddDevice
 * @param device : Device
 *****************************************************************************************/
function AddDevice( device ) {
    gDevices.push( device );
} // end function AddDevice

/*****************************************************************************************
 * static function GetDevice
 * @param name : Name
 * @return will return <code>null</code> if there is no matching Device.
 *****************************************************************************************/
function GetDevice( name ) {
    for ( var device of gDevices )
    {
        if ( device.mName && device.mName.Equals( name ) )
            return device;
    }
    return null;
} // end static function GetDevice

/*****************************************************************************************
 * static function GetDeviceForAddress
 * @return will return <code>null</code> if there is no matching Device.
 *****************************************************************************************/
function GetDeviceForAddress( address, busIdentifier ) {
    // console.log( "--> Device.GetDeviceForAddress address = " + address + ", busIdentifier = " + busIdentifier );
    for ( var i=0; i<gDevices.length; i++ )
    {
        var device = gDevices[i];
        if ( busIdentifier == Bus.SECONDARY )
        {
            if ( address == device.mSecondaryBus.mAddress )
            {
                //console.log( "<-- Device.GetDeviceForAddress found on Secondary Bus, device = " + JSON.stringify( device ));
                return device;
            }
        }
        else
        {
            if ( address == device.mPrimaryBus.mAddress )
            {
                //console.log( "<-- Device.GetDeviceForAddress found on Primary Bus, device = " + JSON.stringify( device ));
                return device;
            }
        }
    }
    // console.log( "<-- Device.GetDeviceForAddress device not found" );
    return null;
} // end function GetDeviceForAddress

/*****************************************************************************************
 * Determine if the device is a Carling device based on the Manufacturer Code of
 * the Device.<br>
 * The reason that this is a static function is so we can call it when we get a message
 * containing the Manufacturer Code and Industry Group and before we have created or
 * found the Device in the database.
 * @return return <code>true</code> if Device is a Carling device.
 *****************************************************************************************/
function IsCarlingDevice( industryGroup, manufacturerCode ) {
    if ( industryGroup == IndustryEnum.MARINE && manufacturerCode == ManufacturerEnum.CARLING )
        return true;
    else if ( industryGroup == IndustryEnum.GLOBAL && manufacturerCode == ManufacturerEnum.CARLING_ALT )
        return true;
    else
        return false;
} // end function IsCarlingDevice

/*****************************************************************************************
 * Determine if the device is a Maretron device based on the Manufacturer Code of
 * the Device.
 * @return return <code>true</code> if Device is a Carling AC Gen 2 switch box.
 *****************************************************************************************/
function IsMaretronDevice( industryGroup, manufacturerCode ) {
    return ( industryGroup == IndustryEnum.MARINE && manufacturerCode == ManufacturerEnum.MARETRON );
} // end function IsMaretronDevice

/*****************************************************************************************
 * Determine if the device is a Sea Recovery device based on the Manufacturer Code of
 * the Device.
 * @return return <code>true</code> if Device is a Sea Recovery device.
 *****************************************************************************************/
function IsSeaRecoveryDevice( industryGroup, manufacturerCode ) {
    return ( industryGroup == IndustryEnum.MARINE && manufacturerCode == ManufacturerEnum.SEA_RECOVERY );
} // end function IsSeaRecoveryDevice

/*****************************************************************************************/

console.log( "<-- constructing class Device" );

module.exports = { IndustryEnum,
                   ManufacturerEnum,
                   Device,
                   AddDevice,
                   GetDevice,
                   GetDeviceForAddress,
                   IsCarlingDevice,
                   IsMaretronDevice,
                   IsSeaRecoveryDevice };
                   
// eof
