// File: src/components/MultiLineText.jsx
// Note: Shared functionality for Text and all Button Components
// Date: 01/07/2020
//..................................................................................................
import React from 'react';

console.log( "Mounting MultiLineText.jsx... <MultiLineText />" );

/*************************************************************************************************
 * class MultiLineText
 *************************************************************************************************/
class MultiLineText extends React.Component{
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {

        let styles = { ...this.props.styles};
        let fontWeight = "normal";

        if ( styles.fontWeight ) {
            fontWeight = styles.fontWeight;
        }

		// Split() does not always work on a string so make sure we create a String.
		let displayedText = String(this.props.text);
		const lines = displayedText.split("\n");

        while ( this.GetTextWidth(styles.fontSize,fontWeight,lines) > this.props.width ) {
            styles.fontSize -= 1;
        }

        let yTop = this.props.centerY - styles.fontSize*(lines.length-1)*0.9;
        //console.log( "text="+displayedText+", fill="+this.props.fill+", fontWeight="+fontWeight );
        const linesText = lines.map((item, line) => {
            const y = yTop;

            yTop += 1.2*styles.fontSize;

            return (
                <text
                    className="text"
                    display=""
                    x="50%"
                    y={y}
                    textAnchor="middle"
                    fill={this.props.fill}
                    style={styles}
                    key={line}
                >
                    {item}
                </text>
            )
        });
        return (
            <React.Fragment>
                {linesText}
            </React.Fragment>
            );
    } // end function render

    /*********************************************************************************************
     * function GetTextWidth
     *********************************************************************************************/
    GetTextWidth(fontSize,fontWeight,lines) {
        var maxWidth = 0;

        const context = document.createElement('canvas').getContext('2d');
		context.font = context.font.replace(/\d+px/, fontSize+"px");

        for ( let i=0; i<lines.length; i++ ) {
            let lineWidth = context.measureText(lines[i]).width;

            if ( lineWidth > maxWidth ) {
                maxWidth = lineWidth;
            }
        }

		if ( fontWeight.localeCompare( "bold" ) === 0 ) {
            maxWidth *= 1.2;
        }

        return maxWidth;
    } // end function GetTextWidth

}; // end class MultiLineText

/*************************************************************************************************/

export default MultiLineText;


// eof
