// File: server/CommandBreaker.js
// Note: Switch/Circuit Breaker Utility
// Date: 04/15/2020
//..............................................................................
console.log( "--> constructing CommandBreaker" );

// ___ devices package modules ___
const Device            = require( './devices/Device' );

// ___ pgns package modules ___
const pgns              = require( './Database' ).pgns;
const NMEACommandPGN    = require( './pgns/NMEACommandPGN' );

// ___ common messaging package modules ___
const SwitchActions     = require( '../src/common/SwitchActions' ).SwitchActions;

/*************************************************************************************************
 * function CommandBreaker
 * Commands a physical breaker via an action
 *************************************************************************************************/
function CommandBreaker( instance, channel, action ) {
    console.log( "--> CommandBreaker.CommandBreaker, instance = " + instance + ", channel = " + channel + ", action = " + action );
    var pgnData = pgns["127501"];
    if ( pgnData )
    {
        var pgnInstance = pgnData[instance];
        if ( pgnInstance )
        {
            var channelName = "#"+(channel+1);
            var newState;
            var currentValue = pgnInstance[channelName];
            switch ( action )
            {
                case SwitchActions.TURN_OFF : 
                    newState = 0;
                    break;
                case SwitchActions.TURN_ON : 
                    newState = 1;
                    break;
                case SwitchActions.TOGGLE :
                    if ( currentValue == 1 || currentValue == 2 )
                        newState = 0;
                    else
                        newState = 1;
                    break;
            }
            var address = pgnInstance.msg.mSourceAddress;
            console.log( "    CommandSwitch, address = " + address
                + ", channel = " + channel
                + ", action = " + action
                + ", newState = " + newState );
            var device = Device.GetDeviceForAddress(address,Bus.BusEnum.PRIMARY);
            var switchCommand = new NMEACommandPGN.NMEACommandPGN( 127501 );
            switchCommand.SetFieldValuePair( 1, instance );
            switchCommand.SetFieldValuePair( channel+2, newState );
            ServerManager.Send( switchCommand, device );
            setTimeout( VerifySwitch, 500, {device:device,instance:instance,channel:channel,newState:newState} );
        }
    }
    console.log( "<-- CommandBreaker.CommandBreaker" );
} // end function CommandBreaker

/*************************************************************************************************
 * function VerifyBreaker
 *************************************************************************************************/
function VerifyBreaker( metadata ) {
    var pgnData = pgns["127501"];
    if ( pgnData )
    {
        var pgnInstance = pgnData[metadata.instance];
        if ( pgnInstance )
        {
            var channelName = "#"+(metadata.channel+1);
            var currentValue = pgnInstance[channelName];
            if ( currentValue !== metadata.newState )
            {
                console.log( "server.js: VerifySwitch - Value did not change, issuing command again!" );
                var switchCommand = new NMEACommandPGN.NMEACommandPGN( 127501 );
                switchCommand.SetFieldValuePair( 1, metadata.instance );
                switchCommand.SetFieldValuePair( metadata.channel+2, metadata.newState);
                ServerManager.Send( switchCommand, metadata.device );
            }
        }
    }
} // end function VerifyBreaker

/*************************************************************************************************/

console.log( "<-- constructing CommandBreaker" );

module.exports = { CommandBreaker }

// eof
