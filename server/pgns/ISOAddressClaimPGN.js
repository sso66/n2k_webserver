// File: server/pgns/ISOAddressClaimPGN.js
// Note: ISO 11783 Multi-packet Address Claim Types for Parameter Group Numbers
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing ISOAddressClaimPgn" );

const Globals = require( '../Globals' );
const ServerManager = require( '../ServerManager' );

// ___ devices package modules __
const Bus     = require( '../devices/Bus' );
const Device  = require( '../devices/Device' );
const Name    = require( '../devices/Name' );

// ___ pgns package modules ___
const BasePGN           = require( './BasePGN' );
const ISORequestPGN     = require( '../pgns/ISORequestPGN' );
const CarlingRequestPGN = require( '../pgns/CarlingRequestPGN' );

const PGN_NUMBER = 60928;
const PGN_NAME   = PGN_NUMBER.toString();

/*************************************************************************************************
 * Class ISOAddressClaim
 *************************************************************************************************/
class ISOAddressClaimPGN extends BasePGN.BasePGN {

    /*********************************************************************************************
     * Constructor
     *********************************************************************************************/
    constructor( device,busIdentifier=Bus.BusEnum.UNSPECIFIED ) {
        var fieldData = [ 
                BasePGN.MessageTypeEnum.SINGLE_FRAME,
                PGN_NAME,
                device.GetAddress(busIdentifier),
                255
        ];
        super( fieldData, false, busIdentifier );
        this.SetNumberField( "Unique Number", device.mUniqueNumber );
        this.SetNumberField( "Manufacturer Code", device.mManufacturerCode );
        this.SetNumberField( "Device Instance Lower", (device.mDeviceInstance&0x07) );
        this.SetNumberField( "Device Instance Upper", (device.mDeviceInstance>>3) );
        this.SetNumberField( "Device Function", device.mFunctionCode );
        this.SetNumberField( "Reserved", 1 );
        this.SetNumberField( "Device Class", device.mClassCode );
        this.SetNumberField( "System Instance", 0 );
        this.SetNumberField( "Industry Group", device.mIndustryGroup );
        this.SetNumberField( "ISO Self Configurable", 1 );
    } // end constructor

} // end class ISOAddressClaimPGN

/*************************************************************************************************
 * function Process
 * @param msg - BasePgn
 *************************************************************************************************/
function Process( msg ) {
   // console.log( "--> ISOAddressClaimPGN.Process" );
   // console.log( "    msg = " + JSON.stringify( msg ));
    var deviceAtNewAddress;
    var address = msg.mSourceAddress;
    if ( address === 255 )
    {
        console.log( "Received Address Claim from device at address 255 - ignored." );
        return;
    }
    var industryGroup    = msg.GetNumberFromField( "Industry Group" );
    var systemInstance   = msg.GetNumberFromField( "System Instance" );
    var classCode        = msg.GetNumberFromField( "Device Class" );
    var functionCode     = msg.GetNumberFromField( "Device Function" );
    var devicePriority   = msg.GetNumberFromField( "Device Instance Lower" );
    var deviceInstance   = msg.GetNumberFromField( "Device Instance Upper" );
    var instance         = deviceInstance*8+devicePriority;
    var manufacturerCode = msg.GetNumberFromField( "Manufacturer Code" );
    var uniqueNumber     = msg.GetNumberFromField( "Unique Number" );

    // console.log( "    industryGroup = " + industryGroup 
       // + ", systemInstance = " + systemInstance
       // + ", classCode = " + classCode
       // + ", functionCode = " + functionCode
       // + ", devicePriority = " + devicePriority
       // + ", deviceInstance = " + deviceInstance
       // + ", instance = " + instance
       // + ", manufacturerCode = " + manufacturerCode
       // + ", uniqueNumber = " + uniqueNumber );

    var name             = new Name.Name();
    // console.log( "Received Address Claim " + msg.ToString() );
    name.SetParts(  industryGroup,
                    systemInstance,
                    classCode,
                    functionCode,
                    instance,
                    manufacturerCode,
                    uniqueNumber );
    // console.log( "   Address = " + address + ", Name = " + name.toString() );
    var device = Device.GetDevice( name );
    // console.log( "   Device = " + JSON.stringify(device) );
    var now = new Date();
    if ( !device )
    {
        // ___ Do we already have something on the bus at this address? ___
        device = Device.GetDeviceForAddress( address, msg.mBusIdentifier );
        if ( !device )
        {
           // ___ This is the first time that we have seen this device on any bus ___
           // console.log( "   Creating new device" );
            device = new Device.Device( systemInstance, address, msg.mBusIdentifier );
            Device.AddDevice( device );
        }
        device.mName = name;
    }
    else
    {
        var deviceName = "Unknown Device";
        if ( device.mModelId != null && device.mModelId.length > 0 )
            deviceName = device.mModelId;

        if ( msg.mBusIdentifier == Bus.BusEnum.PRIMARY )
        {
            if ( device.mPrimaryBus.mAddress != address )
            {
                if ( device.mPrimaryBus.mAddress == Bus.BusEnum.UNSPECIFIED )
                {
                    // ___ This is the first time that we have seen this device on the primary bus ___
                    device.mPrimaryBus.mFirstAddressClaimTime  = now;
                }
                else
                {
                    // ___This device is changing address on the primary bus ___
                    console.log( deviceName + " at primary address " + device.mPrimaryBus.mAddress.toString()
                        + "(0x" + device.mPrimaryBus.mAddress.toString(16) + ")"
                        + " is changing address to " + address.toString()
                        + "(0x" + address.toString(16) + ")" );
                    console.log( "    " + msg.ToString() );

                    // ___ Do we already have something on the bus at this address? ___
                    deviceAtNewAddress = Device.GetDeviceForAddress( address, msg.mBusIdentifier );
                    if ( deviceAtNewAddress != null  )
                    {
                        if ( deviceAtNewAddress.mInstallationDescription1 == "simulated" )
                        {
                            console.log( "There was already a simulated device at the new address" );
                            var isoAddressClaim = new ISOAddressClaimPGN( deviceAtNewAddress );
                            isoAddressClaim.Send();
                            return;
                        }
                        else
                        {
                            if ( deviceAtNewAddress.mModelId == null )
                                console.log( "There was already an unknown device at the new address" );
                            else
                                console.log( "There was already a " + deviceAtNewAddress.mModelId + " at the new address" );
                            deviceAtNewAddress.mPrimaryBus.mAddress = 255;
                        }
                    } // end if ( deviceAtNewAddress != null )
                } // end if ( its the first time we have seen this device on the primary bus )
                device.mPrimaryBus.mSystemInstance = systemInstance;
                device.mPrimaryBus.mAddress = address;
            }
            device.mPrimaryBus.mLastAddressClaimTime  = now;
/*
            // Maretron devices with Automation must have the active bus set to Primary.
            // If the device was created from the Secondary bus, and now we have an
            // address claim from the Primary bus, switch the active bus to Primary.
            // Bug 3826
            if ( device.HasAutomation() )
                device.mActiveBus = Bus.BusEnum.PRIMARY;
*/
        }
        else
        {
            // ___ This must be on the secondary bus ___
            if ( device.mSecondaryBus.mAddress != address )
            {
                if ( device.mSecondaryBus.mAddress == Bus.BusEnum.UNSPECIFIED )
                {
                    // ___ This is the first time that we have seen this device on this bus ___
                    device.mSecondaryBus.mFirstAddressClaimTime  = now;
                }
                else
                {
                    // ___ This device is changing address on the secondary bus ___
                    console.log( deviceName + " at secondary ddress " + device.mSecondaryBus.mAddress.toString()
                        + "(0x" + device.mSecondaryBus.mAddress.toString(16) + ")"
                        + " is changing address to " + address.toString()
                        + "(0x" + address.toString(16) + ")" );

                    // ___ Do we already have something on the bus at this address? ___
                    deviceAtNewAddress = Device.GetDeviceForAddress( address, msg.mBusIdentifier );
                    if ( deviceAtNewAddress != null )
                    {
                        if ( deviceAtNewAddress.mInstallationDescription1 == "simulated" )
                        {
                            var isoAddressClaim2 = new ISOAddressClaimPGN( deviceAtNewAddress );
                            isoAddressClaim2.Send();
                            return;
                        }
                        else
                        {
                            if ( deviceAtNewAddress.mModelId == null )
                                console.log( "there was already an unknown device at the new address" );
                            else
                                console.log( "there was already a " + deviceAtNewAddress.mModelId + " at the new address" );
                            deviceAtNewAddress.mSecondaryBus.mAddress = 255;
                        }
                    } // end if ( deviceAtNewAddress != null )
                } // end if ( its the first time we have seen this device on the secondary bus )
                device.mSecondaryBus.mSystemInstance = systemInstance;
                device.mSecondaryBus.mAddress = address;
            }
            device.mSecondaryBus.mLastAddressClaimTime  = now;
        }
    } // end if ( device == null )
    device.SetLastPgnTime( msg.mBusIdentifier, msg.mTimestamp );

    // ___ We will only request more information if this message is received on the active bus ___
    if ( device.mActiveBus == msg.mBusIdentifier )
    {
        device.mDeviceInstance   = instance;
        device.mIndustryGroup    = industryGroup;
        device.mManufacturerCode = manufacturerCode;
        device.mFunctionCode     = functionCode;
        device.mClassCode        = classCode;
        device.mUniqueNumber     = uniqueNumber;
/*
        // ___ if we do not have them, request the Channel Correlation and Label PGNs for the device if it is a Maretron or Carling Device ___
        if ( Device.IsMaretronDevice( industryGroup, manufacturerCode )
            || Device.IsCarlingDevice( industryGroup, manufacturerCode ))
        {
            var labelsAreMissing = (device.mChannels.length == 0);
            for ( var channel of device.mChannels )
            {
                if ( channel.mLabel == null )
                    labelsAreMissing = true;
            }
            if ( labelsAreMissing
                && ( device.mChannelRequestTime == null || now.getTime()-device.mChannelRequestTime.getTime() > 5*TimeConstants.MINUTES ))
            {
                var requestPGN2 = new ISORequestPGN( DataInstanceChannelCorrelationPGN.pgnNo, msg.mBusIdentifier );
                TransmissionController.SendToAddress( requestPGN2, address, msg.mBusIdentifier );
                device.mChannelRequestTime = now;

                // NMEA labels do not have channels so we can request these immediately
                var requestPGN4 = new ISORequestPGN( LabelPGN.pgnNo, msg.mBusIdentifier );
                TransmissionController.SendToAddress( requestPGN4, address, msg.mBusIdentifier );

                // Request the Maretron labels after 5 seconds
                var timer = new DelayTimer( device, msg.mBusIdentifier, address, 5*TimeConstants.SECONDS );
                timer.addEventListener( MaretronTimer.TIMER_COMPLETE, RequestLabels );
                timer.start();

                device.mLabelRequestTime = now;
            }
        } // end if ( manufacturerCode is Maretron or Carling )
*/
        // ___ if we do not have it, request the Product Information PGN for the device ___
        if ( device.mProductCode <= 0 )
        {
            // Product Information PGN has PgnNo == 126996
            // Do not use ProductInformationPgn.pgnNo here as it may nopt have been initialized yet.
            var requestPGN5 = new ISORequestPGN.ISORequestPGN( 126996, msg.mBusIdentifier );
            Globals.TransmissionController.SendToAddress( requestPGN5, address, msg.mBusIdentifier );
        }
/*
        // ___ if we do not have it, request the Configuration Information PGN for the device ___
        if ( device.mInstallationDescription1 == null
            && ( device.mConfigurationRequestTime == null || now.getTime()-device.mConfigurationRequestTime.getTime() > 5*TimeConstants.MINUTES ))
        {
            var requestPGN6 = new ISORequestPGN( ConfigurationInformationPGN.pgnNo, msg.mBusIdentifier );
            Globals.TransmissionController.SendToAddress( requestPGN6, address, msg.mBusIdentifier );
            device.mConfigurationRequestTime = now;
        }
*/
        // ___ if we do not have it, request breaker status from the Carling AC and DC boxes ___
        if ( device.IsCarlingSwitchBox() )
        {
           // console.log( "--- ISOAddressClaimPGN.Process, this is from a Carling Switch Box." );
           // var database = N2KView.instance.mDatabase;
            // Request Breaker States immediately so that we do not have to wait
            var requestPGN7 = new ISORequestPGN.ISORequestPGN( 127501, msg.mBusIdentifier );
            Globals.TransmissionController.SendToAddress( requestPGN7, address, msg.mBusIdentifier );

            var boxStatusRequestPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                Device.ManufacturerEnum.CARLING,
                CarlingRequestPGN.BOX_STATUS );
            Globals.TransmissionController.Send( boxStatusRequestPGN, device );

            var boxPowerInformationRequestPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                Device.ManufacturerEnum.CARLING,
                CarlingRequestPGN.BOX_POWER_INFORMATION );
            Globals.TransmissionController.Send( boxPowerInformationRequestPGN, device );

            var reportUptimeRequestPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                Device.ManufacturerEnum.CARLING,
                CarlingRequestPGN.REPORT_UPTIME );
            Globals.TransmissionController.Send( reportUptimeRequestPGN, device );

            var reportTotalHoursRequestPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                Device.ManufacturerEnum.CARLING,
                CarlingRequestPGN.REPORT_TOTAL_HOURS );
            Globals.TransmissionController.Send( reportTotalHoursRequestPGN, device );

            // ___ If we do not have it already, request the status of all of the breakers in the box
            if ( device.IsCarlingGen2ACSwitchBox() )
            {
               // var acGenIIBreakerStatusMsg = database.GetPGNInfo( "65300_MT66", instance, true, "source" );
               // if ( acGenIIBreakerStatusMsg == null || acGenIIBreakerStatusMsg.message == null )
                {
                    //console.log( "requesting BreakerStatus, device = " + JSON.stringify( device ));
                    var acGenIIBreakerStatusRequestPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                        Device.ManufacturerEnum.CARLING,
                        CarlingRequestPGN.AC_GENII_BREAKER_STATUS );
                    Globals.TransmissionController.Send( acGenIIBreakerStatusRequestPGN, device );
                }
               // var acGenIIBreakerConfigurationMsg = database.GetPGNInfo( "61184_MT67", instance, true, "source" );
               // if ( acGenIIBreakerConfigurationMsg == null || acGenIIBreakerConfigurationMsg.message == null )
                {
                    var acGenIIBreakerConfigurationRequestPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                        Device.ManufacturerEnum.CARLING,
                        CarlingRequestPGN.AC_GENII_BREAKER_STATUS );
                    Globals.TransmissionController.Send( acGenIIBreakerConfigurationRequestPGN, device );
                }
            }
            else
            {
               // var breakerStatusMsg = database.GetPGNInfo( "130921_MT2", instance, true, "source" );
               // if ( breakerStatusMsg == null || breakerStatusMsg.message == null )
               // {
                    // Send this twice - we have no way of knowing if this is an old Moritz box with the wrong GROUP and MANUF ID
                    // or the new Carling version
                    var breakerStatusRequestPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.CARLING_ALT_GROUP,
                        Device.ManufacturerEnum.CARLING_ALT,
                        CarlingRequestPGN.BREAKER_STATUS );
                    Globals.TransmissionController.Send( breakerStatusRequestPGN, device );
                    var breakerStatusRequestPGN2 = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                        Device.ManufacturerEnum.CARLING,
                        CarlingRequestPGN.BREAKER_STATUS );
                    Globals.TransmissionController.Send( breakerStatusRequestPGN2, device );
               // }
               // var breakerConfigurationMsg = database.GetPGNInfo( "130921_MT3", instance, true, "source", 1 );
               // if ( breakerConfigurationMsg == null || breakerConfigurationMsg.message == null )
               // {
                    // Send this twice - we have no way of knowing if this is an old Moritz box with the wrong GROUP and MANUF ID
                    // or the new Carling version
                    var breakerStatusConfigurationPGN = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.CARLING_ALT_GROUP,
                        Device.ManufacturerEnum.CARLING_ALT,
                        CarlingRequestPGN.BREAKER_CONFIGURATION );
                    Globals.TransmissionController.Send( breakerStatusConfigurationPGN, device );
                    var breakerStatusConfigurationPGN2 = new CarlingRequestPGN.CarlingRequestPGN( Device.IndustryEnum.MARINE,
                        Device.ManufacturerEnum.CARLING,
                        CarlingRequestPGN.BREAKER_CONFIGURATION );
                    Globals.TransmissionController.Send( breakerStatusConfigurationPGN2, device );
               // }
            }
        }
        else if ( device.mManufacturerCode == Device.MARETRON )
        {
            if ( device.mModelId == "DCR100" || device.mModelId == "SIM100" || device.mModelId == "RIM100" )
            {
                var requestPGN10 = new ISORequestPGN.ISORequestPGN( 127501, msg.mBusIdentifier );
                TransmissionController.SendToAddress( requestPGN10, address, msg.mBusIdentifier );
            }
        }
    } // end if we have received this message on the active bus
   // console.log( "ISOAddressClaim instance = " + device.mDeviceInstance );
   // console.log( "<-- ISOAddressClaimPGN.Process" );
} // end function Process

/*************************************************************************************************/

console.log( "<-- constructing ISOAddressClaimPgn" );

module.exports = { PGN_NUMBER, ISOAddressClaimPGN, Process };

// eof
