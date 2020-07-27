// File: src/components/IndicatorBase.js
// Note: Shared functionality for Indicator Component Types
// Date: 01/24/2020
//..................................................................................................
import ComponentBase from './ComponentBase';

console.log("Mounting IndicatorBase.jsx... <IndicatorBase />" );

/*************************************************************************************************
 * class IndicatorBase
 *************************************************************************************************/
class IndicatorBase extends ComponentBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.lastValue = -10000000;
    } // end constructor

    /*********************************************************************************************
     * function GetText
     *********************************************************************************************/
    GetText(state) {
        switch (state)
        {
            case 0:
                return this.props.metadata.offTitle;
            case 1:
                return this.props.metadata.onTitle;
            case 2:
                return this.props.metadata.errorTitle;
            default :
                return this.props.metadata.title;;
        }
    } // end GetText

    /*********************************************************************************************
     * function GetColor
     *********************************************************************************************/
    GetColor(state) {
        switch (state)
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

    /*********************************************************************************************/

} // end class IndicatorBase

/*************************************************************************************************/

export default IndicatorBase;

// eof

