// File: src/commonents/TextBase.js
// Note: Shared functionality for Text Component Types
// Date: 01/07/2002
//..................................................................................................
import React from 'react';

import ComponentBase from './ComponentBase';
import MultiLineText from './MultiLineText';

console.log("Mounting Text.jsx... <Text />" );

/*************************************************************************************************
 * class Text
 *************************************************************************************************/
class Text extends ComponentBase {
    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.className=`svg-icon ${"text"}`;
        this.mTitle = "";
        this.color = 0xFFF;
        if ( this.mHeight < 30 )
            this.mTextY = 18;
        else
            this.mTextY = 18;
    } // end constructor

    /*********************************************************************************************
     * function shouldComponentUpdate
     *********************************************************************************************/
    shouldComponentUpdate = (nextProps,nextState) => {
        return nextProps.metadata.title.localeCompare( this.mTitle ) !== 0;
    } // end function shouldComponentUpdate

    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        this.mTitle = this.props.metadata.title;

        const textStyles = {
            fontSize:20,
            fontWeight:"bold"
        };
        return (
            <svg
                viewBox={this.mViewBox}
                style={this.mStyles}
                className={this.className}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <MultiLineText
                    fill={this.props.metadata.color}
                    text={this.props.metadata.title}
                    centerY={this.mTextY}
                    width={this.mWidth}
                    styles={textStyles}
                />
            </svg>
        );
    } // end function render

    /*********************************************************************************************/

} // end class Text

/*************************************************************************************************/

export default Text;

// eof

