// File: src/components/ActiveButton.jsx
// Note: Shared functionality for Active Button Component Types
// Date: 01/24/2020
//..................................................................................................
import React from 'react';

import ComponentBase from './ComponentBase';
import MultiLineText from './MultiLineText';
import { ParameterNames } from '../common/Parameters';
import ILinearGradient from './gradients/ILinearGradient';

console.log( "Mounting ActiveButton.jsx... <ActiveButton />" );

/*************************************************************************************************
 * class ActiveButton
 *************************************************************************************************/
class ActiveButton extends ComponentBase {
    /*********************************************************************************************
     *  constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.mTitle = "";
        this.color = 0xFFF;
        this.className=`svg-icon ${"active-button"}`;
    } // end constructor

    /*********************************************************************************************
     *  function shouldComponentUpdate
     *********************************************************************************************/
    shouldComponentUpdate = (nextProps,nextState) => {
        return nextProps.metadata.title.localeCompare( this.mTitle ) !== 0;
    } // end function shouldComponentUpdate

    /*********************************************************************************************
     *  function render
     *********************************************************************************************/
    render() {
        this.mTitle = this.props.metadata.title;
        let textStyles = {
            fontSize:14,
            fontWeight: "bold"
        };

        var activeButtonStyles = {
            ...this.mStyles ,
            cursor : 'pointer'
        };

        return (
            <div onClick={(event)=> {
                //console.log( "Active Button Pressed! " );

                if ( this.props.metadata.parameter === ParameterNames.SCREEN_SELECT ) {
                    this.props.app.SelectScreen( this.props.metadata.screenName );
                }}}>

                <svg
                    viewBox={this.mViewBox}
                    style={activeButtonStyles}
                    className={this.className}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    <ILinearGradient />

                    <rect
                        className="active-button"
                        display=""
                        x="2%"
                        y="2%"
                        width="96%"
                        height="96%"
                        rx={4} ry={4}
                    />

                    <MultiLineText
                        fill="#404040"
                        text={this.props.metadata.title}
                        centerY={this.mHeight/2+4}
                        width={100}
                        styles={textStyles}
                    />
                </svg>
            </div>
        );
    } // end function render

    /*********************************************************************************************/

} // end class ActiveButton

/*************************************************************************************************/

export default ActiveButton;

// eof

