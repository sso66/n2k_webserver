// File: server/TransmissionController.js
// Note: Provision for tranmission control management utility
// Date: 04/15/2020
//..............................................................................
console.log( "--> constructing class TransmissionController" );

const TimeConstants = require( './TimeConstants' );

// ___ devices package modules ___
const Bus = require( './devices/Bus' );

/*************************************************************************************************
 * If we send out too many requests in a short time, we can overload the NMEA bus. 
 * This is a buffer that throttles the ISORequest messages going out of N2KView.<br>
 *
 * At present, there is only one buffer for both busses in a dual system.
 *************************************************************************************************/
const TIMER_INTERVAL = 0.05*TimeConstants.SECONDS;

/*****************************************************************************************************
 * class TransmissionControler
 *****************************************************************************************************/
class TransmissionController {
	/*********************************************************************************************
	 * Constructor
	 *********************************************************************************************/
	constructor( sc1,sc2 ) {
		console.log( "--> TransmissionController.constructor" );
		console.log( "    sc1 = " + sc1 + ", sc2 = " + sc2 );
		this.sc1 = sc1;
		this.sc2 = sc2;
		/** Array of BasePGN */
		this.mMessages = [];
		this.txTimer = setInterval( this.OnTimer, TIMER_INTERVAL, this );
		console.log( "    mMessages = " + JSON.stringify(this.mMessages));
		console.log( "<-- TransmissionController.constructor" );
	} // end constructor

	/*********************************************************************************************
	 * static function Send<br>
	 * Queues a message in the Transmission Buffer to be sent later to a device.
     * @param message : BasePGN
	 * @param device : Device - if the device is not specified, the message will be broadcast on
	 *     both busses.
	 *********************************************************************************************/
	Send( message, device = null ) {
		// console.log( "--> TransmissionController.Send device = " + device );
		// console.log( "    message = " + message.ToString() );
		// Determine the bus and address for the message
		if ( !device )
		{
			// Globally Addressed message, send on both busses
			if ( this.sc1 )
				this.SendToAddress( message, 255, Bus.BusEnum.PRIMARY );
			if ( this.sc2 )
				this.SendToAddress( message.Clone(), 255, Bus.BusEnum.SECONDARY );
		}
		else if ( this.sc1 && device.mPrimaryBus.mAddress != Bus.BusEnum.UNSPECIFIED
			   && this.sc2 && device.mSecondaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
		{
			// We have a choice of busses on which to send the message,
			// and need to choose one.
            //console.log( "    We have a choice of busses" );
			var now         = new Date();
			var sc1IdleTime = Number.MAX_VALUE;
			if ( device.mPrimaryBus.mLastPGNTime )
				sc1IdleTime = now.getTime() - device.mPrimaryBus.mLastPGNTime.getTime();
			var sc2IdleTime = Number.MAX_VALUE;
			if ( device.mSecondaryBus.mLastPGNTime )
				sc2IdleTime = now.getTime() - device.mSecondaryBus.mLastPGNTime.getTime();
			if ( device.mActiveBus == Bus.BusEnum.PRIMARY )
			{
				if ( sc1IdleTime < 40*TimeConstants.SECONDS )
				{
					// choose the primary bus
					this.SendToAddress( message, device.mPrimaryBus.mAddress, Bus.BusEnum.PRIMARY );
				}
				else
				{
					// switch to the secondary bus
					device.mActiveBus = Bus.SECONDARY;
					this.SendToAddress( message, device.mSecondaryBus.mAddress, Bus.BusEnum.SECONDARY );
				}
			}
			else if ( device.mActiveBus == Bus.SECONDARY )
			{
				if ( sc2IdleTime < 40*TimeConstants.SECONDS )
				{
					// choose the secondary bus
					this.SendToAddress( message, device.mSecondaryBus.mAddress, Bus.BusEnum.SECONDARY );
				}
				else
				{
					// switch to the primary bus
					device.mActiveBus = Bus.PRIMARY;
					this.SendToAddress( message, device.mPrimaryBus.mAddress, Bus.BusEnum.PRIMARY );
				}
			}
		}
		else if ( this.sc1 && device.mPrimaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
		{
            //console.log( "    We will send on the Primary Bus to address 0x" + device.mPrimaryBus.mAddress.toString(16) );
			this.SendToAddress( message, device.mPrimaryBus.mAddress, Bus.BusEnum.PRIMARY );
		}
		else if ( this.sc2 && device.mSecondaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
		{
            //console.log( "    We will send on the Secondary Bus to address 0x" + device.mSecondaryBus.mAddress.toString(16) );
			this.SendToAddress( message, device.mSecondaryBus.mAddress, Bus.BusEnum.SECONDARY );
		}
		// console.log( "<-- TransmissionController.Send" );
	} // end function Send

	/*****************************************************************************************
	 * static function SendToAddress
	 * @param busIdentifier - one of [ Bus.PRIMARY | Bus.SECONDARY ]
	 *****************************************************************************************/
	SendToAddress( message, address, busIdentifier ) {
		// console.log( "--> TransmissionController.SendToAddress " + address + " on  bus " + busIdentifier );
		// console.log( "    sc1 = " + this.sc1 + ", sc2 = " + this.sc2 );
		if ( this.sc1 != undefined && busIdentifier == Bus.BusEnum.PRIMARY )
		{
			// console.log( "    sending to Primary Bus" );
			message.mDestAddress = address;
			message.mSourceAddress = 255;
			message.mBusIdentifier = busIdentifier;
		}
		else if ( this.sc2 != undefined && busIdentifier == Bus.BusEnum.SECONDARY )
		{
			// console.log( "    sending to Secondary Bus" );
			message.mDestAddress = address;
			message.mSourceAddress = 255;
			message.mBusIdentifier = busIdentifier;
		}
		else
			return;

		// if the message is already in the queue, then do not add it again
		for ( var messageFromQueue of this.mMessages )
		{
			if ( message.mBusIdentifier == messageFromQueue.mBusIdentifier
				&& message.mSourceAddress == messageFromQueue.mSourceAddress
				&& message.mDestAddress == messageFromQueue.mDestAddress
				&& message.mPgnNo     == messageFromQueue.mPgnNo
				&& message.mData.length == messageFromQueue.mData.length )
			{
				// now check if all the elements of the array are equal
				var equal = true;
				for ( var j=0; j<message.mData.length; j++ )
					if ( message.mData[j] != messageFromQueue.mData[j] )
					{
						equal = false;
						break;
					}
				if ( equal )
				{
					// console.log( "<-- TransmissionController.SendToAddress, message already in queue, length = " + this.mMessages.length );
					return;
				}
			}
		} // end for loop ( message in gMessages )
		this.mMessages.push( message );
		// console.log( "   " + message.ToString() );
		// console.log( "   " + this.mMessages.length + " messages in TransmissionController" );
		// console.log( "<-- TransmissionController.SendToAddress " + address + " (0x" + address.toString(16) + ") on bus " + busIdentifier );
	} // end static function SendToAddress

	/*****************************************************************************************
	 * function OnTimer
	 *****************************************************************************************/
	OnTimer( transmissionController ) {
		// console.log( "--> TransmissionController.OnTimer, mMessages = " + JSON.stringify(transmissionController.mMessages));
		if ( transmissionController.mMessages.length > 0 )
		{
			//console.log( "--> TransmissionController.OnTimer, length = " + transmissionController.mMessages.length );
			var message       = transmissionController.mMessages.shift();
			//console.log( "    message.mBusIdentifier = " + message.mBusIdentifier );
			//console.log( "    sc1.IsConnected = " + transmissionController.sc1.IsConnected() );
			// Send all message NOT marked as only for the secondary bus on the primary bus
			if ( message.mBusIdentifier == Bus.BusEnum.PRIMARY && transmissionController.sc1 && transmissionController.sc1.IsConnected() )
			{
				//console.log( "    enqueue in ServerConnection 1" );
                //console.log( "    " + JSON.stringify( message ));
				transmissionController.sc1.Enqueue(message);
			}
			// Send all message NOT marked as only for the primary bus on the secondmary bus
			if ( message.mBusIdentifier == Bus.SECONDARY && transmissionController.sc2  && transmissionController.sc2.IsConnected() )
			{
				transmissionController.sc2.Enqueue(message);
			}
			//console.log( "<-- TransmissionController.OnTimer" );
		} // end if ( transmissionController.mMessages.length > 0 )
	}; // end static function OnTimer

} // end class TransmissionController

/*****************************************************************************************/

console.log( "<-- constructing class TransmissionController" );

module.exports = { TransmissionController };

// eof
