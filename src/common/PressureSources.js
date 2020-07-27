// File: src/common/PressureSources.js
// Note: Common Pressure Sources Message Types
// Date: 03/20/2020
//..................................................................................................
console.log( "Mounting PressureSources.js... " );

const PressureSources = {
    ATMOSPHERIC         : 0,
    WATER               : 1,
    STEAM               : 2,
    COMPRESSED_AIR      : 3,
    HYDRAULIC           : 4,
    FILTER              : 5,
    ALTIMETER_SETTING   : 6,
    USER_DEFINED_129    : 129,
    USER_DEFINED_130    : 130,
    USER_DEFINED_131    : 131,
    USER_DEFINED_132    : 132,
    USER_DEFINED_133    : 133,
    USER_DEFINED_134    : 134,  
    USER_DEFINED_135    : 135,
    USER_DEFINED_136    : 136,
    USER_DEFINED_137    : 137,
    USER_DEFINED_138    : 138,
    USER_DEFINED_139    : 139,
    USER_DEFINED_140    : 140,
    USER_DEFINED_141    : 141,
    USER_DEFINED_142    : 142,
    USER_DEFINED_143    : 143,
    USER_DEFINED_144    : 144,
    properties: {
        0  : { name : "Atmospheric", value:0 },
        1  : { name : "Water", value:1 },
        2  : { name : "Steam", value:2 },
        3  : { name : "Compressed Air", value:3 },
        4  : { name : "Hydraulic", value:4 },
        5  : { name : "Filter", value:5 },
        6  : { name : "Altimeter Setting", value:6 },
        129: { name : "User Defined 129", value:129 },
        130: { name : "User Defined 130", value:130 },
        131: { name : "User Defined 131", value:131 },
        132: { name : "User Defined 132", value:132 },
        133: { name : "User Defined 133", value:133 },
        134: { name : "User Defined 134", value:134 },
        135: { name : "User Defined 135", value:135 },
        136: { name : "User Defined 136", value:136 },
        137: { name : "User Defined 137", value:137 },
        138: { name : "User Defined 138", value:138 },
        139: { name : "User Defined 139", value:139 },
        140: { name : "User Defined 140", value:140 },
        141: { name : "User Defined 141", value:141 },
        142: { name : "User Defined 142", value:142 },
        143: { name : "User Defined 143", value:143 },
        144: { name : "User Defined 144", value:144 },
    }
};

/*************************************************************************************************
 * function GetValue
 *************************************************************************************************/
function GetValue( name ) {
    switch( name )
    {
        case "PRESSURE_BAR"                 :
        case "PRESSURE_ATMOSPHERIC"         : return PressureSources.ATMOSPHERIC;
        case "PRESSURE_WATER"               : return PressureSources.WATER;
        case "PRESSURE_STEAM"               : return PressureSources.STEAM;
        case "PRESSURE_COMPRESSED_AIR"      : return PressureSources.COMPRESSED_AIR;
        case "PRESSURE_HYDRAULIC"           : return PressureSources.HYDRAULIC;
        case "PRESSURE_FILTER"              : return PressureSources.FILTER;
        case "PRESSURE_ALTIMETER_SETTING"   : return PressureSources.ALTIMETER_SETTING;
    }
    console.log( "-- PressureSources.GetValue did not convert = " + name);
} // end function GetValue

/*************************************************************************************************/

module.exports = { PressureSources, GetValue };

// eof
