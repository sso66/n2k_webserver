// File: src/components/BreakerDecoration.jsx
// Note: Decoration for Push Buttons and Breakers
// Date: 03/12/2020
//..................................................................................................
import React from 'react';

console.log( "Mounting BreakerDecoration.jsx... <BreakerDecoration />" );

/*************************************************************************************************
 * class BreakerDecoration
 *************************************************************************************************/
class BreakerDecoration extends React.Component{
    /*********************************************************************************************
     * function render
     * render() will return an array of decorations to be added to breakers to show if they are
     * locked, GFCI tripped, or under control of software.
     *********************************************************************************************/
    render() {
//        console.log( "--> BreakerDecoration.render, title = " + JSON.stringify( this.props.metadata.title ));
        var value = this.props.data.value;
//        console.log( "   " + this.props.metadata.title + ", value = 0x" + value.toString(16) );
        var decorations = [];
        // add keys to decorator list
        let key = 0;
        if ( (value&0x1000) === 0x1000 )
            decorations.push( <WarningSymbol {...this.props} warningText="Replace Breaker" key={key++}/> );
        else if ( (value&0x800) === 0x800 )
            decorations.push( <WarningSymbol {...this.props} warningText="GFCI Trip" key={key++}/> );
        else if ( (value&0x400) === 0x400 )
            decorations.push ( <DecorationText {...this.props} text="Local Override" key={key++}/> );
        else if ( (value&0x0010) === 0x0010 )
            decorations.push (
                <React.Fragment key={key++}>
                    <DecorationText {...this.props} text="Locked" />
                    <image href="/assets/padlock.png" height="15" width="15" x="85" y="8" />
                </React.Fragment>
            );
        else if ( (value&0x0020) === 0x0020 )
        {
            let theText = ((value&0x0003) === 0x0000 )?"Load Shed":"Load Controlled";
            decorations.push( <WarningSymbol {...this.props} warningText={theText} key={key++}/> );
        }
        else if ( (value&0x0040) === 0x0040 )
            decorations.push( <WarningSymbol {...this.props} warningText="Alert Controlled" key={key++}/> );
        else if ( (value&0x0200) === 0x0200 )
            decorations.push( <WarningSymbol {...this.props} warningText="Timer Controlled" key={key++}/> );
        else if ( (value&0x0100) === 0x0100 )
            decorations.push( <WarningSymbol {...this.props} warningText="Group Controlled" key={key++}/> );

        if ( (value&0x2000) === 0x2000 )
            decorations.push ( <FunctionText {...this.props} text="GFCI" key={key++} /> );
        else if ( (value&0x0080) === 0x0080 )
            decorations.push ( <FunctionText {...this.props} text="Group Switch" key={key++} /> );
        return decorations;
    } // end function render
    /*********************************************************************************************/
}; // end class BreakerDecoration

/*************************************************************************************************
 * class WarningSymbol
 *************************************************************************************************/
class WarningSymbol extends React.Component{
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        //console.log( "WarningSymbol props = " + JSON.stringify(this.props));
        return (
            <React.Fragment>
                <DecorationText {...this.props} text={this.props.warningText} />
                <image href="/assets/warning.png" height="15" width="15" x="85" y="8" />
            </React.Fragment>
        );
    } // end function render
    /*********************************************************************************************/
}; // end class WarningSymbol

/*************************************************************************************************
 * class DecorationText
 *************************************************************************************************/
class DecorationText extends React.Component{
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        //console.log( "DecorationText props = " + JSON.stringify(this.props));
        return (
             <text
                className="breaker-decoration-top"
                x={this.props.width-10}
                y={10}
            >
                {this.props.text}
            </text>
        );
    } // end function render
    /*********************************************************************************************/
}; // end class DecorationText

/*************************************************************************************************
 * class FunctionText
 *************************************************************************************************/
class FunctionText extends React.Component{
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        //console.log( "FunctionText props = " + JSON.stringify(this.props));
        return (
             <text
                className="breaker-decoration-bottom"
                x="50%"
                y={this.props.height-5}
            >
                {this.props.text}
            </text>
        );
    } // end function render
    /*********************************************************************************************/
}; // end class FunctionText

/*************************************************************************************************/

export default BreakerDecoration;

// eof
