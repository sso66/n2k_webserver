// File: src/components/ComponentEditor.jsx
// Note: Describe SVG DOM Element Types for N2KView Component Types
// Date: 02/20/2020
//..................................................................................................
import React from 'react';

import { describePolygon, describeArc } from './Mesh';

console.log( "Mounting ComponentEditor.jsx... <ComponentEditor />" );

class ComponentEditor extends React.Component{
    
    render() {
        return (
            <g display={this.props.display}>
                {/* describePolygon( division, radius, offset, [cx=0, cy=0] ) */}
                <polygon 
                    points={describePolygon(5, 5, 0, [10, 10])} 
                    fill="#F90" 
                    stroke="#000" 
                    strokeWidth="0.5"
                />
                
                
                {/* describeArc(x, y, radius, startAngle, endAngle) method */}
                <path 
                    d="
                        // M0,0 
                        // A50,50 0 0 0 50,50
                    // "
                    d={describeArc(10, 12, 10, -90, +90)}
                    fill="none"
                    stroke="#FFF" 
                    strokeWidth="0.5"
                />
            </g>                
        )
    }
}

//..................................................................................................
// ComponentSVGRectElement.jsx
// Using SVG DOM with React JS
//..................................................................................................
console.log("Mounting ComponentSVGInterface... <ComponentSVGInterface>")

class ComponentSVGRectElement extends React.Component {
    constructor(props) {
        super(props);   
        this.state = {
            rect: { x:0, y:0 }
        }
    }

    dragStart(event, draggedElement) {
        event.preventDefault();

        let point = this.svg.createSVGPoint();

        point.x = event.clientX;
        point.y = event.clientY;

        point = point.matrixTransform(this.svg.getScreenCTM().inverse());

        this.setState({dragOffset: {
                x: point.x - this.state.rect.x,
                y: point.y - this.state.rect.y
            }
        });

        const mousemove = (event) => {
            event.preventDefault();          

            point.x = event.clientX;
            point.y = event.clientY;

            let cursor = point.matrixTransform(this.svg.getScreenCTM().inverse());

            this.setState({rect: {
                x: cursor.x - this.state.dragOffset.x,
                y: cursor.y - this.state.dragOffset.y
            }});
        };
        
        const mouseup = (event) => {
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("mouseup", mouseup);
        }
  
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
    }   

    render() {
        return (
            <svg 
                id="react-svg-dom" 
                ref={ (svg) => this.svg = svg }
            >
                <rect
                    display={this.props.display}
                    x={this.state.rect.x}
                    y={this.state.rect.y}
                    width="10"
                    height="10"
                    stroke="#fff"
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                    fill="#0ff"
                    fillOpacity="0.5"
                    ref={(e) => this.svgRectElement = e}
                    onMouseDown={ (e) => this.dragStart(e, this.svgRectElement) }
                />
            </svg>
        )
    }
}

//..................................................................................................
// ComponentSVGCircleElement.jsx
// Using SVG DOM with React JS
//..................................................................................................
class ComponentSVGCircleElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {};
    }
    
    render() {
        return (
            <svg>
                <circle
                    className=""
                    display={this.props.display}
                    cx="50%"
                    cy="20"
                    r="40%"
                    stroke="white"
                    strokeWidth="0.5"
                    fill="none"
                />
            </svg>                
        )
    }
}    

//..................................................................................................
// ComponentSVGEllipseElement.jsx
// Using SVG DOM with React JS
//..................................................................................................
class ComponentSVGEllipseElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {};
    }
    
    render() {
        return (
            <svg>
                <ellipse
                    className=""
                    display={this.props.display}
                    cx="50%"
                    cy="8%"
                    rx="46%"
                    ry="2"
                    stroke="#C0C0C0"
                    strokeWidth="0.25"
                    fill="#F90"
                />
            </svg>                
        )
    }
}    

//..................................................................................................
// ComponentSVGPolygonElement.jsx
// Using SVG DOM with React JS
//..................................................................................................
class ComponentSVGPolygonElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {};
    }
    
    render() {
        return (
            <svg>
                <polygon
                    className=""
                    display={this.props.display}
                    points="0,0 50,25 50,75 0,0"
                    stroke="white"
                    strokeWidth="0.5"
                    fill="red"
                />
            </svg>                
        )
    }
}    

//..................................................................................................
// ComponentSVGPathElement.jsx
// Using SVG DOM with React JS
//..................................................................................................
class ComponentSVGPathElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {};
    }
    
    render() {
        return (
            <svg>
                <path
                    className=""
                    d="
                     M0,5
                     A5,5 0 0,0 29,5
                     A10,5 0 0,0 0,5
                     L0,5
                     A5,5,0 0,0 29,27
                     L29,15             
                    "
                    display={this.props.display}
                    stroke="#FFF"
                    strokeWidth="0.5"
                    fill="lime"
                >
                <text display="" fill="red" style={{fontSize: 8+'px'}} x={0} y={21}>Hello World</text>
                </path>
            </svg>                
        )
    }
}    

//..................................................................................................
// ComponentSVGBaseAnimVal.jsx
// Using SVG DOM with React JS
//..................................................................................................
console.log("Mounting ComponentSVGInterface... <ComponentSVGInterface>")

class ComponentSVGAnimatedXxx extends React.Component {
    constructor(props) {
        super(props);   
        this.state = {
            ellipse: { x:0, y:0 }
        }
    }

    render() {
        return (
            <svg 
                ref={ (svg) => this.svg = svg }
            >
                <g>
                    <rect
                        display={this.props.display}
                        cx="10"
                        cy="10"
                        rx="5"
                        ry="3"
                        x={this.state.ellipse.x}
                        y={this.state.ellipse.y}
                        stroke="#fff"
                        strokeWidth="0.5"
                        strokeOpacity="0.5"
                        fill="#0ff"
                        fillOpacity="0.5"
                        ref={(e) => this.svgEllipseElement = e}
                    />
                    <text 
                        display={this.props.display} 
                        fill="red" style={{fontSize: 0.16+'rem'}} 
                        x={0} 
                        y={40}>
                            baseVal+AnimVal
                    </text>                    
                </g>
            </svg>
        )
    }
}


export { 
    ComponentEditor, 
    ComponentSVGRectElement, 
    ComponentSVGCircleElement, 
    ComponentSVGEllipseElement, 
    ComponentSVGPolygonElement,
    ComponentSVGPathElement,
    ComponentSVGAnimatedXxx
};
    

// eof 
