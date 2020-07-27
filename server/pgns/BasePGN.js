// File: server/pgns/BasePGN.js
// Note: Base Messaging Format Types for NMEA2000 Parameter Group Numbers
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing class BasePGN" );

const ByteArray     = require( '../ByteArray' ).ByteArray;
const Globals       = require( '../Globals' );

// ___ devices package modules __
const Bus           = require( '../devices/Bus' );
const RangeCheckers = require( './RangeCheckers' );

// Binary messages contain the type of message in bits 2..0 of the first
// byte of the header. These are the meanings of these bits.
 var MessageTypeEnum = {
     SINGLE_FRAME         : 1,
     FAST_PACKET          : 2,
     TRANSPORT_PROTOCOL   : 3
 };

var badFieldErrorCount = 999;

/*************************************************************************************************
 * class BasePGN
 *************************************************************************************************/
class BasePGN {
    
    /*********************************************************************************************
     * Constructor
     * @param fieldData : Array
     *********************************************************************************************/
    constructor( fieldData, isControlMessage, busIdentifier=Bus.BusEnum.UNSPECIFIED ) {
        if ( fieldData == null )
            fieldData = [];
        this.mData = fieldData;
        this.mPgnName = fieldData[1];
        this.mPgnNo = parseInt(fieldData[1]);
        if ( !isControlMessage )
            this.mData[1] = this.mPgnNo.toString();
        this.mIsControlMessage = isControlMessage;
        this.mSourceAddress = parseInt( fieldData[2] );
        this.mDestAddress = parseInt( fieldData[3] );
        this.mBusIdentifier = busIdentifier;
        var protocol = Globals.Protocols[this.mPgnName];
        if ( protocol )
            this.mMetadata = JSON.parse( JSON.stringify( Globals.Protocols[this.mPgnName] ));
        else
            this.mMetadata = { name : this.mPgnName, fields:[] };
        this.mTxValueLeftOver = 0;
        /** The number of bits in mTxValueLeftOver that are valid */
        this.mTxBitsLeftOver = 0;
    } // end constructor

    /*********************************************************************************************
     * Set the value of a field to a String.
     * @param name - the name of the field as defined in <code>Protocol.as</code>.
     * @param data - the value to set
     *********************************************************************************************/
    SetField( name, data ) {
        if ( this.mMetadata.fields.length == 0 )
            // mMetadata has not been initialized yet
            return;

        var fieldInfo = this.mMetadata.fields[name];
        if ( fieldInfo == null )
        {
            console.log("Message.SetField : Bad field "+name+" for pgn "+this.mMetadata.name);
            return;
        }
        this.mData[fieldInfo.position] = data;
    } // end function SetField

    /*****************************************************************************************
     * Set the value of a numerical field
     * @param name - the name of the field as defined in <code>Protocol.js</code>.
     * @param data - the numerical value to store in the correct units for the PGN.<br>
     * The offset and scale defined in the PGN will be applied to this value.<br>
     * <code>NaN</code> results in the Data Unavailable value being stored in the message.
     * @see com.maretron.n2kCommon.Protocol
     *****************************************************************************************/
    SetNumberField( name, data ) {
        var fieldInfo = this.mMetadata.fields[name];
        if ( isNaN( data ) )
            this.SetField( name, this.GetDataNotAvailable( fieldInfo.type ));
        else
        {
            var scaledData = data;
            if ( !isNaN( fieldInfo.offset ))
                scaledData += fieldInfo.offset;
            if ( !isNaN( fieldInfo.resolution ))
                scaledData /= fieldInfo.resolution;
            scaledData = Math.round( scaledData );
            this.SetField( name, scaledData.toString() );
        }
    } // end function SetNumberField

    /*****************************************************************************************
     * function GetDataNotAvailable
     * @see NMEA2000 These values come from NMEA 2000 APP-B.4 (Data Type) 2.000 Release.pdf
     *****************************************************************************************/
    GetDataNotAvailable( type ) {
        switch ( type )
        {
            // Signed Numbers
            case "int8" :
                return "127";
            case "int16" :
                return "32767";
            case "int24" :
                return "8388607";
            case "int32" :
                return "2147483647";
            case "int64" :
                return "9223372036854775807";
            // Bit Fields
            case "uint1" :
            case "uint2s" :
            case "uint8s" :
            case "uint13s" :
            case "bits16" :
                // return 0s for bit fields
                return "0";
            // Unsigned Numbers
            case "uint2_65030" :
            case "uint2" :
                return "3";
            case "uint3" :
                return "7";
            case "uint4" :
                return "15"
            case "uint5" :
                return "31";
            case "uint6" :
                return "63";
            case "uint7" :
                return "127";
            case "uint8" :
                return "255";
            case "uint9" :
                return "511";
            case "uint10" :
                return "1023";
            case "uint11" :
                return "2047";
                break;
            case "uint12" :
                return "4095";
            case "uint16_65030" :
            case "uint16withInfinite" :
            case "uint16" :
            case "uint16_reversed" :
                return "65535";
            case "uint21" :
                return "2097151";
            case "pgn24" :
            case "uint24" :
                return "16777215";
            case "uint27" :
                return "134217727";
            case "uint29" :
                return "536870911";
            case "uint32_65030" :
            case "uint32" :
                return "4294967295";
            case "uint40" :
                return "1099511627775";
            case "uint48" :
                return "281474976710655";
            case "uint64" :
                return "18446744073709551615";

            // String
            case "string" :
            case "string16" :
                return "";
                break;
            default :
                console.log( "RawMessage.GetDataNotAvailable cannot find data type " + type );
        } // end switch
        return "";
    } // end function GetDataNotAvailable

    /*****************************************************************************************
     * Get the raw field
     * @return <code>null</code> if the field doesn't exist.
     *****************************************************************************************/
    GetField( name ) {
        var fieldInfo = this.mMetadata.fields[name];
        if ( fieldInfo == null )
        {
            console.log("Message.GetField : Bad field "+name+" for message "+this.mMetadata.name);
            return null;
        }
        return this.mData[fieldInfo.position];
    } // end function GetField

    /*********************************************************************************************
     * Retrieve a numeric value from a field in the message.
     * @param name - this is the identity of the field in the message, either as the actual
     *               name of the field as defined in <code>Protocol</code> or the numeric
     *               index of the field.
     * @return
     * <li><code>undefined</code> if the field doesn't exist or the number is outside the
     * defined range.</li>
     * <li><code>NaN</code> if "outOfRange" or "notAvailable" or "reserved".</li>
     * <li><code>Infinity</code> if the number represents infinity.</li>
     * <li>The number if it is in range.</li>
     * @see Protocol.rangeCheckers() <code>Protocol</code> for the definitions of these terms.
     *********************************************************************************************/
    GetNumberFromField( name ) {
        // console.log( "--> BasePGN.GetNumberFromField, name = " + name );
        var fieldInfo = this.mMetadata.fields[name];
        //console.log( "    fieldInfo = " + JSON.stringify( fieldInfo ));
        if ( fieldInfo == null )
        {
            if ( badFieldErrorCount++ >= 1000 )
            {
                console.log("--- BasePGN.GetNumberFromField : Bad field '"+name+"' for message "+this.mMetadata.name);
                badFieldErrorCount = 0;
            }
            return undefined;
        }
        var data = this.mData[fieldInfo.position+6];
        // console.log( "    data = " + JSON.stringify( data ));
        if( data == undefined )
            return undefined;

        var n = parseFloat(data);
        if ( isNaN(n) )
            return undefined;
        // range checkers, if there is no corresponding range checker for this data type, we always use TRUE
        var rangeCheck = RangeCheckers.CheckEnum.TRUE;
        if ( typeof fieldInfo.rangeChecker === "function" )
            rangeCheck = fieldInfo.rangeChecker(n);

        if ( rangeCheck == RangeCheckers.CheckEnum.FALSE )
            return undefined;
        if ( rangeCheck == RangeCheckers.CheckEnum.OUT_OF_RANGE || rangeCheck == RangeCheckers.CheckEnum.NOT_AVAILABLE || rangeCheck == RangeCheckers.CheckEnum.RESERVED )
            return NaN;
        if ( rangeCheck == RangeCheckers.CheckEnum.INFINITE )
            return Number.POSITIVE_INFINITY;

        // to get here, n must be a well behaved number, in range
        var resolution = fieldInfo.resolution;
        if ( !isNaN(resolution) )
            n *= resolution;

        var offset = fieldInfo.offset;
        if ( !isNaN(offset) )
            n -= offset;

        // console.log( "<-- BasePGN.GetNumberFromField, return = " + n );
        return n;
    } // end function GetNumberFromField

    /*********************************************************************************************
     * Retrieve the contents of a string field.
     * @return <code>null</code> if the field doesn't exist.
     *********************************************************************************************/
    GetStringField( name ) {
        // TODO Decode HEX string data
        return this.GetField( name );
    } // end function GetStringField

    /*********************************************************************************************
     * Enqueue this message for transmission on the bus or busses.
     * @param device - may be <code>null</code>, in which case this will be sent as a
     *                 broadcast message to all devices.
     * @return 0 if command was sent on primary bus<br>
     *         1 if command was sent on secondary bus<br>
     *         2 if command was sent on both busses
     *********************************************************************************************
    Send( device = null ) {
        //var app = N2KView.instance;
        var sc1 = ServerManager.sc1;
        var sc2 = ServerManager.sc2;
        var busUsed = Bus.BusEnum.UNSPECIFIED;
        if ( device == null )
        {
            // Globally Addressed messages are sent on both busses
            this.mDestAddress = 255;
            if ( sc2 )
            {
                var copy = this.Clone();
                copy.mSourceAddress = 255;
                sc2.Enqueue(copy);
                busUsed = Bus.BusEnum.SECONDARY;
            }

            if ( sc1 )
            {
                this.mSourceAddress = 255;
                sc1.Enqueue(this);
                busUsed += 1; // will become PRIMARY or BOTH
            }

        }
        else if ( sc1 && device.mPrimaryBus.mAddress != Bus.BusEnum.UNSPECIFIED
               && sc2 && device.mSecondaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
        {
            // We have a choice of busses on which to send the message,
            // and need to choose one.
            var now         = new Date();
            var sc1IdleTime = Number.MAX_VALUE;
            if ( device.mPrimaryBus.mLastPGNTime != null )
                sc1IdleTime = now.getTime() - device.mPrimaryBus.mLastPGNTime.getTime();
            var sc2IdleTime = Number.MAX_VALUE;
            if ( device.mSecondaryBus.mLastPGNTime != null )
                sc2IdleTime = now.getTime() - device.mSecondaryBus.mLastPGNTime.getTime();
            if ( device.mActiveBus == Bus.PRIMARY )
            {
                if ( sc1IdleTime < 40*TimeConstants.SECONDS )
                {
                    // choose the primary bus
                    this.mDestAddress = device.mPrimaryBus.mAddress;
                    this.mSourceAddress = 255;
                    sc1.Enqueue(this);
                    busUsed = Bus.PRIMARY;
                }
                else
                {
                    // switch to the secondary bus
                    device.mActiveBus = Bus.SECONDARY;
                    this.mDestAddress = device.mSecondaryBus.mAddress;
                    this.mSourceAddress = 255;
                    sc2.Enqueue(this);
                    busUsed = Bus.SECONDARY;
                }
            }
            else if ( device.mActiveBus == Bus.SECONDARY )
            {
                if ( sc2IdleTime < 40*TimeConstants.SECONDS )
                {
                    // choose the secondary bus
                    this.mDestAddress = device.mSecondaryBus.mAddress;
                    this.mSourceAddress = 255;
                    sc2.Enqueue(this);
                    busUsed = Bus.SECONDARY;
                }
                else
                {
                    // switch to the primary bus
                    device.mActiveBus = Bus.PRIMARY;
                    this.mDestAddress = device.mPrimaryBus.mAddress;
                    this.mSourceAddress = 255;
                    sc1.Enqueue(this);
                    busUsed = Bus.PRIMARY;
                }
            }
        }
        else if ( sc1 && device.mPrimaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
        {
            this.mDestAddress = device.mPrimaryBus.mAddress;
            this.mSourceAddress = 255;
            sc1.Enqueue(this);
            busUsed = Bus.BusEnum.PRIMARY;
        }
        else if ( sc2 && device.mSecondaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
        {
            this.mDestAddress = device.mSecondaryBus.mAddress;
            this.mSourceAddress = 255;
            sc2.Enqueue(this);
            busUsed = Bus.BusEnum.SECONDARY;
        }
        return busUsed;
    } // end function Send

    /*****************************************************************************************
     * Enqueue this message for transmission on a bus to a specific address.
     * @param sourceAddress - this would normally be <code>Device.gOwnDevice.mPrimaryBus.mAddress
     *   </code> or <code>Device.gOwnDevice.mSecondaryBus.mAddress</code>, but in the case of
     *   simulated devices, it would be the simulated address.<br>
     *  Setting the sourceAddress to 255 means that the IPG100 will replace it with the
     *  correct value for each bus.
     *****************************************************************************************
    SendOnBus( sourceAddress, destAddress, busIdentifier ) {
        try
        {
            //var serverManager = N2KView.instance.mServerManager;
            this.mSourceAddress = sourceAddress;
            this.mDestAddress = destAddress;
            if ( busIdentifier == Bus.PRIMARY )
            {
                var sc1 = ServerManager.sc1;
                if ( sc1 != null )
                    sc1.Enqueue(this);
            }
            else if ( busIdentifier == Bus.SECONDARY )
            {
                var sc2 = ServerManager.sc2;
                if ( sc2 != null )
                    sc2.Enqueue(this);
            }
        }
        catch ( e )
        {
            trace( "Exception in Message.SendOnBus" );
            trace( e );
            trace( e.getStackTrace() );
        }
    } // end function SendOnBus

    /*****************************************************************************************
     * Enqueue this message in the Transmission Controller for transmission on both busses.
     *****************************************************************************************
    SendToTransmissionController() {
        TransmissionController.Send( this );
    } // end function SendToTransmissionController

    /*****************************************************************************************
     * function GetBinaryByteArray<br>
     * convert the message to a byte array that can be transmitted using the Binary message
     * option.
     * @return ByteArray
     ******************************************************************************************/
    GetBinaryByteArray() {
        var TRACE = false; //( this.mPgnNo == 126208 );
        if ( TRACE )
            console.log( "--> BasePGN.GetBinaryByteArray, mPgnName = " + this.mPgnName );
        this.mTxValueLeftOver  = 0;
        this.mTxBitsLeftOver   = 0;
        // we need to do the dataBytes first so that we know the length to
        // work out the message type
        var dataPortion  = new ByteArray();
        var priority     = 7; // lowest priority
        var i;                 // loop variable
/*
        if ( mPGNNo === 126208 )
        {
            // PGN 129608 needs special treatment, since it represents a group of PGNs
            // 0. Request Group Function
            // 1. Command Group Function
            // 2. Acknowledge Group Function
            // 3. Read Fields Group Function
            // 4. Write Fields Group Function
            // 5. Write Fields Reply Group Function
            var groupFunctionCode = mData[6];
            switch ( groupFunctionCode )
            {
                case 0 :
                    // Request Group Function
                    var requestedPgn : uint = mData[7];
                    var requestedPgnMessageFormat : Object = ObjectUtil.Clone( Protocol.metadata[requestedPgn] );
                    if ( requestedPgnMessageFormat != null )
                    {
                        WriteUnsignedBits( dataPortion, groupFunctionCode, 8 );
                        WriteUnsignedBits( dataPortion, requestedPgn, 24 );
                        WriteUnsignedBits( dataPortion, mData[8], 32 ); // Transmission Interval (32 bits)
                        WriteUnsignedBits( dataPortion, mData[9], 16 ); // Transmission Interval Offset (16 bits)
                        var noOfPairsOfRequestedParameters : uint = mData[10];
                        WriteUnsignedBits( dataPortion, noOfPairsOfRequestedParameters, 8 ); // No of Pairs of Requested Parameters
                        for ( i=0; i<noOfPairsOfRequestedParameters; i++ )
                        {
                            var requestedFieldNo : uint = mData[11+2*i];
                            WriteUnsignedBits( dataPortion, requestedFieldNo, 8 ); // Field No
                            var requestedBytes   : ByteArray = GetBytesByType( mData[12+2*i],
                                requestedPgnMessageFormat.fieldArray[requestedFieldNo-1].type,
                                requestedPgnMessageFormat.fieldArray[requestedFieldNo-1].length );
                            // if the last field was incomplete, then complete the byte by padding with zeroes
                            if ( txBitsLeftOver > 0 )
                                WriteUnsignedBits( requestedBytes, 0, 8-txBitsLeftOver ); // Field No
                            dataPortion.writeBytes( requestedBytes );
                        } // end for loop
                    }
                    break;

                case 1 :
                    // Command Group Function
                    var commandedPgn : uint = mData[7];
                    const TRACE : Boolean = TRACE_COMMANDS && ([130839].indexOf(commandedPgn)>=0);
                    if ( TRACE )
                    {
                        trace( "--> RawMessage.GetBinaryByteArray, commandedPgn = " + commandedPgn );
                        Log.addMessage( "--> RawMessage.GetBinaryByteArray, commandedPgn = " + commandedPgn );
                        var mDataString : String = "    mData = ["+mData.join( ", " )+"]";
                        trace( mDataString );
                        Log.addMessage( mDataString );
                    }
                    if ( commandedPgn == 61184 ) // == 61184_MARETRON_HEADER
                    {
                        WriteUnsignedBits( dataPortion, groupFunctionCode, 8 );
                        WriteUnsignedBits( dataPortion, commandedPgn, 24 );
                        WriteUnsignedBits( dataPortion, mData[8], 4 ); // Priority
                        WriteUnsignedBits( dataPortion, mData[9], 4 ); // Reserved
                        WriteUnsignedBits( dataPortion, mData[10], 8 ); // No of Pairs of Commanded Parameters
                        WriteUnsignedBits( dataPortion, mData[11], 8 ); // Field No
                        WriteUnsignedBits( dataPortion, mData[12], 16 );
                        WriteUnsignedBits( dataPortion, mData[13], 8 ); // Field No
                        WriteUnsignedBits( dataPortion, mData[14], 16 );
                    }
                    else if ( commandedPgn == 126720 )
                    {
                        WriteUnsignedBits( dataPortion, groupFunctionCode, 8 );
                        WriteUnsignedBits( dataPortion, commandedPgn, 24 );
                        WriteUnsignedBits( dataPortion, mData[8], 4 ); // Priority
                        WriteUnsignedBits( dataPortion, mData[9], 4 ); // Reserved
                        WriteUnsignedBits( dataPortion, mData[10], 8 ); // No of Pairs of Commanded Parameters
                        WriteUnsignedBits( dataPortion, mData[11], 8 ); // Field No
                        WriteUnsignedBits( dataPortion, mData[12], 16 );
                        WriteUnsignedBits( dataPortion, mData[13], 8 ); // Field No
                        var productCode : uint = mData[14];
                        WriteUnsignedBits( dataPortion, productCode, 16 );
                        WriteUnsignedBits( dataPortion, mData[15], 8 ); // Field No
                        WriteUnsignedBits( dataPortion, mData[16], 16 );
                        var command : uint = mData[17];
                        WriteUnsignedBits( dataPortion, command, 8 ); // Field No
                        if ( productCode == ProductCodes.SMS100 )
                        {
                            // see SMS100 NMEA 2000 Maretron Proprietary PGN.doc under /products/SMS100
                            // for commands that may be used here
                            //trace( "Sending command 0x" + command.toString(16) + " to SMS100" );
                            if ( command == 0x34 )
                            {
                                WriteUnsignedBits( dataPortion, mData[18], 16 );
                            }
                            // for commands 0x32 and 0x36 there are no arguments to the 4th parameter
                        }
                        else
                        {
                            //trace( "Sending command 0x" + command.toString(16) + " to device with Product Code " + productCode );
                            WriteUnsignedBits( dataPortion, mData[18], 8 );
                        }
                    }
                    else if ( commandedPgn == 130835 ) // == SMS_TextMessagePGN.COMMANDED_PGN
                    {
                        WriteUnsignedBits( dataPortion, groupFunctionCode, 8 );
                        WriteUnsignedBits( dataPortion, commandedPgn, 24 );
                        WriteUnsignedBits( dataPortion, mData[8], 4 ); // Priority
                        WriteUnsignedBits( dataPortion, mData[9], 4 ); // Reserved
                        WriteUnsignedBits( dataPortion, mData[10], 8 ); // No of Pairs of Commanded Parameters
                        WriteUnsignedBits( dataPortion, mData[11], 8 ); // Field No
                        WriteUnsignedBits( dataPortion, mData[12], 8 );
                        WriteUnsignedBits( dataPortion, mData[13], 8 ); // Field No
                        dataPortion.writeBytes( GetBytesByType( mData[14], "string", 0 ) );
                        WriteUnsignedBits( dataPortion, mData[15], 8 ); // Field No
                        dataPortion.writeBytes( GetBytesByType( mData[16], "string16", 0 ) );
                    }
                    else
                    {
                        var commandedPgnMessageFormat : Object = ObjectUtil.Clone( Protocol.metadata[commandedPgn] );
                        if ( commandedPgnMessageFormat != null )
                        {
                            WriteUnsignedBits( dataPortion, groupFunctionCode, 8 );
                            WriteUnsignedBits( dataPortion, commandedPgn, 24 );
                            WriteUnsignedBits( dataPortion, mData[8], 4 ); // Priority
                            WriteUnsignedBits( dataPortion, mData[9], 4 ); // Reserved
                            var noOfPairsOfCommandedParameters : uint = mData[10];
                            WriteUnsignedBits( dataPortion, noOfPairsOfCommandedParameters, 8 ); // No of Pairs of Commanded Parameters
                            if ( TRACE )
                            {
                                trace( "    noOfPairsOfCommandedParameters = " + noOfPairsOfCommandedParameters );
                                Log.addMessage( "    noOfPairsOfCommandedParameters = " + noOfPairsOfCommandedParameters );
                            }
                            for ( i=0; i<noOfPairsOfCommandedParameters; i++ )
                            {
                                var fieldNo : uint = mData[11+2*i];
                                if ( TRACE )
                                    var traStr : String = "       fieldNo = " + fieldNo;
                                WriteUnsignedBits( dataPortion, fieldNo, 8 ); // Field No
                                if ( TRACE )
                                {
                                    traStr += ", data = " + mData[12+2*i]
                                            + ", type = " + commandedPgnMessageFormat.fieldArray[fieldNo-1].type
                                            + ", length = " + commandedPgnMessageFormat.fieldArray[fieldNo-1].length;
                                }
                                // At this point txBitsLeftOver == 0, because fieldNo ends on a byte boundary
                                var bytes   : ByteArray = GetBytesByType( mData[12+2*i],
                                    commandedPgnMessageFormat.fieldArray[fieldNo-1].type,
                                    commandedPgnMessageFormat.fieldArray[fieldNo-1].length );
                                if ( TRACE )
                                    traStr += ", txBitsLeftOver = " + txBitsLeftOver;
                                // if bytes is incomplete, then complete the byte by padding with zeroes
                                if ( txBitsLeftOver > 0 )
                                    WriteUnsignedBits( bytes, 0, 8-txBitsLeftOver );
                                bytes.position = 0;
                                if ( TRACE )
                                {
                                    traStr += ", bytes.length = " + bytes.length 
                                            + ", bytes[0] = 0x" + bytes.readUnsignedByte().toString(16);
                                    trace( traStr );
                                    Log.addMessage( traStr );
                                }
                                bytes.position = 0;
                                dataPortion.writeBytes( bytes );
                            } // end for loop
                        }
                        if ( TRACE )
                        {
                            var dataPortionStr : String =  "    dataPortion = " + ObjectUtil.StringOf(dataPortion);
                            trace( dataPortionStr );
                            Log.addMessage( dataPortionStr );
                        }
                    }
                    break;

                case 2 :
                    // Acknowledge Group Function
                    WriteUnsignedBits( dataPortion, groupFunctionCode, 8 );
                    WriteUnsignedBits( dataPortion, mData[7], 24 ); // Acknowledged PGN
                    WriteUnsignedBits( dataPortion, mData[8], 4 ); // PGN Error Code
                    WriteUnsignedBits( dataPortion, mData[9], 4 ); // Transmission Interval
                    // There is a special case where noOfPairsOfAcknowledgedParameters = 0xFF
                    //  which indicates that no fields follow, so make sure that we don't add
                    //  255 fields.
                    var noOfPairsOfAcknowledgedParameters : uint = mData[10];
                    WriteUnsignedBits( dataPortion, noOfPairsOfAcknowledgedParameters, 8 ); // No of Pairs of Commanded Parameters
                    if ( 0 < noOfPairsOfAcknowledgedParameters && noOfPairsOfAcknowledgedParameters < 0xFF )
                    {
                        for ( i=0; i<noOfPairsOfAcknowledgedParameters; i++ )
                            WriteUnsignedBits( dataPortion, mData[11+i], 4 ); // Parameter Error Code
                        // If we sent an odd number of error codes, pad the last byte
                        if ( noOfPairsOfAcknowledgedParameters % 2 == 1 )
                            WriteUnsignedBits( dataPortion, 0, 4 );
                    }
                    break;

                default :
                    Log.addMessage( "Cannot translate PGN 126208 with Group Function Code " + groupFunctionCode );
                    trace( "Cannot translate PGN 126208 with Group Function Code " + groupFunctionCode );
                    break;
            } // end switch statement
            priority = 3;
        }
        else
*/
        {
            if ( Globals.Protocols[this.mPgnName] )
            {
                // create a Clone of the Message Format from the database of message formats.
                // There are certain messages that require us to modify the protocol, and we 
                // must not change the original.
                let messageFormat = JSON.parse(JSON.stringify(Globals.Protocols[this.mPgnName]));
                if ( TRACE )
                {
                    console.log( "    messageFormat = " + JSON.stringify(messageFormat));
                    console.log( "    length = " + this.mData.length );
                }
                Object.values(messageFormat.fields).forEach( field => {
                    if ( TRACE )
                        console.log( "    storing " + this.mData[field.position] + " in " + JSON.stringify( field ));
                    if ( field.position < this.mData.length )
                    {
                        /** fieldBytes must be a Buffer for dataPortion.WriteBytes to work */
                        let fieldBytes = this.GetBytesByType( this.mData[field.position],
                            field.type,
                            field.length );
                        if ( TRACE )
                            console.log( "    fieldBytes = " + JSON.stringify(fieldBytes) );
                        dataPortion.WriteBytes( fieldBytes );
                    }
                });
                    
//                console.log( "    dataPortion = " + dataPortion.ToString() );
                priority = messageFormat.priority;
            }
            else 
                console.log( "    Cannot find Protocol for PGN " + this.mPgnName );
        }

        // always send redundant data bit = 0
        var messageType = MessageTypeEnum.FAST_PACKET;
        if ( this.mMetadata.singleFrame )
            messageType = MessageTypeEnum.SINGLE_FRAME;
        else if ( dataPortion.length > 223 )
            messageType = MessageTypeEnum.TRANSPORT_PROTOCOL;

        var byteArray = [];
        byteArray.push( 0xA5 );  // Binary Message Header
        if ( TRACE )
        {
            var byte1 = ( 0x80 + (priority<<4) + (messageType<<1) + ((this.mPgnNo & 0x10000) >> 16) ); // byte 1
            console.log( "    pgnNo = 0x" + this.mPgnNo.toString(16) );
            console.log( "    byte1 = 0x" + byte1.toString(16) );
        }
        byteArray.push( 0x80 + (priority<<4) + (messageType<<1) + ((this.mPgnNo & 0x10000) >> 16) ); // byte 1
        var pgn_pf = ( this.mPgnNo & 0xFF00) >> 8
        byteArray.push( pgn_pf ); // byte 2
        if ( pgn_pf <= 239 )
            byteArray.push( this.mDestAddress ); // byte 3 = dest address
        else
            byteArray.push ( this.mPgnNo & 0xFF ); // byte 3 = low order byte of PGN No
        byteArray.push( this.mSourceAddress ); // byte 4 = source address
        byteArray.push( dataPortion.length & 0xFF ); // byte 5
        if ( messageType == MessageTypeEnum.TRANSPORT_PROTOCOL )
            byteArray.push( (dataPortion.length & 0xFF00)>>8 ); // byte 6
        dataPortion.mContents.forEach( elem => 
                { byteArray.push( elem ) });
        if ( TRACE )
        {
            console.log( "    byteArray = " + byteArray );
            console.log( "<-- BasePGN.GetBinaryByteArray" );
        }
        return new Uint8Array(byteArray);
    } // end function GetBinaryByteArray

    /*****************************************************************************************
     * function GetBytesByType
     * @param data - could be <code>int</code> or <code>uint</code> or <code>String</code>.
     * @param type - name of data type (eg. "int8" )
     * @param length - only used for fixed length strings
     * @return Buffer
     *****************************************************************************************/
    GetBytesByType( data, type, length ) {
//        console.log( "--> BasePGN.GetBytesByType, data = " + data + ", type = " + type );
        var result = new ByteArray();
        switch ( type )
        {
            // Signed Numbers
            case "int8" :
                this.WriteSignedBits( result, data, 8 );
                break;
            case "int16" :
                this.WriteSignedBits( result, data, 16 );
                break;
            case "int24" :
                this.WriteSignedBits( result, data, 24 );
                break;
            case "int32" :
                this.WriteSignedBits( result, data, 32 );
                break;
            case "int64" :
                let lsb = data&0xFFFFFFFF;
                let usb = (data/0x100000000) & 0xFFFFFFFF;
                this.WriteSignedBits( result, lsb, 32 );
                this.WriteSignedBits( result, usb, 32 );
                break;
            // Unsigned Numbers
            case "uint1" :
                this.WriteUnsignedBits( result, data, 1 );
                break;
            case "uint2_65030" :
            case "uint2s" :
            case "uint2" :
                this.WriteUnsignedBits( result, data, 2 );
                break;
            case "uint3" :
                this.WriteUnsignedBits( result, data, 3 );
                break;
            case "uint4" :
                this.WriteUnsignedBits( result, data, 4 );
                break;
            case "uint5" :
                this.WriteUnsignedBits( result, data, 5 );
                break;
            case "uint6" :
                this.WriteUnsignedBits( result, data, 6 );
                break;
            case "uint7" :
                this.WriteUnsignedBits( result, data, 7 );
                break;
            case "uint8" :
            case "uint8s" :
                this.WriteUnsignedBits( result, data, 8 );
                break;
            case "uint9" :
                this.WriteUnsignedBits( result, data, 9 );
                break;
            case "uint10" :
                this.WriteUnsignedBits( result, data, 10 );
                break;
            case "uint11" :
                this.WriteUnsignedBits( result, data, 11 );
                break;
            case "uint12" :
                this.WriteUnsignedBits( result, data, 12 );
                break;
            case "uint13s" :
                this.WriteUnsignedBits( result, data, 13 );
                break;
            case "bits16" :
            case "uint16_65030" :
            case "uint16withInfinite" :
            case "uint16" :
                this.WriteUnsignedBits( result, data, 16 );
                break;
            case "uint16_reversed" :
                this.WriteUnsignedBits( result, (data/256)&0xFF, 8 );
                this.WriteUnsignedBits( result, (data&0xFF), 8 );
            case "uint21" :
                this.WriteUnsignedBits( result, data, 21 );
                break;
            case "pgn24" :
            case "uint24" :
                this.WriteUnsignedBits( result, data, 24 );
                break;
            case "uint27" :
                this.WriteUnsignedBits( result, data, 27 );
                break;
            case "uint29" :
                this.WriteUnsignedBits( result, data, 29 );
                break;
            case "uint32_65030" :
            case "uint32" :
                this.WriteUnsignedBits( result, data, 32 );
                break;
            case "uint40" :
                this.WriteUnsignedBits( result, data, 40 );
                break;
            case "uint48" :
                this.WriteUnsignedBits( result, data, 48 );
                break;
            case "uint64" :
                let lsb2 = data&0xFFFFFFFF;
                let usb2 = (data/0x100000000) & 0xFFFFFFFF;
                this.WriteSignedBits( result, lsb2, 32 );
                this.WriteSignedBits( result, usb2, 32 );
                break;

            // String
            case "string" :
                let dataString8 = data;
                if ( length > 0 )
                {
                    // Fixed Length String
                    if ( dataString8.length > length )
                        result.writeUTFBytes(dataString8.slice(0,length));
                    else
                    {
                        result.writeUTFBytes(dataString8);
                        result.writeByte(0);
                        for ( let i=dataString8.length+1; i<length; i++ )
                            result.writeByte(0xFF);
                    }
                }
                else
                {
                    // Variable Length String
                    result.writeByte(dataString8.length+2);
                    result.writeByte(1);  // ASCII char type
                    result.writeUTFBytes(dataString8);
                }
                break;
            case "string16" :
                let dataString16 = data;
                // Variable Length String
                if ( StringUtil.ContainsOnlyASCII( dataString16 ) )
                {
                    // There are no characters in the string that require us to use Unicode
                    // so use ASCII to make the messages smaller
                    result.writeByte(dataString16.length+2);
                    result.writeByte(1);  // ASCII char type
                    result.writeUTFBytes(dataString16);
                }
                else
                {
                    // We found at least one character that will not fit into the ASCII
                    // character set, so send the data using Unicode
                    result.writeByte(dataString16.length*2+2);
                    result.writeByte(0);  // UNICODE char type
                    result.writeMultiByte(dataString16, "unicode");

                    result.position = 0;
                    let resStr = "";
                    while ( result.bytesAvailable > 0 )
                        resStr += "0x" + result.readUnsignedByte().toString(16) + ", ";
//                        trace( dataString16 + " is encoded as " + resStr );
                }
                break;
            default :
                console.log( "RawMessage.GetBytesByType cannot find data type " + type );
        } // end switch
//        console.log( "<-- BasePGN.GetBytesByType, result = " + JSON.stringify(result) );
        return Buffer.from( result.mContents );
    } // end function GetBytesByType

    /*****************************************************************************************
     * function WriteSignedBits<br>
     * Writes some bits from the lsb of the byte to result
     * @param buffer : ByteArray - the byte stream to which the bits will be written
     * @param byte : int - the bits are written from the lsb of byte
     * @param bitsToWrite : int - the number of bits to write from the buffer
     *****************************************************************************************/
    WriteSignedBits( buffer, byte, bitsToWrite ) {
        this.mTxValueLeftOver = this.mTxValueLeftOver + (byte<<this.mTxBitsLeftOver);
        this.mTxBitsLeftOver += bitsToWrite;
        while ( this.mTxBitsLeftOver >= 8 )
        {
            buffer.WriteByte( this.mTxValueLeftOver );
            this.mTxValueLeftOver = this.mTxValueLeftOver>> 8;
            this.mTxBitsLeftOver -= 8;
        } // end while loop;

        if ( this.mTxBitsLeftOver <= 0 )
        {
            this.mTxValueLeftOver = 0;
            this.mTxBitsLeftOver  = 0;
        }
    } // end function WriteSignedBits

    /*****************************************************************************************
     * function WriteUnsignedBits<br>
     * Writes some bits from the lsb of the byte to result
     * @param buffer : ByteArray - the byte stream to which the bits will be written
     * @param byte : byte - the bits are written from the lsb of byte
     * @param bitsToWrite : int - the number of bits to write from the buffer
     *****************************************************************************************/
    WriteUnsignedBits( buffer, byte, bitsToWrite) { 
//        console.log( "--> BasePGN.WriteUnsignedBits byte = 0x" + byte.toString(16) );
        this.mTxValueLeftOver = this.mTxValueLeftOver + (byte<<this.mTxBitsLeftOver);
        this.mTxBitsLeftOver += bitsToWrite;
        while ( this.mTxBitsLeftOver >= 8 )
        {
//            console.log( "    writing 0x" + this.mTxValueLeftOver.toString(16) );
            buffer.WriteByte( this.mTxValueLeftOver );
            this.mTxValueLeftOver = this.mTxValueLeftOver>> 8;
            this.mTxBitsLeftOver -= 8;
        } // end while loop;

        if ( this.mTxBitsLeftOver <= 0 )
        {
            this.mTxValueLeftOver = 0;
            this.mTxBitsLeftOver  = 0;
        }
//        console.log( "<-- BasePGN.WriteUnsignedBits" );
    } // end function WriteUnsignedBits

    /*********************************************************************************************
     * function ToString<br>
     * Creates a string version of the message for debugging
     *********************************************************************************************/
    ToString() {
        var str = "pgnNo " + this.mPgnNo + " ('"+this.mMetadata.name+"')"
            + " from source address " + this.mSourceAddress
            + " on bus " + this.mBusIdentifier;
        var sep = "\n    [";
        if ( this.mMetadata.fieldArray != undefined )
        {
            for ( var field of this.mMetadata.fields )
            {
                str += sep;
                str += field.name;
                str += "=";
                str += GetField(field.name);
                sep = ", ";
            }
        } // end if
        str += "]\n";
        return str;
    } // end function ToString

    /*********************************************************************************************
     * function ToStrings
     * Creates an array of strings, one per parameter of the message.
     *********************************************************************************************/
    ToStrings() {
        var result = ["2", String(this.mPgnNo), String(this.mDestAddress), String(this.mSourceAddress), "0", "0"];
        if ( this.mMetadata.fields )
        {
            for ( var i in this.mMetadata.fields )
            {
                var value = this.GetField( i );
                if ( value == null )
                    value = "0";
                else
                    value = String(value);
                result.push(value);
            } // end for loop
        } // end if
        return result;
    } // end function ToStrings

    /*********************************************************************************************/

} // end class BasePGN

console.log( "<-- constructing class BasePGN" );

module.exports = { BasePGN, MessageTypeEnum };

// eof
