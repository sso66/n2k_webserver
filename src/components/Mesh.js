// File: Mesh.js
// Note: To generate list of points for polygon and path SVG elements
// Date: 02/14/2020
//..................................................................................................
console.log( "Mounting Mesh.js..." );

function points( division, radius, offset = 0 ) {
    const angle = 360 / division;
    const vertexIndices = range(division);
        
    return vertexIndices.map(key => {
        return {
            theta: offset + degreesToRadians(offset+angle)*key, 
            r: radius
        };
    });
}

function range(division) {
    return Array.from(Array(division).keys());
}

function degreesToRadians( angleInDegrees ) {
    return (Math.PI * angleInDegrees) / 180;
}    

// ___ To describe a polygon centered at any location in SVG canvas ___
function describePolygon( division, radius, offset, [cx=0, cy=0] ) {
    return points(division, radius, offset)
            .map(pt => toCartesian(pt, [cx, cy]))
            .join(' '); 
}

function toCartesian({ r, theta }, [cx, cy]) {
    return [ cx + r * Math.cos(theta), cy + r * Math.sin(theta)];
}

// ___ To calculate the SVG path for an circular arc ( of a circle ) ___
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle){   
    console.log("<-- " + x+" "+y+" "+radius+" "+startAngle+" "+ endAngle);
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    console.log("d--> " + d); 
    return d;       
}
        
// ___ usage in html ___
// document.getElementById("arc1").setAttribute("d", describeArc(100, 100, 50, 0, 180));

// <path id="arc1" fill="none" stroke="#446688" stroke-width="20" />

// ___ usage in react js ___
// d={describeArc(10, 10, 10, -90, +90)}

//module.exports.polygon = polygon;
//module.exports.describeArc = describeArc;
export { describePolygon, describeArc }


// eof
