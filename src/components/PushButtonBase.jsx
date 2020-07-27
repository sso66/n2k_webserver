// File: src/components/PushButtonBase.js
// Note: Shared functionality for PushButton Component Types
// Date: 01/24/2020
//..................................................................................................
import ComponentBase from './ComponentBase';
import { Modes } from '../Modes';
import { ParameterNames } from '../common/Parameters';
import { SwitchActions } from '../common/SwitchActions';
import * as Controls from '../common/Controls'

console.log("Mounting PushButtonBase.jsx... <PushButtonBase />" );

/*************************************************************************************************
 * class PushButtonBase
 *************************************************************************************************/
class PushButtonBase extends ComponentBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.title = "";
        this.color = 0xFFF;
    } // end constructor

    /*********************************************************************************************
     * function GetText
     *********************************************************************************************/
    GetText(state) {
        switch (state&0x3)
        {
            case 0:
                return this.props.metadata.offTitle;
            case 1:
                return this.props.metadata.onTitle;
            case 2:
                return this.props.metadata.errorTitle;
            default :
                return this.props.metadata.title;
        }
    } // end GetText

    /*********************************************************************************************
     * function GetColor
     *********************************************************************************************/
    GetColor(state) {
        switch (state&0x3)
        {
            case 0:
                return this.props.metadata.offColor;
            case 1:
                return this.props.metadata.onColor;
            case 2:
                return this.props.metadata.errorColor;
            default :
                return 0xC0C0C0;
        }
    } // end GetColor


    /*********************************************************************************************
     * function GetCursorType
     *********************************************************************************************/
    GetCursorType() {
        //console.log( "--> PushButtonBase.GetCursorType parameter = " + this.props.metadata.parameter 
        //    + ", mode = " + this.props.app.state.mode );
        if ( this.props.metadata.parameter !== ParameterNames.SWITCH_GROUP )
        {
            switch( this.props.app.state.mode )
            {
                case Modes.SET_LOCK :
                    return 'url(assets/key25.png),auto';
                case Modes.CHOOSE_BREAKER_FOR_DETAILS:
                    if ( this.props.data.isCarlingACBreaker || this.props.data.isCarlingDCBreaker )
                        return 'url(assets/details25.png),auto';
                    else
                        return 'default';
                default :
                    return 'pointer';
            } // end switch
        }
        //console.log( "<-- PushButtonBase.GetCursorType return default" );
        return 'pointer';
    } // end function GetCursorType

    /*********************************************************************************************
     * function OnMouseDown
     *********************************************************************************************/
    OnMouseDown = () => {
        //console.log( "--> PushButtonBase.OnMouseDown mode = " + this.props.app.state.mode );
        if ( this.props.app.state.mode === Modes.CHOOSE_BREAKER_FOR_DETAILS )
        {
            //console.log( "PushButtonBase Detail Request " );
            if ( this.props.data.isCarlingACBreaker )
                this.props.app.RequestACBreakerDetails( this.props.metadata.instance, this.props.metadata.channel );
            else if ( this.props.data.isCarlingDCBreaker )
                this.props.app.RequestDCBreakerDetails( this.props.metadata.instance, this.props.metadata.channel );
        }
        else if ( this.props.app.state.mode === Modes.SET_LOCK )
        {
            //console.log( "PushButtonBase Lock " + this.props.metadata.control + " Down, value = 0x" + this.props.data.value.toString(16) );
            if ((this.props.data.value&0x0010) === 0x0010)
            {
                // Switch is showing locked; we must unlock it
                this.props.app.UnlockBreaker( this.props.metadata.instance, this.props.metadata.channel );
            }
            else
            {
                // Switch is showing unlocked; we must lock it
                this.props.app.LockBreaker( this.props.metadata.instance, this.props.metadata.channel );
            }
        }
        else if ( this.props.app.state.mode === Modes.DISPLAY )
        {
            // This is a normal button press
            if ( Controls.IsMomentary(this.props.metadata.control ))
            {
                //console.log( "PushButtonBase Momentary " + this.props.metadata.control + " Down" );
                this.props.app.CommandBreaker( this.props.metadata.instance, this.props.metadata.channel, SwitchActions.TURN_ON );
            }
            else
            {
                //console.log( "PushButtonBase " + this.props.metadata.control + "  Mouse Down" );
                this.props.app.CommandBreaker( this.props.metadata.instance, this.props.metadata.channel, SwitchActions.TOGGLE );
            }
        }
    } // end function OnMouseDown

    /*********************************************************************************************
     * function OnMouseUp
     *********************************************************************************************/
    OnMouseUp = () => {
        if ( Controls.IsMomentary(this.props.metadata.control ))
        {
            console.log( "PushButtonBase Momentary " + this.props.metadata.control + " Mouse Up" );
            this.props.app.CommandBreaker( this.props.metadata.instance, this.props.metadata.channel, SwitchActions.TURN_OFF );
        }
    } // end function OnMouseUp

    /*********************************************************************************************/

} // end class PushButtonBase

/*************************************************************************************************/

export default PushButtonBase;

// eof
