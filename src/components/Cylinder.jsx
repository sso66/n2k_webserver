// File: src/components/Cylinder.jsx
// Note: Cylinder Component Template: UIViewDelegate
// Date: 02/19/2020
//..................................................................................................
import React from 'react';

console.log( "Mounting Cylinder.jsx... <Cylinder />" );

/*************************************************************************************************
 * class Cylinder
 * This component is used in Tank and TankModern controls
 *************************************************************************************************/

class Cylinder extends React.Component {
    static BLACK            = '0x000000;';
    static ELLIPSE_SIDES    = 12;    
    
    constructor(props) {
        super(props);
        
        this.state = {
            // ___ instance variables ___
            mHeight: 0,
            mWidth: 0,
            
            mTopColors: [],
            mTopAlphas: [],
            mTopRatios: [],
            
            mFrontColors: [],
            mFrontAlphas: [],
            mFrontRatios: [], 
        };
        
    }// end constructor
    
    /*********************************************************************************************
     * function componentDidMount
     *********************************************************************************************/
    componentDidMount() {
        this.Draw();
    }// end componentDidMount
    
    /*********************************************************************************************
     * function Draw
     *********************************************************************************************/
    Draw = (...props) => {
        //...
    }// end function Draw
    
    /*********************************************************************************************
     * function SetHeight
     *********************************************************************************************/
    SetHeight = (...props) => {
        //...
    } // end function SetHeight
    
    /*********************************************************************************************
     * function SetColor
     *********************************************************************************************/
    SetColor = (...props) => {
        //...  
    }// end function SetColor
    
    /*********************************************************************************************
     * function componentWillUnmount
     *********************************************************************************************/
    componentWillUnmount() {
        //...
    } // end componentDidUnmount
    
    /*********************************************************************************************
     * function render
     *********************************************************************************************/
    render() {
        
        return (
            <svg>
                <rect
                    className="tank cylinder-box"
                    display=""
                    x="3%"
                    y="3%"
                    width="94%"
                    height="97%"
                    stroke="white"
                    strokeWidth="0.1"
                    strokeOpacity="0.5"
                    fill="black"
                />

                <ellipse />
                <path />
            </svg>                            
        )
    }// end function render
} // end class ComponentRenderer


export default Cylinder;

// eof 
