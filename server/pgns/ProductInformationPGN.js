// File: server/pgns/ProductInformationPGN.js
// Note: Info on Single-frame Transmission Data for Parameter Group Numbers
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing ProductInformationPGN.js" );

// ___ devices package modules ___
const Bus           = require( '../devices/Bus' );
const Channel       = require( '../devices/Channel' );
const Device        = require( '../devices/Device' );
const Name          = require( '../devices/Name' );

// ___ pgns package modules ___
const BasePGN       = require( './BasePGN' );
const ISORequestPGN = require( '../pgns/ISORequestPGN' );

const PGN_NUMBER = 126996;
const PGN_NAME   = PGN_NUMBER.toString();

class ProductInformationPGN extends BasePGN.BasePGN {

    /*****************************************************************************************
     * Constructor
     *****************************************************************************************/
    constructor( device,busIdentifier=Bus.BusEnum.UNSPECIFIED ) {
        var fieldData = [ 
                BasePGN.MessageTypeEnum.FAST_PACKET,
                PGN_NAME,
                device.GetAddress(busIdentifier),
                255
        ];
        super( fieldData, false, busIdentifier );
        this.SetNumberField( "NMEA 2000 Database Version", device.mNMEA2000DatabaseVersion );
        this.SetNumberField( "NMEA Manufacturers Product Code", device.mProductCode );
        this.SetField( "Manufacturers Model Id", device.mModelId );
        this.SetField( "Manufacturers Software Version Code", device.mSoftwareVersion );
        this.SetField( "Manufacturers Model Version", device.mModelVersion );
        this.SetField( "Manufacturers Model Serial Code", device.mSerialCode );
        this.SetNumberField( "NMEA 2000 Certification Level", device.mNMEA2000CertificationLevel );
        this.SetNumberField( "Load Equivalency", device.mLoadEquivalency );
    } // end constructor

} // end class ProductInformationPGN

/*************************************************************************************************
 * function Process
 * @param msg - BasePgn
 *************************************************************************************************/
function Process( msg ) {
    // console.log( "--> ProductInformationPGN.Process" );
    // console.log( "    msg = " + JSON.stringify( msg ));

    /** loop variable */
    var channel;
    // where does this come from; get the Device information
    // for this source address
    var deviceInfo = Device.GetDeviceForAddress( msg.mSourceAddress, msg.mBusIdentifier );
    if ( deviceInfo != null )
    {
        deviceInfo.mNMEA2000DatabaseVersion     = msg.GetNumberFromField( "NMEA 2000 Database Version" );
        deviceInfo.mProductCode                 = msg.GetNumberFromField( "NMEA Manufacturers Product Code" );
        deviceInfo.mModelId                     = msg.GetStringField( "Manufacturers Model Id" );
        deviceInfo.mSoftwareVersion             = msg.GetStringField( "Manufacturers Software Version Code");
        deviceInfo.mModelVersion                = msg.GetStringField( "Manufacturers Model Version" );
        deviceInfo.mSerialCode                  = msg.GetStringField( "Manufacturers Model Serial Code" );
        deviceInfo.mNMEA2000CertificationLevel  = msg.GetNumberFromField( "NMEA 2000 Certification Level" );
        deviceInfo.mLoadEquivalency             = msg.GetNumberFromField( "Load Equivalency" );
        
        if ( deviceInfo.mManufacturerCode == Device.MARETRON )
        {
            switch ( deviceInfo.mProductCode )
            {
                // If this is a SMS100, then replace the Device with a SMS100
                // if it is not already a SMS100
               // case ProductCodes.SMS100 :
                   // if ( !( deviceInfo is SMS ) )
                   // {
                       // trace( "Creating SMS" );
                       // Device.RemoveDevice( deviceInfo );
                       // var sms : SMS = new SMS( deviceInfo );
                       // Device.AddDevice( sms );
                   // }
                   // break;
                
                // If this is a SIM100, RIM100 or DCR100, then make sure that any Bank Channels
                // have the pgnNo set to 127501 to that we can receive labels
                case ProductCodes.SIM100 :
                case ProductCodes.RIM100 :
                case ProductCodes.DCR100 :
                    deviceInfo.mChannels.forEach( channel => {
                        if ( Channel.FIRST_BANK_CHANNEL_NO <= channel.channelNo && channel.channelNo < Channel.DEVICE_CHANNEL_NO ) 
                            channel.pgnNo = 127501;
                        });
                    break;
                // If this is a TLA100 then make sure that all the Channels
                // have the pgnNo set to 127505 to that we can receive labels
                case ProductCodes.TLA100 :
                    deviceInfo.mChannels.forEach( channel => 
                        channel.pgnNo = 127505 );
                    break;
                // If this is a RAA100 then make sure that all the Channels
                // have the pgnNo set to 127245 to that we can receive labels
                case ProductCodes.RAA100 :
                    deviceInfo.mChannels.forEach( channel => 
                        channel.pgnNo = 127245 );
                    break;                
                case ProductCodes.DCR100 :
                case ProductCodes.ALM100 :
                    // trace( "Product Information Request - request Annunciator data from " + deviceInfo.modelId );
                    // request a Annunciator PGN in case this DCR100 has been configured as an Annunciator
                    let requestPGN = new ISORequestPGN( AnnunciatorPGN.pgnNo, msg.mBusIdentifier );
                    TransmissionController.SendToAddress( requestPGN, sourceAddress, msg.mBusIdentifier );
                    requestPGN = new ISORequestPGN( AnnunciatorCapabilityPGN.pgnNo, msg.mBusIdentifier );
                    TransmissionController.SendToAddress( requestPGN, sourceAddress, msg.mBusIdentifier );
                    break;
                
            } // end switch statement
        } // end if ( Maretron device)
            
    } // end if ( deviceInfo == null )

    // console.log( "    device = " + JSON.stringify(deviceInfo) );
    // console.log( "<-- ProductInformationPGN.Process" );
} // end function Process

/*************************************************************************************************/

console.log( "<-- constructing ProductInformationPGN" );

module.exports = { PGN_NUMBER, ProductInformationPGN, Process };

// eof

