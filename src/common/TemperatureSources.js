// File: src/common/TemperatureSources.js
// Note: Common Temperature Sources Message Types for N2KView Messages
// Date: 03/20/2020
//..................................................................................................
console.log( "Mounting TemperatureSources.js... " );

const TemperatureSources = {
    SEA                     : 0,
    OUTSIDE                 : 1,
    INSIDE                  : 2,
    ENGINE_ROOM             : 3,
    MAIN_CABIN              : 4,
    LIVE_WELL               : 5,
    BAIT_WELL               : 6,
    REFRIGERATION           : 7,
    HEATING_SYSTEM          : 8,
    DEW_POINT               : 9,
    WIND_CHILL_APPARENT     : 10,
    WIND_CHILL_THEORETICAL  : 11,
    HEAT_INDEX              : 12,
    FREEZER                 : 13,
    EXHAUST_GAS             : 14,
    USER_DEFINED_129        : 129,
    USER_DEFINED_130        : 130,
    USER_DEFINED_131        : 131,
    USER_DEFINED_132        : 132,
    USER_DEFINED_133        : 133,
    USER_DEFINED_134        : 134,
    USER_DEFINED_135        : 135,
    USER_DEFINED_136        : 136,
    USER_DEFINED_137        : 137,
    USER_DEFINED_138        : 138,
    USER_DEFINED_139        : 139,
    USER_DEFINED_140        : 140,
    USER_DEFINED_141        : 141,
    USER_DEFINED_142        : 142,
    USER_DEFINED_143        : 143,
    USER_DEFINED_144        : 144,
    properties: {
        0  : { name : "Sea", value:0 },
        1  : { name : "Outside", value:1 },
        2  : { name : "Inside", value:2 },
        3  : { name : "Engine Room", value:3 },
        4  : { name : "Main Cabin", value:4 },
        5  : { name : "Live Well", value:5 },
        6  : { name : "Bait Well", value:6 },
        7  : { name : "Refrigeration", value:7 },
        8  : { name : "Heating System", value:8 },
        9  : { name : "Dew Point", value:9 },
        10 : { name : "Wind Chill Apparent", value:10},
        11 : { name : "Wind Chill Theoretical", value:11},
        12 : { name : "Heat Index", value:12},
        13 : { name : "Freezer", value:13},
        14 : { name : "Exhaust Gas", value:14},
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
}

/*************************************************************************************************
 * function GetValue
 *************************************************************************************************/
function GetValue( name ) {
    switch( name )
    {
        case "TEMPERATURE_SEA"              : return TemperatureSources.SEA;
        case "TEMPERATURE_OUTSIDE"          : return TemperatureSources.OUTSIDE;
        case "TEMPERATURE_INSIDE"           : return TemperatureSources.INSIDE;
        case "TEMPERATURE_ENGINE_ROOM"      : return TemperatureSources.ENGINE_ROOM;
        case "TEMPERATURE_MAIN_CABIN"       : return TemperatureSources.MAIN_CABIN;
        case "TEMPERATURE_LIVE_WELL"        : return TemperatureSources.LIVE_WELL;
        case "TEMPERATURE_BAIT_WELL"        : return TemperatureSources.BAIT_WELL;
        case "TEMPERATURE_REFRIGERATION"    : return TemperatureSources.REFRIGERATION;
        case "TEMPERATURE_HEATING_SYSTEM"   : return TemperatureSources.HEATING_SYSTEM;
        case "TEMPERATURE_FREEZER"          : return TemperatureSources.FREEZER;
        case "TEMPERATURE_EXHAUST"          : return TemperatureSources.EXHAUST_GAS;
    }
    console.log( "-- TemperatureSources.GetValue did not convert = " + name);
} // end function GetValue

/*************************************************************************************************/

module.exports = { TemperatureSources, GetValue };

// eof
