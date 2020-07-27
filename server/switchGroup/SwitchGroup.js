// File: SwitchGroup.js
// Note: Switch Group List for Monitoring and Control Physical Switches
// Date: 04/16/2020
//..............................................................................
console.log( "--> constructing SwitchGroup" );

const SwitchActions     = require( '../../src/common/MessageTypes' ).SwitchActions;
const SwitchGroupEntry  = require( './SwitchGroupEntry' ).SwitchGroupEntry;
const SwitchStateEnum   = require( '../pgns/SwitchState' ).SwitchStateEnum;
const TimeConstants     = require( '../TimeConstants' );

/** An instance number of 253 indicates a SwitchGroup */
const SWITCH_GROUP_INSTANCE = 253;
const NO_OF_SWITCH_GROUPS   = 28;

var gGroups = [];

/*****************************************************************************************
 * static function Clear
 *****************************************************************************************/
function Clear() {
    gGroups = [];
} // end static function Clear

/*********************************************************************************************
 * static function PopulateFromJSON
 * @param json is a json array containing all the switch groups
 *********************************************************************************************/
function PopulateFromJSON( json ) {
    // console.log( "--> SwitchGroup.PopulateFromJSON, json = " + JSON.stringify(json) );
    gGroups = [];
    for ( let g=0; g<json.length; g++ )
    {
        let sg = json[g];
        //console.log( "    sg = " + JSON.stringify(sg) );
        var switchGroup = new SwitchGroup();
        switchGroup.mGroupNumber = parseInt(sg.groupNumber );
        switchGroup.mGroupLabel = sg.groupLabel;
        switchGroup.mShowGroupControlledWarning = sg.showGroupControlledWarning;
        switchGroup.mSwitches = [];
        for ( let i=0; i<sg.switches.length; i++ )
        {
            let sw = sg.switches[i];
            let switchEntry = new SwitchGroupEntry();
            switchEntry.mInstanceNumber = sw.instance;
            switchEntry.mChannel = sw.channel;
            switchEntry.mDesiredState = sw.desiredState;
            switchEntry.mDelay = sw.delay;
            switchGroup.AddEntry( switchEntry );
        }
        AddGroup( switchGroup );
    }
    //console.log( "<-- SwitchGroup.PopulateFromJSON, gGroups = " + gGroups.length );
} // end static function PopulateFromJSON

/*********************************************************************************************
 * static function AddGroup
 *********************************************************************************************/
function AddGroup( newGroup ) {
    //console.log( "--> SwitchGroup.AddGroup" );
    for ( let i=0; i<gGroups.length; i++ )
    {
        if ( gGroups[i].mGroupNumber === newGroup.mGroupNumber )
        {
            // no duplicates
            return;
        }
    } // end for loop
    gGroups.push( newGroup );
    // console.log( "<-- SwitchGroup.AddGroup, no of groups = " + gGroups.length );
} // end static function AddGroup

/*********************************************************************************************
 * static function RemoveGroup
 *********************************************************************************************/
function RemoveGroup( group ) {
    let index = gGroups.indexOf( group );
    if ( index >= 0 )
        gGroups.splice( index, 1 );
} // end static function RemoveGroup

/*********************************************************************************************
 * static function GetGroup
 *********************************************************************************************/
function GetGroup( groupNumber ) {
    for ( let i=0; i<gGroups.length; i++ )
    {
        if ( gGroups[i].mGroupNumber === groupNumber )
        {
            // no duplicates
            return gGroups[i];
        }
    } // end for loop
    return null;
} // end static function GetGroup

/*********************************************************************************************
 * static function SetSwitchGroup
 *********************************************************************************************/
function SetSwitchGroup( groupNumber, newValue, why ) {
    for ( let i=0; i<gGroups.length; i++ )
    {
        let group = gGroups[g];
        if ( group.mGroupNumber === groupNumber )
            group.SetSwitch( newValue, why );
    }
} // end static function SetSwitchGroup

/*********************************************************************************************
 * static function BreakerIsInSwitchGroup
 *********************************************************************************************/
function BreakerIsInSwitchGroup( instance, channel ) {
    const trace = false; //( instance === 65 && channel === 14 );
    if ( trace )
        console.log( "--> SwitchGroup.BreakerIsInSwitchGroup, instance = " + instance + ", channel = " + channel );
    for ( let g=0; g<gGroups.length; g++ )
    {
        let group = gGroups[g];
        if ( group.mShowGroupControlledWarning )
        {
            for ( let b=0; b<group.mSwitches.length; b++ )
            {
                let breaker = group.mSwitches[b];
                if ( breaker.mInstanceNumber == instance
                    && breaker.mChannel == channel )
                {
                    if ( trace )
                        console.log( "<-- SwitchGroup.BreakerIsInSwitchGroup, return true" );
                    return true;
                }
            } // end for loop
        }
    }
    if ( trace )
        console.log( "<-- SwitchGroup.BreakerIsInSwitchGroup, return false" );
    return false;
} // end static function BreakerIsInSwitchGroup

/*********************************************************************************************
 * function UpdateGroup
 *********************************************************************************************/
// function Update( GetBreakerFunction ) {
   function UpdateGroup( GetBreakerFunction ) {
   
    // console.log( "--> SwitchGroup.Update" );
    // console.log( "    GetBreakerFunction = " + typeof( GetBreakerFunction ));
    for ( let g=0; g<gGroups.length; g++ )
    {
        let group = gGroups[g];
        // console.log( "    Breaker Group " + g + " has " + group.mSwitches.length + " breakers" );
        if ( group.mSwitches.length > 0 )
        {
            let newState = SwitchStateEnum.ON;
            for ( let b=0; b<group.mSwitches.length; b++ )
            {
                let breaker = group.mSwitches[b]; // SwitchGroupEntry
                // filter out all the extra bits
                let breakerState = breaker.GetSwitchStatus(GetBreakerFunction) & 0x03;
                // console.log( "        Breaker " + breaker.mInstanceNumber + ", channel " + breaker.mChannel
                   // + ", breakerState = " + breakerState
                   // + ", desiredState = " + breaker.mDesiredState
                   // + ", newState = " + newState );
                if ( breakerState !== breaker.mDesiredState )
                {
                    newState = SwitchStateEnum.OFF;
                    break;
                }
            } // end for b loop
            group.mCurrentState = newState;
            // console.log( "        newState = " + newState + ", group.mCurrentState = " + group.mCurrentState );
        }
    } // end for g loop
    // console.log( "<-- SwitchGroup.Update" );
} // end function UpdateGroup

/*************************************************************************************************
 * class Switch Group
*************************************************************************************************/
class SwitchGroup {

    /*********************************************************************************************
     * Constructor
     *********************************************************************************************/
	constructor() {
		// console.log( "--> SwitchGroup.constructor" );
        this.mGroupNumber = 0;
        this.mGroupLabel  = "";
        this.mShowGroupControlledWarning = true;
        this.mCurrentState = SwitchStateEnum.OFF;
        this.mLastChangeAt = new Date(0);
        this.mSwitches = [];
		// console.log( "<-- SwitchGroup.constructor" );
	} // end constructor

	/*********************************************************************************************
	 * function AddEntry
	 *********************************************************************************************/
	AddEntry( newSwitch ) {
        // console.log( "--> SwitchGroup.AddEntry" );
        for ( let i=0; i<this.mSwitches.length; i++ )
        {
            let breaker = this.mSwitches[i];
            if ( breaker.mInstanceNo === newSwitch.mInstanceNo
                && breaker.mChannel === newSwitch.mChannel )
            {
                // no duplicates
                return;
            }
        } // end for loop
        this.mSwitches.push( newSwitch );
        // console.log( "<-- SwitchGroup.AddEntry, no of switches = " + this.mSwitches.length );
	} // end function AddEntry

    /*****************************************************************************************
     * function RemoveEntry
     *****************************************************************************************/
    RemoveEntry( entry ) {
        var index = this.mSwitches.indexOf( entry );
        if ( index >= 0 )
            this.mSwitches.splice( index, 1 );
    } // end function RemoveEntry

    /*********************************************************************************************
     * function SetSwitch<br>
     * For group switches with no members, we must ensure that the switches remain in a
     * stable state for long enough that any alerts watching them can be fired.
     * So, keep a record of when the state was last changed and if a new change is received
     * within say 200ms of that change, then delay the new change a little.
     *********************************************************************************************/
    SetSwitch( newState, commandFunction ) {
        console.log( "--> SwitchGroup.SetSwitch " + this.mGroupNumber
            + " to " + SwitchStateEnum.properties[newState].name + ", "
            + this.mSwitches.length + " switches" );
        if ( this.mSwitches.length === 0 )
        {
            if ( this.mCurrentState !== newState )
            {
                let now = new Date();
                if ( now.getTime() - this.mLastChangeAt.getTime() > 200 )
                {
                    this.mCurrentState = newState;
                    this.mLastChangeAt = now;
                }
                else
                {
                    switch ( newState )
                    {
                        case SwitchStateEnum.OFF :
                        case SwitchStateEnum.ON :
                            setTimeout ( this.OnDelayedSwitch, 200, newState );
                            break;
                        default:
                            mLastChangeAt = now;
                    } // end switch
                }
            } // end if ( mCurrentState != newState )
        } // end if ( mSwitches.length == 0 )

        else if ( newState === SwitchStateEnum.ON )
        {
            for ( let i=0; i<this.mSwitches.length; i++ )
            {
                let breaker = this.mSwitches[i];
                breaker.SetSwitch( commandFunction );
                this.mCurrentState = newState;
            } // end for loop
        }
        console.log( "<-- SwitchGroup.SetSwitch" );
    } // end function SetSwitch

    /*********************************************************************************************
     * function OnDelayedSwitchOff<br>
     * Only used for groups with no members to ensure that the switches remain in a
     * stable state for long enough that any alerts watching them can be fired.
     *********************************************************************************************/
    OnDelayedSwitch( newState ) {
        this.SetSwitch( newState, "Delayed Group Switch action" );
    }

    /*********************************************************************************************/

} // end class SwitchGroup

/*************************************************************************************************/

console.log( "<-- constructing SwitchGroup" );

// change in method name from Update to UpdateGroup
// module.exports = { SWITCH_GROUP_INSTANCE, SwitchGroup, PopulateFromJSON, Clear, GetGroup, BreakerIsInSwitchGroup, Update };
module.exports = { SWITCH_GROUP_INSTANCE, SwitchGroup, PopulateFromJSON, Clear, GetGroup, BreakerIsInSwitchGroup, UpdateGroup };

// eof
