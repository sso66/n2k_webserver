// File: src/common/HumiditySources.js
// Note: Common Humidity Sources Message Types
// Date: 03/20/2020
//..................................................................................................
console.log( "Mounting HumiditySources.js... " );

const HumiditySources = {

    INSIDE  : 0,
    OUTSIDE : 1
}

/*************************************************************************************************
 * function GetValue
 *************************************************************************************************/
function GetValue( name ) {
    switch( name )
    {
        case "HUMIDITY_OUTSIDE"          : return HumiditySources.OUTSIDE;
        case "HUMIDITY_INSIDE"           : return HumiditySources.INSIDE;
    }
    console.log( "-- HumiditySources.GetValue did not convert = " + name);
} // end function GetValue

/*************************************************************************************************/

module.exports = { HumiditySources, GetValue };

// eof

