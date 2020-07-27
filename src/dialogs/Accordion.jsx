// File: src/dialogs/Accordion.jsx
// Note: Configuration Settings Select Option List
// Date: 03/17/2020
//..................................................................................................
import React from 'react';

import './styles/accordion.css';

console.log( "Mounting Accordion.jsx... <Accordion />" );

/*************************************************************************************************
 * class Accordion
 *************************************************************************************************/
class Accordion extends React.Component {
    /*********************************************************************************************
     * function renderChildren
     *********************************************************************************************/
    renderChildren() {
        return React.Children.map(this.props.children, (child, key) => {
            return React.cloneElement(child, {
                atomic: this.props.atomic 
            });
        });
    } // end function renderChildren
    
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        return <div className="accordion">{this.renderChildren()}</div>;
    } // end function render
} // end class Accordion

/*************************************************************************************************/

export default Accordion

// eof 
