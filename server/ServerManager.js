// File: server/ServerManager.js
// Note: TCP Server Manager
// Date: 03/26/2020
//..............................................................................
console.log( "--> constructing ServerManager" );

const Globals                   = require( './Globals' );
const ServerConnection          = require( './ServerConnection' );
const TransmissionController    = require( './TransmissionController' ).TransmissionController;

// ___ devices package modules __
const Bus                       = require( './devices/Bus' );

// ___ pgns package modules __
const BasePGN                   = require( './pgns/BasePGN' );

const sc1 = new ServerConnection.ServerConnection(Bus.BusEnum.PRIMARY);
const sc2 = null;

const transmissionController    = new TransmissionController(sc1,sc2);
Globals.TransmissionController  = transmissionController;

/*************************************************************************************************
 * Enqueue this message for transmission on the bus or busses.
 * @param message - BasePGN
 * @param device - may be <code>null</code>, in which case this will be sent as a
 *                 broadcast message to all devices.
 * @return 0 if command was sent on primary bus<br>
 *         1 if command was sent on secondary bus<br>
 *         2 if command was sent on both busses
 *************************************************************************************************/
function Send( message, device = null ) {
	var busUsed = Bus.BusEnum.UNSPECIFIED;
	if ( device == null )
	{
		// Globally Addressed messages are sent on both busses
		message.mDestAddress = 255;
		if ( this.sc2 )
		{
			var copy = message.Clone();
			copy.mSourceAddress = 255;
			this.sc2.Enqueue(copy);
			busUsed = Bus.BusEnum.SECONDARY;
		}

		if ( this.sc1 )
		{
			message.mSourceAddress = 255;
			this.sc1.Enqueue(message);
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
				message.mDestAddress = device.mPrimaryBus.mAddress;
				message.mSourceAddress = 255;
				this.sc1.Enqueue(message);
				busUsed = Bus.PRIMARY;
			}
			else
			{
				// switch to the secondary bus
				device.mActiveBus = Bus.SECONDARY;
				message.mDestAddress = device.mSecondaryBus.mAddress;
				message.mSourceAddress = 255;
				this.sc2.Enqueue(message);
				busUsed = Bus.SECONDARY;
			}
		}
		else if ( device.mActiveBus == Bus.SECONDARY )
		{
			if ( sc2IdleTime < 40*TimeConstants.SECONDS )
			{
				// choose the secondary bus
				message.mDestAddress = device.mSecondaryBus.mAddress;
				message.mSourceAddress = 255;
				this.sc2.Enqueue(message);
				busUsed = Bus.SECONDARY;
			}
			else
			{
				// switch to the primary bus
				device.mActiveBus = Bus.PRIMARY;
				message.mDestAddress = device.mPrimaryBus.mAddress;
				message.mSourceAddress = 255;
				this.sc1.Enqueue(message);
				busUsed = Bus.PRIMARY;
			}
		}
	}
	else if ( this.sc1 && device.mPrimaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
	{
		message.mDestAddress = device.mPrimaryBus.mAddress;
		message.mSourceAddress = 255;
		this.sc1.Enqueue(message);
		busUsed = Bus.BusEnum.PRIMARY;
	}
	else if ( sc2 && device.mSecondaryBus.mAddress != Bus.BusEnum.UNSPECIFIED )
	{
		message.mDestAddress = device.mSecondaryBus.mAddress;
		message.mSourceAddress = 255;
		this.sc2.Enqueue(message);
		busUsed = Bus.BusEnum.SECONDARY;
	}
	return busUsed;
} // end function Send

/*************************************************************************************************
 * Enqueue this message for transmission on a bus to a specific address.
 * @param sourceAddress - this would normally be <code>Device.gOwnDevice.mPrimaryBus.mAddress
 *   </code> or <code>Device.gOwnDevice.mSecondaryBus.mAddress</code>, but in the case of
 *   simulated devices, it would be the simulated address.<br>
 *  Setting the sourceAddress to 255 means that the IPG100 will replace it with the
 *  correct value for each bus.
 *************************************************************************************************/
function SendOnBus( message, sourceAddress, destAddress, busIdentifier ) {
	try
	{
		message.mSourceAddress = sourceAddress;
		message.mDestAddress = destAddress;
		if ( busIdentifier == Bus.PRIMARY )
		{
			if ( this.sc1 != null )
				this.sc1.Enqueue(message);
		}
		else if ( busIdentifier == Bus.SECONDARY )
		{
			if ( this.sc2 != null )
				this.sc2.Enqueue(message);
		}
	}
	catch ( e )
	{
		trace( "Exception in Message.SendOnBus" );
		trace( e );
		trace( e.getStackTrace() );
	}
} // end function SendOnBus

/*************************************************************************************************
 * Enqueue this message in the Transmission Controller for transmission on both busses.
 *************************************************************************************************
function SendToTransmissionController() {
	TransmissionController.Send( this );
} // end function SendToTransmissionController

/*************************************************************************************************/

console.log( "<-- constructing ServerManager" );

module.exports = { Send, SendOnBus, sc1, sc2, transmissionController };

// eof
