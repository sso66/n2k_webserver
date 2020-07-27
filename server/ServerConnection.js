// File: server/ServerConnection.js
// Note: TCP Sever Connection to IPG100 
// Date: 03/26/2020
//..............................................................................
console.log( "--> constructing ServerConnection" );

const net                   = require('net');

const ByteArray             = require( './ByteArray' ).ByteArray;
const Globals               = require( './Globals' );
const TimeConstants         = require( './TimeConstants' );

// ___ devices package modules __
const Bus                   = require( './devices/Bus' );
const Device                = require( './devices/Device' );
const ProductCodeEnum       = require( './devices/ProductCodes' ).ProductCodeEnum;

// ___ pgns package modules ___
const pgns                  = require( './Database' ).pgns;
const BasePGN               = require( './pgns/BasePGN' );
const ISOAddressClaimPGN    = require( './pgns/ISOAddressClaimPGN' );
const ISORequestPGN         = require( './pgns/ISORequestPGN' );
const ProductInformationPGN = require( './pgns/ProductInformationPGN' );
const Protocols             = require( './pgns/Protocols' );

/**
 *  Maximum number of bytes that we will try to transmit in one packet.
 *  Make this a little shorter than the buffer size in the IPG100.
 *  @default 10 kBytes - 100 bytes 
 */
const MAX_LENGTH = 10*1024-100;
const N2KSERVER_IP_ADDRESS = '10.71.1.126';  // Bus A Lab
// const N2KSERVER_IP_ADDRESS = '10.71.1.26';  // Ron's IPG100
// const N2KSERVER_IP_ADDRESS = '192.168.0.8';  // Home
const LOST_DATA_TIMEOUT = 30*TimeConstants.SECONDS;
const MESSAGE_TYPES = ["Unknown (0)", "Single Frame", "Fast Packet", "Transport Protocol" ];

var ConnectionStateEnum = {
    CONNECTED    : "Connected",
    DISCONNECTED : "Disconnected",
    CONNECTING   : "Connecting",
    CLOSED       : "Closed",
    SUSPENDED    : "Suspended" };

/*****************************************************************************************************
 * class ServerConnection
 *****************************************************************************************************/
class ServerConnection {
/*************************************************************************************************
 * constructor
 *************************************************************************************************/
    constructor( busId ) {
        console.log( "--> ServerConnection.constructor, busId = "  + busId + " " + Bus.BusName(busId) );
        /** This identifies which bus we are connected to, for devices supporting dual bus
         *  operation. It should be one of [ Bus.UNSPECIFIED (-1), Bus.PRIMARY (0), or Bus.SECONDARY (1) ].
         *  @default Bus.UNSPECIFIED */
        this.mBusIdentifier = busId;
        this.mConnectionState = ConnectionStateEnum.DISCONNECTED;
        this.mInBinaryMode    = false;
        this.mPartialReceivedMessage = new ByteArray();
        /** Queue of <code>Message</code> to be transmitted. Use <code>Enqueue()</code> to
         *  place messages into the queue. They will be taken out of the queue by
         *  <code>SendQueuedMessages()</code>, packaged into a single frame, and sent to
         *  N2KServer. @default [] */
        this.mOutboundMessageQueue = [];
        /** Storage for the data portion of the message received. */
        this.mDataPortion = new ByteArray();

        this.client = new net.Socket();
        this.Connect(this);
        this.client.on( 'data', (data) => {
            // append the new data to mPartialReceivedMessage
            // console.log( "--> ServerConnection.OnData" );
            this.mPartialReceivedMessage.WriteBytes( data );

            do
            {
                var messageFound = false;
                //console.log( "    look for next message" );
                //console.log( this.mPartialReceivedMessage.ToString() );
                var firstByte = this.mPartialReceivedMessage.GetByteAt(0);
                //console.log( "    firstByte = 0x" + firstByte.toString(16) + ", " + this.mPartialReceivedMessage.bytesAvailable + " bytes available" );
                if ( firstByte === 0xA5 && this.mPartialReceivedMessage.bytesAvailable > 2 )
                {
                    //console.log( "    Received Binary Message" );
                    var secondByte = this.mPartialReceivedMessage.GetByteAt(1);
                    if ( (secondByte&0x80) == 0x80 && this.mPartialReceivedMessage.bytesAvailable >= 6 )
                    {
                       // try
                        {
                            messageFound = this.ProcessBinaryMessage( this.mPartialReceivedMessage.position );
                            this.mLastDataMessageReceived = new Date();
                        }
                       // catch ( e )
                       // {
                           // messageFound = false;
                       // }
                    }
                    else if ( this.mPartialReceivedMessage.bytesAvailable > 7 )
                    {
                        console.log( "found 0xA5 but not the next byte" );
                        this.mPartialReceivedMessage.position = this.mPartialReceivedMessage.position+1;
                        this.mLastMessageReceivedAt = new Date();
                    }
                }
                else if ( firstByte === 0x51 )
                {
                    console.log( "Received Video Message" );
                }
                else if ( (firstByte & 0x80) == 0x00 )
                {
                    // console.log( "Received Ascii Message, length = " + this.mPartialReceivedMessage.length );
                    let messageLength = 0;
                    let message;
                    for ( let i=0; i<this.mPartialReceivedMessage.length; i++ )
                    {
                        if ( this.mPartialReceivedMessage.GetByteAt(i) === 0 )
                        {
                            message = this.mPartialReceivedMessage.ReadUTFBytes( messageLength+1 ); // Read the null into message as well
                            this.mPartialReceivedMessage.Truncate();
                            this.ProcessAsciiMessage( message );
                            this.mLastDataMessageReceived = new Date();
                            messageFound = true;
                            break;
                        }
                        else
                            messageLength++;
                    } // end for loop
                }
            } while ( messageFound && this.mPartialReceivedMessage.bytesAvailable > 0 );
            // console.log( "    buffer exhausted firstByte = 0x" + firstByte.toString(16) + ", " + this.mPartialReceivedMessage.bytesAvailable + " bytes available" );

        });
        this.client.on( 'error', (err) => {
            console.log("Error in ServerConnection: " + err.message);
            this.mConnectionState = ConnectionStateEnum.DISCONNECTED;
        });
        this.client.on( 'close', () => {
            console.log("    Disconnected from N2KServer, N2KServer closed the connection.");
            this.mConnectionState = ConnectionStateEnum.DISCONNECTED;
        });

        this.mSendTimer = setInterval( this.SendQueuedMessages, 100, this );
        this.mReconnectTimer = setInterval( this.Reconnect, 20*TimeConstants.SECONDS, this );

        this.mLastDataMessageReceived = new Date();
        this.mLostConnectionTimer = setInterval( this.CheckForLostConnection, 10*TimeConstants.SECONDS,  this );

        console.log( "<-- ServerConnection.constructor" );
    } // end constructor

    /*************************************************************************************************
     * function Connect
     *************************************************************************************************/
    Connect( serverConnection ) {
            console.log( "--> ServerConnection.Connect to " + N2KSERVER_IP_ADDRESS );
            if ( serverConnection.mConnectionState !== ConnectionStateEnum.CONNECTING ) {
                this.client.connect( 6543, N2KSERVER_IP_ADDRESS, () => {
                    console.log( "--- ServerConnection.Connect, Connected to N2KServer "
                                    + N2KSERVER_IP_ADDRESS + " on port 6543" );
                    serverConnection.client.write( 'CONNECT\t""\t\tMOBILE\0' );
                    serverConnection.mBusIdentifier = Bus.BusEnum.PRIMARY;
                    serverConnection.mConnectionState = ConnectionStateEnum.CONNECTING;
                    serverConnection.mLastDataMessageReceived = new Date();
                });
            }; // end if
            console.log( "<-- ServerConnection.Connect" );
    } // end function Connect

    /*****************************************************************************************
     * function ProcessBinaryMessage
     * @param  startIndex - The value to which mPartialReceivedMessage.position
     *                will be reset if there are not enough bytes in
     *                <code>mPartialReceivedMessage</code> to complete the message.
     * @return <code>true</code> when a message is found
     *                (whether we process it or not).
     *****************************************************************************************/
    ProcessBinaryMessage( startIndex )
    {
        // console.log( "--> ServerConnection.ProcessBinaryMessage, startIndex = " + startIndex );
        var messageFields = [];
        /** Loop variable */
        var i;
        // Processing a Binary message
        /** This should be 0xA5 */
        var binaryHdr     = this.mPartialReceivedMessage.ReadUnsignedByte();
        /** This is the priority and message type */
        var byte0         = this.mPartialReceivedMessage.ReadUnsignedByte();
        var byte1         = this.mPartialReceivedMessage.ReadUnsignedByte();
        var byte2         = this.mPartialReceivedMessage.ReadUnsignedByte();
        var byte3         = this.mPartialReceivedMessage.ReadUnsignedByte();
        var byte4         = this.mPartialReceivedMessage.ReadUnsignedByte();

        //console.log( "    binaryHdr = 0x" + binaryHdr.toString(16) );

        var priority      = (byte0 & 0x70) >> 4;
        var messageType   = (byte0 & 0x06) >> 1;
        /** destination address on the NMEA 2000 bus. */
        var dest          = byte2;
        /** source address on the NMEA 2000 bus. */
        var source        = byte3;
        /** The PGN number built up from bytes 0, 1 and 2 of the message as required */
        var pgnNo         = byte1;
        if ( pgnNo <= 239 )
        {
            pgnNo = ( (byte0 & 0x01) << 16 ) + ( pgnNo << 8 );
        }
        else
        {
            pgnNo = ( (byte0 & 0x01) << 16 ) + ( pgnNo << 8 ) + dest;
            dest = 255;
        }
        var pgnName = pgnNo.toString();

        const tra = false; //([65300].indexOf( pgnNo ) >= 0 ); // ajp
        if ( tra )
        {
            console.log( "--> ServerConnection.ProcessBinaryMessage received binary message " + pgnNo + " from source address " + source
                + " on bus " + this.mBusIdentifier );
            console.log( "    pgnName = " + pgnName );
            console.log( "    header bytes = [ "
                        + this.HexString(binaryHdr) + ", "
                        + this.HexString(byte0) + ", "
                        + this.HexString(byte1) + ", "
                        + this.HexString(byte2) + ", "
                        + this.HexString(byte3) + ", "
                        + this.HexString(byte4) + " ]" );
            var traceMessage = "    messageType = " + MESSAGE_TYPES[messageType]
                + "\n    message starts with [ " + this.HexString(this.mPartialReceivedMessage.GetByteAt(startIndex));
            for ( let hh=1; hh<30; hh++)
            {
                if ( startIndex+hh < this.mPartialReceivedMessage.length )
                {
                    var byt = this.mPartialReceivedMessage.GetByteAt(startIndex+hh);
                    traceMessage += ", " + this.HexString(byt);
                }
            } // end for loop
            traceMessage += " ]";
            console.log( traceMessage );
        }
        // If we have a Fast Packet or Single Frame message, the length is
        // contained in byte 4, otherwise we need to add on byte 5
        var length = byte4;
        if ( messageType == BasePGN.MessageTypeEnum.TRANSPORT_PROTOCOL )
        {
            var byte5 = this.mPartialReceivedMessage.ReadUnsignedByte();
            length = length + (byte5 << 8);
        }

        if ( tra )
            console.log( "    messageType = " + MESSAGE_TYPES[messageType] + ", length = " + length
                + ", " + this.mPartialReceivedMessage.bytesAvailable + " bytes available." );

        if ( length == 0 )
            // There is no data in the message so we may as well get out now.
            // Note: Calling readBytes with a length of zero causes us to
            // empty out all the rest of tha data in the buffer, resulting
            // in messages being lost.
            return true;

        this.mDataPortion.length = 0;
        if ( length <= this.mPartialReceivedMessage.bytesAvailable )
        {
            var savedLength = length;
            var savedBytesAvailable = this.mPartialReceivedMessage.bytesAvailable;

            this.mPartialReceivedMessage.ReadBytes( this.mDataPortion, 0, length );

            if ( tra )
                console.log( "    moved bytes into mDataPortion, "
                    + "mDataPortion has " + this.mDataPortion.bytesAvailable  + " bytes available, "
                    + "mPartialReceivedMessage has " + this.mPartialReceivedMessage.bytesAvailable + " bytes available." );

            this.mBitsLeftOver = 0;
            this.mValueLeftOver = 0;
            // we were able to read all the bytes in the message

            // Discard the message if we are not connected
            if ( !this.IsConnected() )
            {
                if ( tra )
                    console.log( "<-- ServerConnection.ProcessBinaryMessage, discard message, we are not connected" );
                return true;
            }

            // Filter messages based on PGN No
            if ( pgnNo < 10000  || // Smartcraft PGNs
                pgnNo == 60160  || // ISO Transport Protocol - Data Transfer
                pgnNo == 60416  || // ISO Transport Protocol - Connection Management
                pgnNo == 60672  || // Jins test PGN
                pgnNo == 61460  || // Malformed Carling PGN on secondary bus from DC16
                pgnNo == 61462  || // Malformed Carling PGN on secondary bus from DC16
                pgnNo == 61969  || // Strange PGN from TLA100
                pgnNo == 65226  || // J1939 diagnostic message
                pgnNo == 65408  || // Proprietary PGN from DST110
                pgnNo == 65409  || // Proprietary PGN from DST110
                pgnNo == 65410  || // Proprietary PGN from DST110
                pgnNo == 126464 || // PGN List - Transmit or Receive PGN's Group Function
                pgnNo == 129044 || // Datum PGN has Float types that we cannot decode
                pgnNo == 130320 || // Tide Station Data
                pgnNo == 130321 || // Salinity Station Data
                pgnNo == 130322 || // Current Station Data
                pgnNo == 130323 || // Meteorological Station Data
                pgnNo == 130324 )  // Moored Buoy Station Data
                return true;

            if ( tra )
                console.log( "    check if this is a proprietary message" );

            var industryGroup  = 0;
            var manufacturerId = 0;
            // Filter Proprietary messages based on Industry Group and Manufacturer's Id
            if (   (pgnNo ==  61184) // Single Frame Addressable
                || (pgnNo == 126720) // Fast Packet Addressable
                || (65280  <= pgnNo && pgnNo <= 65535)
                || (130816 <= pgnNo && pgnNo <= 131071) )
            {
                if ( tra )
                {
                    console.log( "    YES this is a proprietary message" );
                    console.log( "    mDataPortion = [" + this.mDataPortion.ToString() + "]" );
                }
                // These are Proprietary PGNs, so we must get the manufacturer's Ids
                // to know how to decode the messages
                industryGroup = ( this.mDataPortion.GetByteAt(1) & 0xE0 ) >> 5;
                manufacturerId = this.mDataPortion.GetByteAt(0) + 256*( this.mDataPortion.GetByteAt(1) & 0x07 );
                if ( tra )
                {
                    console.log( "    Industry Group = " + industryGroup + ", manufacturerId = " + manufacturerId );
                }
                if ( Device.IsMaretronDevice( industryGroup, manufacturerId ))
                {
                    switch( pgnNo )
                    {
                        case 61184 :
                            // This is a message sent from a Maretron Device while in the Boot Mode
                            // We will assume that the device is still off line and ignore the message.
                            return true;
                          
                        /*                        
                        case AutomationFunctionMasterFields.PGN_NO : // 65292
                            // For the Automation Function Master, we must only receive this
                            // message from the automation running at our own bus address
                            if ( source != Device.gOwnDevice.GetAddress(mBusIdentifier) )
                                return true;
                            else if ( tra )
                                Log.addMessage( "    Allowing Automation Function Master message through.\n" );
                            break; // allow through for normal processing
                        */

                        case 126720 :
                            var productCode = this.mDataPortion[2] + this.mDataPortion[3]*256;
                            var command     = this.mDataPortion[6];
                            if ( productCode == ProductCodeEnum.DCR100 )
                                pgnName = "126720_DCR_CHANNEL_LOCK_STATUS";
                            else if ( productCode == ProductCodeEnum.SMS100 )
                            {
                                if ( command == 0x32 )
                                    pgnName = "126720_GSM_RX_MESSAGE_RANGE";
                                else if ( command == 0x34 )
                                    pgnName = "126720_GSM_RX_MESSAGE";
                                else if ( command == 0x36 )
                                    pgnName = "126720_GSM_STATUS";
                                else
                                    return true;
                            }
                            else if ( productCode == ProductCodeEnum.J2K100 )
                            {
                                if ( command == 0 )
                                    pgnName = "126720HVAC";
                                else if ( command == 1 )
                                    pgnName = "126720ICE";
                                else
                                    return true;
                            }
                            else
                                return true;
                            break; // allow through for normal processing

                        case 130840 :
                            var dataFormat = this.mDataPortion[3] + this.mDataPortion[4]*256;
                            if ( dataFormat == 1 ) // DF01
                                pgnName = "130840_LINEAR_ACCELERATION";
                            else if ( dataFormat == 4 ) // DF04
                                pgnName = "130840_ANGLE";
                            else if ( dataFormat == 5 ) // DF05
                                pgnName = "130840_ANGULAR_ACCELERATION";
                            else if ( dataFormat == 20 ) // DF20
                                pgnName = "130840_FORCE";
                            else if ( dataFormat == 31 ) // DF31
                                pgnName = "130840_DECIBEL";
                            else if ( dataFormat == 32 ) // DF32
                                pgnName = "130840_RESISTANCE";
                            else if ( dataFormat == 34 ) // DF34
                                pgnName = "130840_ROTATIONAL_RATE";
                            else if ( dataFormat == 36 ) // DF36
                                pgnName = "130840_LINEAR_VELOCITY";
                            else if ( dataFormat == 73 ) // DF73
                                pgnName = "130840_ANGULAR_VELOCITY";
                            else if ( dataFormat == 79 ) // DF79
                                pgnName = "130840_DISTANCE";
                            else if ( dataFormat == 60004 ) // DF60004
                                pgnName = "130840_STRAIN";
                            else
                                return true;
                            break; // allow through for normal processing

                        case 130841 :
                            var packageType = this.mDataPortion.GetByteAt(2) + this.mDataPortion.GetByteAt(3)*256;
                            if ( packageType ==0 ) // Twin Disk Transmission System Prop B message
                                pgnName = "130841_PROP_B";
                            else
                                return true;
                            break; // allow through for normal processing

                        default :
                           // Unknown Maretron proprietary messages are let through
                            break; // allow through for normal processing
                    } // end switch
                }
                else if ( Device.IsCarlingDevice( industryGroup, manufacturerId ))
                {
                    var messageType = this.mDataPortion.GetByteAt(2);
                    switch( pgnNo )
                    {
                        case 61184 :
                            if ( messageType == 2 )
                                pgnName = "61184_CARLING_BREAKER_COMMAND";
                            else if ( messageType == 5 )
                                pgnName = "61184_CARLING_REQUEST_FOR_INFORMATION";
                            else
                                return true;
                            break;
                        case 65300 :
                            if ( messageType == 1 )
                                pgnName = "65300_MT1";
                            else if ( messageType == 7 )
                                pgnName = "65300_MT7";
                            else if ( messageType == 20 )
                                pgnName = "65300_MT20";
                            else if ( messageType == 21 )
                                pgnName = "65300_MT21";
                            else if ( messageType == 66 )
                                pgnName = "65300_MT66";
                            else if ( messageType == 67 )
                                pgnName = "65300_MT67";
                            else if ( messageType == 130 )
                                pgnName = "65300_MT130";
                            else
                                return true;
                            break;

                        case 130921 :
                        {
                            if ( messageType == 2 )
                                pgnName = "130921_MT2";
                            else if ( messageType == 3 )
                                pgnName = "130921_MT3";
                            else
                                return true;
                            break; // allow through for normal processing

                        }
                        default :
                            // Unknown Carling proprietary messages are blocked
                            return true;
                    } // end switch
                }
                else if ( Device.IsSeaRecoveryDevice( industryGroup, manufacturerId ))
                {
                    switch( pgnNo )
                    {
                        case 61184 :
                            pgnName = "61184_SEA_RECOVERY_STATUS";
                            break;
                        case 130816 :
                            break;
                        default :
                            // Unknown Sea Recovery proprietary messages are blocked
                            return true;
                    } // end switch
                }
                else
                    // Proprietary messages from all other Manufacturers are blocked
                    return true;
            } // end if ( this is a Proprietary Message )
            else if ( tra )
                console.log( "    NO this is not a proprietary message" );

/* --- TODO
            var database : Database = N2KView.instance.mDatabase;
            // Command PGN (126208) requires special processing, since it represents a group of PGNs
            // PGN List - Transmit or Receive PGN's Group Function
            if ( pgnNo == NMEACommandPGN.pgnNo )
            {
                if ( tra )
                    Log.addMessage( "    Processing PGN " + NMEACommandPGN.pgnNo );
                try
                {
                    // Group Function Codes
                    // 0. Request Group Function
                    // 1. Command Group Function
                    // 2. Acknowledge Group Function
                    // 3. Read Fields Group Function
                    // 4. Write Fields Group Function
                    // 5. Write Fields Reply Group Function
                    var groupFunctionCode : uint = dataPortion.readUnsignedByte();
                    switch ( groupFunctionCode )
                    {
                        case NMEARequestPGN.FUNCTION_CODE :
                            // Request Group Function
                            if ( tra )
                                Log.addMessage( "    Processing Request Group" );
                            messageFields = [];
                            messageFields.push( "2" ); // Binary Message
                            messageFields.push( String( pgn ) );
                            messageFields.push( String( source ) );
                            messageFields.push( String( dest ) );
                            messageFields.push( String( priority ) );
                            messageFields.push( "0" );
                            messageFields.push( groupFunctionCode ); // must be zero here

                            var requestedPGN : uint = GetUnsignedBits( dataPortion, 24 );
                            messageFields.push( requestedPGN );
                            var requestedMessageFormat : Object = ObjectUtil.Clone( Protocol.metadata[requestedPGN] );
                            if ( requestedMessageFormat != null )
                            {
                                var transmissionInterval : uint = GetUnsignedBits( dataPortion, 32 ) ;
                                messageFields.push( transmissionInterval );
                                var transmissionIntervalOffset : uint = GetUnsignedBits( dataPortion, 16 );
                                messageFields.push( transmissionIntervalOffset );
                                var numberOfPairsOfRequestParameters : uint = GetUnsignedBits( dataPortion, 8 ) ;
                                messageFields.push( numberOfPairsOfRequestParameters );
                                if ( numberOfPairsOfRequestParameters <= 252 )
                                {
                                    for ( i=0; i<numberOfPairsOfRequestParameters; i++ )
                                    {
                                        var fieldNumber : uint = GetUnsignedBits( dataPortion, 8 ) ;
                                        messageFields.push( fieldNumber );
                                        messageFields.push( GetDataByType( dataPortion,
                                            requestedMessageFormat.fieldArray[fieldNumber-1].type,
                                            requestedMessageFormat.fieldArray[fieldNumber-1].length ));
                                        // force the parser to go on to the next byte
                                        mBitsLeftOver = 0;
                                        mValueLeftOver = 0;
                                    } // end for loop
                                } // end if
                                if ( tra )
                                    trace( "MessageFields = [" + messageFields.join(",") + "]" );
                                database.OnMessage( new Message( messageFields, false, mBusIdentifier ));
                                // Don't mark the request as a PGN received - we may be doing the request.
                                // If a response comes back, we will take that as the time of the last PGN received
                                //  mLastPGNReceivedAt = new Date();
                                mLastMessageReceivedAt = new Date();
                            }
                            else
                            {
                                // Filter out trace messages for PGNs that we are happy not to request from N2KView
                                if ( requestedPGN != 126720 &&
                                    requestedPGN != 126464 ) // Transmitted PGN List
                                    trace( "No field types for pgn " + requestedPGN + " requested by PGN 126208 from address " + source + "[0x" + source.toString(16) + "]" );
                                if ( tra )
                                    Log.addMessage( "    ServerConnection sending NotSupported" );
                                NMEARequestPGN.SendNotSupportedIfNoOtherPeers( requestedPGN, source, mBusIdentifier );
                            } // end if ( requestedMessageFormat != null )
                            break;
                        case NMEACommandPGN.FUNCTION_CODE :
                            // Command Message Function
                            if ( tra )
                                Log.addMessage( "    Processing Command Message" );
                            messageFields = [];
                            messageFields.push( "2" );
                            messageFields.push( pgnString );
                            messageFields.push( String( source ) );
                            messageFields.push( String( dest ) );
                            messageFields.push( String( priority ) );
                            messageFields.push( "0" );
                            messageFields.push( groupFunctionCode );

                            var commandedPGN : uint = GetUnsignedBits( dataPortion, 24 );
                            messageFields.push( commandedPGN );
                            var commandedMessageFormat : Object = ObjectUtil.Clone( Protocol.metadata[commandedPGN] );
                            if ( commandedMessageFormat != null )
                            {
                                messageFields.push( GetUnsignedBits( dataPortion,  4 ) ); // Priority Setting
                                messageFields.push( GetUnsignedBits( dataPortion,  4 ) ); // Reserved Bits
                                var numberOfPairsOfCommandedParameters : uint = GetUnsignedBits( dataPortion, 8 ) ;
                                messageFields.push( numberOfPairsOfCommandedParameters );
                                if ( numberOfPairsOfCommandedParameters <= 252 )
                                {
                                    for ( i=0; i<numberOfPairsOfCommandedParameters; i++ )
                                    {
                                        var fieldNumber1 : uint = GetUnsignedBits( dataPortion, 8 );
                                        messageFields.push( fieldNumber1 );
                                        messageFields.push( GetDataByType( dataPortion,
                                            commandedMessageFormat.fieldArray[fieldNumber1-1].type,
                                            commandedMessageFormat.fieldArray[fieldNumber1-1].length ));
                                        // force the parser to go on to the next byte
                                        mBitsLeftOver = 0;
                                        mValueLeftOver = 0;
                                    } // end for loop
                                } // end if
                                if ( tra )
                                    trace( "MessageFields = [" + messageFields.join(",") + "]" );
                                database.OnMessage( new Message( messageFields, false, mBusIdentifier ));
                                mLastMessageReceivedAt = new Date();
                                mLastPGNReceivedAt = new Date();
                            }
                            else
                            {
                                NMEACommandPGN.SendNotSupportedIfNoOtherPeers( commandedPGN, source, mBusIdentifier );
                            } // end if ( commandedMessageFormat != null )
                            mLastMessageReceivedAt = new Date();
                            break;
                        case NMEAAcknowledgePGN.FUNCTION_CODE :
                            // Acknowledge Group Function
                            if ( tra )
                                Log.addMessage( "    Processing Acknowledge Group" );
                            messageFields = [];
                            messageFields.push( "2" );
                            messageFields.push( String( pgn ) );
                            messageFields.push( String( source ) );
                            messageFields.push( String( dest ) );
                            messageFields.push( String( priority ) );
                            messageFields.push( "0" );
                            messageFields.push( groupFunctionCode );

                            messageFields.push( GetUnsignedBits( dataPortion, 24 ) ); // Acknowledged PGN
                            messageFields.push( GetUnsignedBits( dataPortion,  4 ) ); // PGN Error Code
                            messageFields.push( GetUnsignedBits( dataPortion,  4 ) ); // Transmission Interval
                            var numberOfPairsOfAcknowledgedParameters : uint = GetUnsignedBits( dataPortion, 8 ) ;
                            messageFields.push( numberOfPairsOfAcknowledgedParameters );
                            if ( numberOfPairsOfAcknowledgedParameters <= 252 )
                            {
                                for ( i=0; i<numberOfPairsOfAcknowledgedParameters; i++ )
                                    messageFields.push( GetUnsignedBits( dataPortion, 4 ) ); // Parameter Error Code
                            }
                            if ( tra )
                                trace( "MessageFields = [" + messageFields.join(",") + "]" );
                            // force the parser to go on to the next byte
                            mBitsLeftOver = 0;
                            mValueLeftOver = 0;
                            database.OnMessage( new Message( messageFields, false, mBusIdentifier ));
                            mLastMessageReceivedAt = new Date();
                            mLastPGNReceivedAt = new Date();
                            break;
                        default :
                            if ( tra )
                                Log.addMessage( "    Not Processing Group Function Code " + groupFunctionCode );
                            trace( "PGN 126208 function code " + groupFunctionCode + " is not coded yet" );
                    } // end switch
                }
                catch ( error : Error )
                {
                    trace( "caught error in received message 126208" );
                    trace( error );
                    trace( error.getStackTrace() );
                }
                return true;
            } // end if ( pgn == 126208 )
*/

            // try
            {
                if ( tra )
                    console.log( "    pgnName = '" + pgnName + "'" );
                if ( Globals.Protocols[pgnName] )
                {
                    // create a Clone of the Message Format from the database of message formats.
                    // There are certain messages that require us to modify the protocol, and we
                    // must not change the original.
                    let messageFormat = JSON.parse(JSON.stringify(Globals.Protocols[pgnName]));
                    // messageFields is an array of Strings, each for a field
                    // in the message
                    messageFields = [];
                    messageFields.push( "2" );
                    messageFields.push( pgnName );
                    messageFields.push( String( source ) );
                    messageFields.push( String( dest ) );
                    messageFields.push( String( priority ) );
                    messageFields.push( "0" );

                    Object.values(messageFormat.fields).some( field => {
                        if ( this.mDataPortion.bytesAvailable>0 || this.mBitsLeftOver>0 )
                        {
                            try
                            {
                                var data = this.GetDataByType( this.mDataPortion, field.type, field.length );
                                messageFields.push( data );
                            }
                            catch ( e )
                            {
                                return true;
                            }
                            return false;
                        }
                        else
                            return true; // stop the iterator
                    }); // end some loop

                    if ( tra )
                    {
                        console.log( "--  MessageFields = " + JSON.stringify(messageFields));
                        //console.log( "    MessageFormat = " + JSON.stringify(messageFormat));
                    }

                    this.ProcessPGNMessage( new BasePGN.BasePGN( messageFields, false, this.mBusIdentifier ));
                    this.mLastMessageReceivedAt = new Date();
                    // We do not want to log PGNs received from the Automation software running on our
                    // own node. If we log these, then we can never detect Bus A being unplugged because
                    // we continue to get PGNs from the internal source.
                    
                   // if ( source != Device.gOwnDevice.GetAddress(this.mBusIdentifier) )
                   // {
                        this.mLastPGNReceivedAt = new Date();
                   // }
                }
                else
                {
                   // console.log( "    No field types for pgn " + pgnNo + " from address " + source
                       // + "[0x" + source.toString(16) + "] on bus " + this.mBusIdentifier );
                   // console.log( "    industryGroup = " + industryGroup + ", manufacturerId = " + manufacturerId );
                    this.mLastMessageReceivedAt = new Date();
                }
            }
            
            /*
            catch ( error )
            {
                console.log( "caught error processing received message " + pgnNo );
                console.log( "savedLength = " + savedLength + ", savedBytesAvailable = " + savedBytesAvailable );
                console.log( "byte0 = " + this.HexString( byte0 )
                    + ", byte1 = " + this.HexString( byte1 )
                    + ", byte2 = " + this.HexString( byte2 )
                    + ", byte3 = " + this.HexString( byte3 )
                    + ", byte4 = " + this.HexString( byte4 ) );
                console.log( "dest = " + this.HexString( dest )
                    + ", source = " + this.HexString( source )
                    + ", pgn = " + this.HexString( pgnNo ) + " (" + pgnNo + ")" );
                let msgBytes = [];
                for ( let xx = startIndex; xx < startIndex+20; xx++ )
                {
                    var bb = this.mPartialReceivedMessage.GetByteAt(xx);
                    if ( bb != null )
                        msgBytes.push( this.HexString( bb ));
                }
                console.log( msgBytes.join( "," ) );
                console.log( error );
            }
            */
           
            if ( tra )
                console.log( "<-- ServerConnection.ProcessBinaryMessage, return true" );
            return true;
        }
        else
        {
            // We only have enough data for part of the message, reset the pointer to the
            // start of the message
            this.mPartialReceivedMessage.position = startIndex;
            this.mLastMessageReceivedAt = new Date();
            //console.log( "<-- ServerConnection.ProcessBinaryMessage, return false" );
            return false;
        } // end if ( mPartialReceivedMessage.bytesAvailable <= length )

    } // end function ProcessBinaryMessage

    /*****************************************************************************************
     * function HexString
     *****************************************************************************************/
    HexString( bb )
    {
        if ( bb < 16 )
            return "0x0" + bb.toString(16).toUpperCase();
        else
            return "0x" + bb.toString(16).toUpperCase();
    } // end function HexString

    /*************************************************************************************************
     * function ProcessAsciiMessage
     * @param message - String
     *************************************************************************************************/
    ProcessAsciiMessage( message ) {
        // console.log( "--> ServerConnection.ProcessAsciiMessage Received '" + message + "'." );

        if ( message.length == 0 )
            return;
        this.mLastMessageReceivedAt = new Date();

        if ( message.startsWith( "CONNECTED" ))
        {
            console.log( "Received CONNECTED Message" );

            var setModeMessage = new BasePGN.BasePGN( ["SET_MODE","BINARY" ], true, this.mBusIdentifier );
            console.log( "    Sending: " + setModeMessage.ToString() );
            this.Send( setModeMessage );
            this.mInBinaryMode = true;
            console.log( "    Changed MODE to Binary" );

            this.mConnectionState = ConnectionStateEnum.CONNECTED;
            // Do a global address claim request on this bus.
            var requestPGN = new ISORequestPGN.ISORequestPGN( ISOAddressClaimPGN.PGN_NUMBER, this.mBusIdentifier );
            this.Enqueue( requestPGN );
            // Globals.TransmissionController.SendToAddress( requestPGN, 255, this.mBusIdentifier );
        }
        else if ( message.startsWith( "INSTANCE_DATA" ))
        {
            console.log( "Received INSTANCE_DATA Message" );
        }
        else if ( message.startsWith( "SERVER_VERSION" ))
        {
            console.log( "Received SERVER_VERSION Message" );
        }
        else
        {
            var fields = message.split( '\t' );
            var pgn = new BasePGN.BasePGN( fields, false, this.mBusIdentifier );
            this.ProcessPGNMessage( pgn );
        }
    } // end function ProcessAsciiMessage

    /*************************************************************************************************
     * function ProcessPGNMessage
     * @param message - BasePGN
     *************************************************************************************************/
    ProcessPGNMessage( message )
    {
        var pgnNo  = message.mPgnNo;
        // Block out any PGNs that belong to Smartcraft
        if ( pgnNo < 10000 )
            return;

        // console.log( "--> ServerConnection.ProcessPGNMessage, message = " + JSON.stringify( message ));

        if ( message.mData[0] == 2 )
        {
            var pgnName = message.mPgnName;
            var sourceAddress = message.mData[2];
            const trace = false; //( pgnName.localeCompare( "130921_MT2" ) == 0 );
            if ( trace )
            {
                console.log( "--> ServerConnection.ProcessPGNMessage, pgn = " + pgnName );
                console.log( "    pgn = " + JSON.stringify( message ));
            }
            var device = Device.GetDeviceForAddress( sourceAddress, this.mBusIdentifier );
            // console.log( "    device = " + JSON.stringify( device ));
            if ( !device && pgnNo != ISOAddressClaimPGN.PGN_NUMBER )
            {
                var requestPGN = new ISORequestPGN.ISORequestPGN( ISOAddressClaimPGN.PGN_NUMBER, this.mBusIdentifier );
                Globals.TransmissionController.SendToAddress( requestPGN, sourceAddress, this.mBusIdentifier );
                // console.log( "<-- ServerConnection.ProcessPGNMessage, no device found" );
                return;
            }

            if ( trace )
            {
                // console.log( "--> ServerConnection.ProcessPGNMessage `Received PGN " + pgnName );
                console.log( "    message = " + JSON.stringify(message) );
            }

            // Deal with the PGNs that require special processing
            switch ( pgnNo )
            {
                case ISOAddressClaimPGN.PGN_NUMBER :
                    ISOAddressClaimPGN.Process( message );
                    break;
                case ProductInformationPGN.PGN_NUMBER :
                    ProductInformationPGN.Process( message );
                    break;
            } // end switch ( pgnNo )

            // Get the protocol
            var protocol = Protocols.Protocols[pgnName];
            if ( trace )
                console.log( "    pgn " + pgnName + ", protocol = " + JSON.stringify( protocol ));
            if ( !protocol )
                return;

            // Deal with the Proprietary PGNs
            if (    ( 65280  <= pgnNo && pgnNo <= 65535  )
                 || ( 130816 <= pgnNo && pgnNo <= 131071 )
                 ||  pgnNo == 126720 )
            {
                // These are Proprietary PGNs so we must check the manufacturer Id
                if ( trace )
                    console.log( "    Found Proprietary PGN, message.mData = " + message.mData );

                var manufacturerId = message.mData[6];
                var industryGroup  = message.mData[8];
                if ( trace )
                    console.log( "    industryGroup = " + industryGroup + ", manuf = " + manufacturerId );
                if ( Device.IsCarlingDevice( industryGroup, manufacturerId ) )
                {
                    if ( trace )
                        console.log( "    Found Carling PGN " + pgnName );
                    switch( pgnName )
                    {
                        case "65300_MT1"  :
                        case "65300_MT7"  :
                        case "65300_MT20" :
                        case "65300_MT21" :
                        case "65300_MT130" :
                            // These go through for normal processing
                            break;
                        case "65300_MT66" :
                        case "65300_MT67" :
                        case "130921_MT2" :
                        case "130921_MT3" :
                            // These have Breaker Mappings and can apply to more than one breaker
                            // we need to duplicate them for each breaker to which they apply
                            if ( device === undefined )
                            {
                                // if we do not have the deviceData yet, we cannot process this message
                                console.log( "Cannot handle Carling PGN with no device instance no" );
                                return;
                            }

                            let breakerMapping01to08 = parseInt(message.mData[10]);
                            let breakerMapping09to16 = parseInt(message.mData[11]);
                            let breakerMapping17to19 = parseInt(message.mData[13]);
                            for ( let i=0; i<8; i++ )
                            {
                                let mask = (0x0080>>i);
                                if ( trace )
                                {
                                    console.log( "      i = " + i + ", breakerMapping01to08 = " + this.HexString(breakerMapping01to08)
                                            + ", mask = " + this.HexString(mask) );
                                }
                                if ( (breakerMapping01to08 & mask) === mask )
                                {
                                    this.UpdatePGN( protocol, pgnNo, pgnName, device.mDeviceInstance, i+1, device, message, sourceAddress );
                                }
                                if ( (breakerMapping09to16 & mask) === mask )
                                {
                                    this.UpdatePGN( protocol, pgnNo, pgnName, device.mDeviceInstance, i+9, device, message, sourceAddress );
                                }
                            } // end for loop

                            if ( (breakerMapping17to19 & 0x04 ) === 0x04 )
                            {
                                this.UpdatePGN( protocol, pgnNo, pgnName, device.mDeviceInstance, 17, device, message, sourceAddress );
                            }
                            if ( (breakerMapping17to19 & 0x02 ) === 0x02 )
                            {
                                this.UpdatePGN( protocol, pgnNo, pgnName, device.mDeviceInstance, 18, device, message, sourceAddress );
                            }
                            if ( (breakerMapping17to19 & 0x01 ) === 0x01 )
                            {
                                this.UpdatePGN( protocol, pgnNo, pgnName, device.mDeviceInstance, 19, device, message, sourceAddress );
                            }
                            if ( trace )
                            {
                                console.log( "<-- ServerConnection.ProcessPGNMessage, completed breaker mappings" );
                            }
                            return;
                        default:
                            // Ignore any other PGNs
                            return;
                    } // end switch
                } // end if Carling PGN
            } // end if Proprietary PGN

            if ( device )
                device.SetLastPgnTime( message.mBusIdentifier, message.mTimestamp );

            var instance;
            if ( protocol.instanceField )
                instance = message.mData[protocol.fields[protocol.instanceField].position+6];
            else if ( device )
                instance = device.mDeviceInstance;
            else
                return;

            var source = -1;
            if ( protocol.sourceField )
                source = message.mData[protocol.fields[protocol.sourceField].position+6];

            // Now save the data
            this.UpdatePGN( protocol, pgnNo, pgnName, instance, source, device, message, sourceAddress );

            if ( trace )
            {
                console.log( "<-- ServerConnection.ProcessPGNMessage" );
//                this.crash.crash();
            }
        } // end if ( fields[0] == 2 )
    } // end function ProcessPGNMessage

    /*********************************************************************************************
     * function UpdatePGN
     * This procedure updates all the fields from the message in the database, overwriting
     * previous field data. If this is the first time the PGN has been received for the instance
     * (and source) then a new entry is created.
     * The fields are stored as they are received, the resolution and offset are applied by the
     * Database package when the data is retrieved.
     *********************************************************************************************/
    UpdatePGN( protocol, pgnNo, pgnName, instance, source, device, msg, address) {
        const trace = false; //( pgnName.localeCompare( "130921_MT2" ) == 0 );
        if ( trace )
        {
            console.log( "--> ServerConnection.UpdatePGN Received PGN " + pgnNo + ", instance = " + instance + ", source = " + source );
            console.log( "    msg = " + JSON.stringify( msg ));
            console.log( "    protocol = " + JSON.stringify( protocol ));
        }

        // Get a pointer to the PGN in the database for the correct instance / source
        var pgnSpecific = pgns[pgnName];
        if ( !pgnSpecific )
        {
            pgns[pgnName] = {};
            pgnSpecific = pgns[pgnName];
        };
        var savedPgnData = pgnSpecific[instance.toString()];
        if ( !savedPgnData )
        {
            pgnSpecific[instance.toString()]= {};
            savedPgnData = pgnSpecific[instance.toString()];
        };
        if ( source >= 0 )
        {
            savedPgnData = savedPgnData[source.toString()];
            if ( !savedPgnData )
            {
                pgnSpecific[instance.toString()][source.toString()] = {};
                savedPgnData = pgnSpecific[instance.toString()][source.toString()];
            };
        };
        // now save the data
        let makeMeCrash = false;
        for ( var x in protocol.fields )
        {
            if ( trace )
                console.log( "    protocol.fields["+x+"] = " + JSON.stringify( protocol.fields[x] ));
            var index = protocol.fields[x].position;
            // Read the new data from the incoming PGN message
            var valueInPgn = parseInt(msg.mData[index+6]);
            if ( trace)
            {
                console.log( "    getting field " + x + ", value = " + valueInPgn + ", protocol = " + JSON.stringify( protocol.fields[x] ));
                if ( ( x.localeCompare( "Current") == 0 ) && ( valueInPgn > 0 ) )
                    makeMeCrash = true;
            }
            // This is where the field data is stored in the pgn database.
            savedPgnData[x] = valueInPgn;
        } // end for loop
        savedPgnData.device = device;
        savedPgnData.timestamp = new Date();
        savedPgnData.msg = msg;
        if ( trace )
        {
            console.log( "*****   savedPgnData = " + JSON.stringify( savedPgnData ));
            console.log( "*****   timestamp = "+ savedPgnData.timestamp );
            console.log( "<-- ServerConnection.UpdatePGN" );
        }
        if ( makeMeCrash )
        {
            console.log( "*****   pgnSpecific = " + JSON.stringify( pgns["130921_MT2"]) );
            console.log( protocol.makeMeCrash.crash );
        }

    } // end function UpdatePGN

    /*********************************************************************************************
     * function IsConnected<br>
     * <code> mConnectionState</code> == <b>kConnected</b>.
     *********************************************************************************************/
    IsConnected() {
        return ( this.mConnectionState === ConnectionStateEnum.CONNECTED );
    } // end function IsConnected

    /*********************************************************************************************
     * function Enqueue<br>
     * Called to send a message to N2KServer. The message is placed in a
     * queue, and transmitted later by the SendQueuedMessages function.
     *********************************************************************************************/
    Enqueue( msg ) {
        // console.log( "--> ServerConnection.Enqueue, msg = " + JSON.stringify( msg ));
        if ( this.IsConnected() )
            this.mOutboundMessageQueue.push(msg);
        // console.log( "<-- ServerConnection.Enqueue, " + this.mOutboundMessageQueue.length + " messages in queue." );
    } // end function Enqueue

    /**********************************************************************************************
     * function SendQueuedMessages<br>
     * Send any outgoing messages that are queued in <code>mOutboundMessageQueue</code>.
     **********************************************************************************************/
    SendQueuedMessages(serverConnection) {
        try
        {
            if ( serverConnection.IsConnected() )
            {
                var now = new Date();
                if ( serverConnection.mOutboundMessageQueue.length > 0 )
                {
                // console.log( "--> ServerConnection.SendQueuedMessages, length = "
                           // + serverConnection.mOutboundMessageQueue.length );
                    var byteBuffer = Buffer.alloc(0);
                    while ( serverConnection.mOutboundMessageQueue.length > 0 )
                    {
                        try
                        {
                            var msg = serverConnection.mOutboundMessageQueue.shift();
                            // console.log( "--> Send Queued Message " + JSON.stringify( msg ));
                            byteBuffer = serverConnection.AddToByteArray( byteBuffer, msg );
                        }
                        catch( error )
                        {
                            console.log( "Error in ServerConnection.SendQueuedMessages, " + error );
                            this.crash.crash();
                        }
                    } // end while loop

                    //byteBuffer.position = 0;
                    serverConnection.SendByteArray( byteBuffer );
                 // console.log( "<-- ServerConnection.SendQueuedMessages" );
                }
                // else if ( now.getTime() - mLastMessageSentAt.getTime() > 5 * TimeConstants.MINUTES )
                // {
                   // var tickMessage : Message = new Message([ "TICK" ], true );
                   // Send( tickMessage );
                // }
            }
            // console.log( "<-- ServerConnection.SendQueuedMessages" );
        }
        catch ( e )
        {
            console.log( "<-- ServerConnection.SendQueuedMessages, caught error " + e );
        }
    } // end function SendQueuedMessages

    /*****************************************************************************************
     * function AddToByteArray
     * @param byteBuffer : Buffer
     * @param msg        : BasePGN
     *****************************************************************************************/
    AddToByteArray( byteBuffer, msg ) {
        // console.log( "--> ServerConnection.AddToByteArray" );
        // console.log( "    msg = " + JSON.stringify( msg ));
        var newByteBuffer;
        if ( msg.mIsControlMessage )
        {
            // console.log( "    Control message" );
            var controlMessage = msg.mData.join( "\t" );
            newByteBuffer = Buffer.concat( [byteBuffer, Buffer.from(controlMessage), Buffer.from([0]) ]);
        }
        else if ( this.mInBinaryMode )
        {
         // console.log( "    Binary message" );
            newByteBuffer = Buffer.concat( [ byteBuffer, msg.GetBinaryByteArray() ] );
        }
        else
        {
            // ASCII Message
            // console.log( "    ASCII message" );
            var asciiMessage = msg.ToStrings().join( "\t" );
            newByteBuffer = Buffer.concat( [byteBuffer, Buffer.from(asciiMessage), Buffer.from([0]) ]);
        }
        // console.log( "    newByteBuffer = " + JSON.stringify(newByteBuffer.toJSON(newByteBuffer)) );
        // console.log( "<-- ServerConnection.AddToByteArray" );
        return newByteBuffer;
    } // end function AddToByteArray

    /*****************************************************************************************
     * function Send<br>
     * Called to transmit a message to N2KServer
     *****************************************************************************************/
    Send( msg ) {
        // console.log( "--> ServerConnection.Send, msg = " + JSON.stringify( msg ));
        try
        {
            var byteBuffer = Buffer.alloc(0);
            byteBuffer = this.AddToByteArray( byteBuffer, msg );
            //console.log( "    calling SendByteArray with " + JSON.stringify(byteBuffer.toJSON(byteBuffer)) );
            this.SendByteArray( byteBuffer );
        }
        catch ( pError )
        {
            console.log("ServerConnection["+this.mBusIdentifier+"] Error : Socket error transmitting data");
        }
        // console.log( "<-- ServerConnection.Send" );
    } // end function Send

    /*****************************************************************************************
     * function SendByteArray
     * @param byteBuffer : Buffer
     *****************************************************************************************/
    SendByteArray( byteBuffer ) {
    // console.log( "--> ServerConnection.SendByteArray, this.client = " + this.client );
        try
        {
            if ( this.client )
            {
                // console.log( "    Sent message to N2KServer " + JSON.stringify(byteBuffer.toJSON(byteBuffer)) );
                // console.log( "        " + byteBuffer );
                this.client.write( byteBuffer );
                this.mLastMessageSentAt = new Date();
            }
        }
        catch ( error )
        {
            console.log( "Error in ServerConnection.SendByteArray, " + error.message );
        }
        // console.log( "<-- ServerConnection.SendByteArray" );
    } // end function SendByteArray

    /*****************************************************************************************
     * function Reconnect<br>
     *****************************************************************************************/
    Reconnect( serverConnection ) {
        //console.log( "--> ServerConnection.Reconnect, state = "  + serverConnection.mConnectionState );
        if ( serverConnection.mConnectionState === ConnectionStateEnum.DISCONNECTED )
            serverConnection.Connect(serverConnection);
            // console.log( "<-- ServerConnection.Reconnect" );
    } // end function Reconnect

    /*****************************************************************************************
     * function CheckForLostConnection<br>
     *****************************************************************************************/
    CheckForLostConnection( serverConnection ) {
        // console.log( "--> ServerConnection.CheckForLostConnection" );
        var now = new Date();
        if ( now.getTime() - serverConnection.mLastDataMessageReceived.getTime() > LOST_DATA_TIMEOUT )
        {
            console.log( "    Disconnect because last message was received more than 30 seconds ago." );
            serverConnection.client.end();
            serverConnection.mConnectionState = ConnectionStateEnum.DISCONNECTED;
            serverConnection.mLastDataMessageReceived = now;
        }
        // console.log( "<-- ServerConnection.CheckForLostConnection" );
    } // end function CheckForLostConnection

    /*****************************************************************************************
     * function GetDataByType
     * @param byteBuffer : ByteArray - we will read the data from the beginning of byteBuffer
     * @param type : String - the data type that we will be reading. This determines how many
     *               bits we will read.
     * @param length - This is only for variable length strings
     * @return int, uint or String, depending on data type
     *****************************************************************************************/
    GetDataByType( byteBuffer , type , length ) {
        /** charType is used in String and gsmOperatorName */
        var charType = "us-ascii";
        var noOfBytes;
        // console.log( "--> ServerConnection.GetDataByType, type = " + type );
        switch ( type )
        {
            // Signed Numbers
            case "int8" :
                return( this.GetSignedBits( byteBuffer, 8 ));
                break;
            case "int16" :
                return( this.GetSignedBits( byteBuffer, 16 ));
                break;
            case "int24" :
                return( this.GetSignedBits( byteBuffer, 24 ));
                break;
            case "int32" :
                return( this.GetSignedBits( byteBuffer, 32 ));
                break;
            case "int64" :
                return( this.GetLargeNumber( byteBuffer, 8 ));
                break;
            // Unsigned Numbers
            case "uint1" : return( this.GetUnsignedBits( byteBuffer, 1 ));
                break;
            case "uint2_65030" :
            case "uint2s" :
            case "uint2" :
                return( this.GetUnsignedBits( byteBuffer, 2 ));
                break;
            case "uint3" :
                return( this.GetUnsignedBits( byteBuffer, 3 ));
                break;
            case "uint4" :
                return( this.GetUnsignedBits( byteBuffer, 4 ));
                break;
            case "uint5" :
                return( this.GetUnsignedBits( byteBuffer, 5 ));
                break;
            case "uint6" :
                return( this.GetUnsignedBits( byteBuffer, 6 ));
                break;
            case "uint7" :
                return( this.GetUnsignedBits( byteBuffer, 7 ));
                break;
            case "uint8" :
            case "uint8s" :
                return( this.GetUnsignedBits( byteBuffer, 8 ));
                break;
            case "uint9" :
                return( this.GetUnsignedBits( byteBuffer, 9 ));
                break;
            case "uint10" :
                return( this.GetUnsignedBits( byteBuffer, 10 ));
                break;
            case "uint11" :
                return( this.GetUnsignedBits( byteBuffer, 11 ));
                break;
            case "uint12" :
                return( this.GetUnsignedBits( byteBuffer, 12 ));
                break;
            case "uint13s" :
                return( this.GetUnsignedBits( byteBuffer, 13 ));
                break;
            case "bits16" :
            case "uint16_65030" :
            case "uint16withInfinite" :
            case "uint16" :
                return( this.GetUnsignedBits( byteBuffer, 16 ));
                break;
            case "uint16_reversed" :
                // Carling has some messages where the high byte of a 16 bit unsigned integer
                // preceeds the low byte.
                var hiByte = this.GetUnsignedBits( byteBuffer, 8 );
                var loByte = this.GetUnsignedBits( byteBuffer, 8 );
                return hiByte*256 + loByte;
                break;
            case "uint21" :
                return( this.GetUnsignedBits( byteBuffer, 21 ));
                break;
            case "pgn24" :
            case "uint24" :
                return( this.GetUnsignedBits( byteBuffer, 24 ));
                break;
            case "uint27" :
                return( this.GetUnsignedBits( byteBuffer, 27 ));
                break;
            case "uint29" :
                return( this.GetUnsignedBits( byteBuffer, 29 ));
                break;
            case "uint32_65030" :
            case "uint32" :
                return( this.GetUnsignedBits( byteBuffer, 32 ));
                break;
            case "uint40" :
                return( this.GetLargeUnsignedNumber( byteBuffer, 5 ));
                break;
            case "uint48" :
                return( this.GetLargeUnsignedNumber( byteBuffer, 6 ));
                break;
            case "uint64" :
                return( this.GetLargeUnsignedNumber( byteBuffer, 8 ));
                break;

            // String
            case "string" :
            case "string16" :
                if ( length > 0 )
                    noOfBytes = length;
                else
                {
                    noOfBytes = byteBuffer.readUnsignedByte()-2;
                    var controlByte = byteBuffer.readUnsignedByte();
                    if ( controlByte == 0 )
                        charType = "unicode";
                }
                if ( 0 < noOfBytes && noOfBytes <= byteBuffer.bytesAvailable )
                    return( byteBuffer.readMultiByte( noOfBytes, charType ));
                else
                    return( "" );
                break;

            // GSM PhoneNo
            case "gsmPhoneNo" :
                noOfBytes = byteBuffer.ReadUnsignedByte();
                if ( noOfBytes == 0 )
                    return "";
                var typeOfAddress   = byteBuffer.ReadUnsignedByte();
                var phoneNumber     = "";
                for ( let index=0; index<noOfBytes; index++ )
                {
                    var digit = GetUnsignedBits( byteBuffer, 4 );
                    phoneNumber += digit.toString();
                    if ( noOfBytes == 11 )
                    {
                        if ( [ 0,3,6 ].indexOf( index ) >= 0 )
                            phoneNumber += "-";
                    }
                }
                if ( noOfBytes % 2 != 0 )
                    GetUnsignedBits( byteBuffer, 4 );
                return phoneNumber;

            // GSM Operator Name
            case "gsmOperatorName" :
                var networkOperatorMode   = byteBuffer.ReadUnsignedByte();
                var networkOperatorFormat = byteBuffer.ReadUnsignedByte();
                if ( networkOperatorFormat == 0 )
                {
                    // Alphanumeric Long Form
                    noOfBytes = byteBuffer.ReadUnsignedByte();
                    return byteBuffer.ReadMultiByte( noOfBytes, charType );
                }
                else
                    return "Unknown";

            // GSM User Data (GSM Text Message)
            case "gsmUserData":
                var protocolIdentifier = byteBuffer.ReadUnsignedByte();
                var dataEncodingScheme = byteBuffer.ReadUnsignedByte();
                noOfBytes = byteBuffer.readUnsignedByte();
                if ( dataEncodingScheme <= 3 )
                {
                    // GSM 7 bit protocol
                    var stringBytes = new ByteArray();
                    var shiftedByte = 0;
                    var noOfShiftedBits = 0;
                    while ( stringBytes.length < noOfBytes )
                    {
                        var bb = byteBuffer.ReadUnsignedByte();
                        //console.log( " read " + HexString(bb) );
                        bb = (bb<<noOfShiftedBits) | shiftedByte; // only works if unused bits are 0
                        shiftedByte = bb>>7;
                        noOfShiftedBits++;
                        bb &= 0x7F;
                        //console.log( " bb = " + HexString(bb) + ", shiftedByte = " + HexString(shiftedByte) );
                        stringBytes.writeByte( bb );
                        if ( noOfShiftedBits == 7 )
                        {
                            stringBytes.writeByte( shiftedByte );
                            shiftedByte = 0;
                            noOfShiftedBits = 0;
                        }
                    } // end while loop
                    stringBytes.position = 0;
                    return stringBytes.ReadMultiByte( noOfBytes, charType );
                }
                else if ( 8 <= dataEncodingScheme && dataEncodingScheme <= 12 )
                {
                    console.log( "Non 7-bit GSM Protocol: Unicode Data encoding scheme = " + dataEncodingScheme );
                    return byteBuffer.ReadMultiByte( noOfBytes, "unicode" );
                }
                else
                {
                    console.log( "Non 7-bit GSM Protocol: ASCII Data encoding scheme = " + dataEncodingScheme );
                    return byteBuffer.ReadMultiByte( noOfBytes, "us-ascii" );
                }

            default :
                console.log( "ServerConnection.GetDataByType cannot find data type " + type );
        } // end switch
    } // end function GetDataByType

    /*********************************************************************
     * function GetUnsignedBits
     * @param byteArray : ByteArray
     *********************************************************************/
    GetUnsignedBits( byteArray, noOfBits ) {
        // console.log( "--> ServerConnection.GetUnsignedBits, noOfBits = " + noOfBits );
        var result = 0;
        //console.log( "    this.mBitsLeftOver = " + this.mBitsLeftOver + ", this.mValueLeftOver = " + this.mValueLeftOver );
        while ( this.mBitsLeftOver < noOfBits )
        {
            this.mValueLeftOver = this.mValueLeftOver + ( byteArray.ReadUnsignedByte() << this.mBitsLeftOver );
            this.mBitsLeftOver += 8;
        }
        // console.log( "       this.mBitsLeftOver = " + this.mBitsLeftOver + ", this.mValueLeftOver = " + this.mValueLeftOver );
        if ( noOfBits == this.mBitsLeftOver )
        {
            result = this.mValueLeftOver;
            this.mValueLeftOver = 0;
            this.mBitsLeftOver = 0;
        }
        else if ( noOfBits <= this.mBitsLeftOver )
        {
            // mask off the least significant noOfBits
            result = this.mValueLeftOver & ( (1<<noOfBits) - 1 );
            // move the bits left over down to the least significant
            this.mValueLeftOver = this.mValueLeftOver >> noOfBits;
            this.mBitsLeftOver -= noOfBits;
        }
        // console.log( "       this.mBitsLeftOver = " + this.mBitsLeftOver + ", this.mValueLeftOver = " + this.mValueLeftOver );
        // console.log( "<-- ServerConnection.GetUnsignedBits, result = " + result );
        return result;
    } // end function GetUnsignedBits

    /*********************************************************************
     * function GetSignedBits
     * @param byteArray : ByteArray
     *********************************************************************/
    GetSignedBits( byteArray, noOfBits ) {
        // console.log( "--> ServerConnection.GetSignedBits, noOfBits = " + noOfBits );
        var result;
        var byteRead;
        var mask;
        while ( this.mBitsLeftOver < noOfBits )
        {
            byteRead = byteArray.ReadUnsignedByte();
            this.mValueLeftOver = this.mValueLeftOver + ( byteRead << this.mBitsLeftOver );
            this.mBitsLeftOver += 8;
        }
        // test to see if this is a negative number
        byteRead = ( this.mValueLeftOver >> (noOfBits-1));
        var negative = ((byteRead & 0x01)==0x01);
        if ( noOfBits == this.mBitsLeftOver )
        {
            result = this.mValueLeftOver;
            this.mValueLeftOver = 0;
            this.mBitsLeftOver = 0;
        }
        else if ( noOfBits <= this.mBitsLeftOver )
        {
            mask = ~(-1 << noOfBits);
            result = this.mValueLeftOver & mask;
            // move the bits left over down to the least significant
            this.mValueLeftOver = this.mValueLeftOver >> noOfBits;
            this.mBitsLeftOver -= noOfBits;
        }
        // if the value is negative, fill in all the most significant
        // bits with 1's.
        if ( negative && result > 0 )
        {
            mask = (-1<<noOfBits);
            result = result | mask;
        }
        // console.log( "<-- ServerConnection.GetSignedBits, result = " + result );
        return result;
    } // end function GetSignedBits

    /*********************************************************************
     * function GetLargeNumber
     * On entry bitsLeftOver must be zero, i.e. we can only handle 64
     * bit integers that are on a byte boundary
     * @param byteArray : ByteArray
     *********************************************************************/
    GetLargeNumber( byteArray, noOfBytes ) {
        var result = 0;
        var byteRead;
        var multiplier = 1;
        var bytes = new Array(noOfBytes);

        if ( mBitsLeftOver != 0 )
        {
            trace( "Cannot read Binary Message with Large Integer not on byte boundary" );
        }

        for ( let i=0; i<noOfBytes; i++ )
            bytes[i] = byteArray.readUnsignedByte();
        // test to see if this is a negative number
        var negative = ((bytes[noOfBytes-1] & 0x80) != 0 );
        if ( negative )
        {
            // add one and negate
            var carry = true;
            for ( let i=0; i<noOfBytes; i++ )
            {
                bytes[i] = (~bytes[i]) & 0xFF;
                if ( carry )
                    bytes[i]++;
                carry = ( bytes[i] > 0xFF );
                bytes[i] = bytes[i] & 0xFF;
            } // end for loop
        } // end if

        // gather up the pieces
        for ( let i=noOfBytes-1; i>=0; i-- )
            result = result*256+bytes[i];

        if ( negative )
            result = -result;

        mValueLeftOver = 0;
        mBitsLeftOver = 0;
        return result;
    } // end function GetLargeNumber

    /*********************************************************************
     * function GetLargeUnsignedNumber
     * On entry bitsLeftOver must be zero, i.e. we can only handle 64
     * bit integers that are on a byte boundary
     * @param byteArray : ByteArray
     *********************************************************************/
    GetLargeUnsignedNumber( byteArray, noOfBytes ) {
        var result = 0;
        var byteRead;
        var multiplier = 1;
        var bytes = new Array(noOfBytes);

        if ( mBitsLeftOver != 0 )
        {
            trace( "Cannot read Binary Message with Large Unsigned Integer not on byte boundary" );
        }

        for ( let i=0; i<noOfBytes; i++ )
            bytes[i] = byteArray.readUnsignedByte();

        // gather up the pieces
        for ( let i=noOfBytes-1; i>=0; i-- )
            result = result*256+bytes[i];

        mValueLeftOver = 0;
        mBitsLeftOver = 0;
        return result;
    } // end function GetLargeUnsignedNumber

    /*********************************************************************************************/

} // end class ServerConnection

/*************************************************************************************************/
console.log( "<-- constructing ServerConnection" );

module.exports = { ServerConnection: ServerConnection, ConnectionStateEnum };


// eof
