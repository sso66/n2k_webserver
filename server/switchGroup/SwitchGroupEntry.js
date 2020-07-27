// File: SwitchGroupEntry.js
// Note: Switch Group Item for Monitoring and Control Physical Switches
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing SwitchGroupEntry" );

const SwitchActions = require( '../../src/common/SwitchActions' ).SwitchActions;
const SwitchState   = require( '../pgns/SwitchState' );
const TimeConstants = require( '../TimeConstants' );

/*************************************************************************************************
 * class SwitchGroupEntry
 *************************************************************************************************/
class SwitchGroupEntry {

    /*********************************************************************************************
     * Constructor
     *********************************************************************************************/
	constructor() {
		// console.log( "--> SwitchGroupEntry.constructor" );
        this.mInstanceNumber = null;
        this.mChannel = null;
        this.mDesiredState = null;
        /** delay after getting a SetSwitch command that the command is actually performed,
         *  in milliseconds.
         *  @default 0ms */
        this.mDelay = 0;
        this.mWhy = "";
		// console.log( "<-- SwitchGroupEntry.constructor" );
	} // end constructor

    /*********************************************************************************************
     * function SetSwitch<br>
     *********************************************************************************************/
    SetSwitch( CommandFunction ) {
        let switchAction = ( this.mDesiredState === 1 )?SwitchActions.TURN_ON:SwitchActions.TURN_OFF;
        // console.log( "--> SwitchGroupEntry.SetSwitch, instance = " + this.mInstanceNumber
           // + ", channel = " + this.mChannel
           // + " to " + switchAction + ", delay = " + this.mDelay );
        if ( this.mDelay == 0 )
            CommandFunction( this.mInstanceNumber, this.mChannel, switchAction );
        else
            setTimeout( this.SetSwitchDelayed, this.mDelay, this.mInstanceNumber, this.mChannel, switchAction, CommandFunction );
        // console.log( "<-- SwitchGroupEntry.SetSwitch" );
    } // end function SetSwitch

    /*********************************************************************************************
     * function SetSwitchDelayed
     *********************************************************************************************/
    SetSwitchDelayed( instance, channel, desiredState, CommandFunction ) {
        // console.log( "--> SwitchGroupEntry.SetSwitchDelayed, instance = " + instance
           // + ", channel = " + channel + " to " + desiredState );
        CommandFunction( instance, channel, desiredState );
        // console.log( "<-- SwitchGroupEntry.SetSwitchDelayed" );
    } // end function SetSwitchDelayed

    /*********************************************************************************************
     * function GetSwitchStatus
     *********************************************************************************************/
    GetSwitchStatus( GetBreakerFunction ) {
        // console.log( "--> SwitchGroupEntry.GetSwitchStatus" );
        // console.log( "    GetBreakerFunction = " + typeof( GetBreakerFunction ));
        let switchStatus = SwitchState.UNKNOWN;
        let metadata = { instance : this.mInstanceNumber, channel : this.mChannel };
        let result = GetBreakerFunction( metadata ).value;
        // console.log( "    result = 0x" + result.toString(16) );
        if ( result )
            switchStatus = result;
        // console.log( "<-- SwitchGroupEntry.GetSwitchStatus with 0x" + switchStatus.toString(16) );
        return switchStatus;
    } // end function GetSwitchStatus

    /*********************************************************************************************/
} // end class SwitchGroupEntry

/*************************************************************************************************/

console.log( "<-- constructing SwitchGroupEntry" );

module.exports = { SwitchGroupEntry };

// eof
