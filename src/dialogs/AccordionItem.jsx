// File: src/dialogs/AccordionItem.jsx
// Note: Configuration Settings Select Option Item
// Date: 03/17/2020
//..................................................................................................
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './styles/accordion.css';

console.log( "Mounting AccordionItem.jsx... <AccordionItem />" );

/*************************************************************************************************
 * class AccordionItem
 *************************************************************************************************/
class AccordionItem extends React.Component {
    static propTypes = {
        title: PropTypes.string,
    };

    static defaultProps = {
        title: 'TITLE',
    };

    /*********************************************************************************************
     * constructor
     *********************************************************************************************/
    constructor(props) {
        super(props);
        this.state = { isOpen: false };
        this.mounted = true;
    }// end constructor

    /*********************************************************************************************
     * function OnDocumentClick
     *********************************************************************************************/
    OnDocumentClick = event => {
        if (
            this.mounted &&
                !ReactDOM.findDOMNode(this).contains(event.target) &&
                this.state.isOpen
            ) {
                this.setState({ isOpen: false });
        }
    };// end function OnDocumentClick

    /*********************************************************************************************
     * function componentDidMount
     *********************************************************************************************/
    componentDidMount() {
        if (this.props.atomic) {
            document.addEventListener('click', this.OnDocumentClick, false);
            document.addEventListener('touchend', this.OnDocumentClick, false);
        }
    }// end function componentDidMount

    /*********************************************************************************************
     * function componentWillUnmount
     *********************************************************************************************/
    componentWillUnmount() {
        this.mounted = false;
        document.removeEventListener('click', this.OnDocumentClick, false);
        document.removeEventListener('touchend', this.OnDocumentClick, false);
    }// end function componentWillMount
    
    /*********************************************************************************************
     * function OnAccordionClick
     *********************************************************************************************/
    OnAccordionClick = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }; // end function onClick
    
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        const accordionItemClassNames = classNames([
            'accordion-item', { active: this.state.isOpen }
        ]);

        return (
            <div className={accordionItemClassNames}>
                <button className="title" onClick={this.OnAccordionClick}>
                  {this.props.title}
                </button>
                <div className="panel">{this.props.children}</div>
              </div>
            );
    } // end function render
} // end class AccordionItem

/*************************************************************************************************/

export default AccordionItem;

// eof
