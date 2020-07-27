// File: server/Units.js
// Note: NMEA 2000 Units Types Converson Utility
// Date: 04/15/2020
//..................................................................................................
console.log( "--> constructing Units" );

const FEET_PER_NAUTICAL_MILE   = 6076.12;
const METERS_PER_NAUTICAL_MILE = 1852.0;

/*************************************************************************************************
 * Converts Depth in meters to display Units
 *************************************************************************************************/
function ConvertDepth( value, units ) {
    switch ( units.toLowerCase() )
    {
        case "feet"    : return value*3.28084;
        case "yards"   : return value*1.09361;
        case "fathoms" : return value*0.546807;
        case "meters"  :
        case "metres"  : return value;
    }
    return value;
} // end function ConvertDepth

/*************************************************************************************************
 * Converts ConvertPressure in Pascals to display Units
 *************************************************************************************************/
function ConvertPressure( value, units ) {
    // console.log( "--> Units.ConvertPressure, value = " + value + ", units = " + units );
    switch ( units.toLowerCase() )
    {
        case "kilopascals"          : return value/1000;
        case "bars"                 : return value/100000;
        case "millibars"            : return value/100;
        case "millimeters mercury"  : return value/133.3223684;
        case "inches mercury"       :
        case "in hg"                : return value/3386.389;
        case "psi"                  : return value/6894.76;
        case "feet"                 : return value*0.000334552565551;
        case "inches"               : return value*12*0.000334552565551;
        case "meters"               :
        case "metres"               : return value*0.000102;
    }
    console.log( "<-- Units.ConvertPressure, unit not found" );
    return value;
} // end function ConvertPressure

/*************************************************************************************************
 * Converts Angle in Radians to Degrees
 * @param radians signed angle
 * @return string of angle in degrees to 1 decimal place limited from -180 to 180 degrees
 *************************************************************************************************/
function ConvertRelativeAngle( radians ) {
    var degrees = radians*180/Math.PI;
    while ( degrees < -180 )
        degrees += 360;
    while ( degrees > 180 )
        degrees -= 360;
    return degrees;
    // return +degrees.toFixed(1)+"°"
} // end function ConvertRelativeAngle

/*************************************************************************************************
 * Converts Speed in meters/sec to display Units
 *************************************************************************************************/
function ConvertSpeed( value, units ) {
    switch ( units.toLowerCase() )
    {
        case "km/h" : return value*3.6;
        case "nm/h" : return value/METERS_PER_NAUTICAL_MILE*3600;
        case "mph"  : return value/1609.344*3600;
    }
    return value;
} // end function ConvertSpeed

/*************************************************************************************************
 * Converts Temperature in Kelvin to display Units
 *************************************************************************************************/
function ConvertTemperature( value, units ) {
    switch ( units.toLowerCase() )
    {
        case "°f" : return value*1.8-459.67;
        case "°c" : return value-273.15;
    }
    return value;
} // end function ConvertTemperature

/*************************************************************************************************
 * Converts Volume in Cubic Meters to display Units
 *************************************************************************************************/
function ConvertVolume( value, units ) {
    switch ( units.toLowerCase() )
    {
        case "liter"  :
        case "litre"  :
        case "liters" :
        case "litres" : return value*1000;
        case "gallons" :
        case "us gallons" :
        case "gallon" :
        case "us gallon" :
        case "gal (us)" : return value*264.17205235814845;
        case "imperial gallons" :
        case "imperial gallon" :
        case "gal (imp)" : return value*219.96924829908778;
    }
    return value;
} // end function ConvertVolume

/*************************************************************************************************/

console.log( "<-- constructing Units" );

module.exports = { ConvertDepth,
                   ConvertPressure,
                   ConvertRelativeAngle,
                   ConvertSpeed,
                   ConvertTemperature,
                   ConvertVolume };

// eof
