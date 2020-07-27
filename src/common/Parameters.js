// File: src/common/Parameters.js
// Note: Common Parameter Name Type Messages
// Date: 03/20/2020
//..................................................................................................
console.log( "Mounting Parameters.js... " );

const ParameterNames = {

    ALTITUDE                                : "ALTITUDE",

	BATTERY_AH_REMAINING 	                : "BATTERY_AH_REMAINING",
	BATTERY_STATE_OF_CHARGE                 : "BATTERY_SOC",
	BATTERY_STATE_OF_HEALTH                 : "BATTERY_SOH",
	BATTERY_TEMPERATURE                     : "BATTERY_TEMPERATURE",
	BATTERY_TIME_REMAINING                  : "BATTERY_TIME_REMAINING",

    BREAKER         		                : "BREAKER",

    BUS_AVERAGE_FREQUENCY 	                : "BUS_AV_FREQUENCY",
    BUS_AVERAGE_LINE_TO_NEUTRAL_VOLTAGE     : "BUS_AV_LN_VOLTAGE",
    BUS_AVERAGE_LINE_TO_LINE_VOLTAGE        : "BUS_AV_LL_VOLTAGE",
    BUS_PHASE_A_FREQUENCY                   : "BUS_PHASE_A_FREQUENCY",
    BUS_PHASE_A_TO_NEUTRAL_VOLTAGE          : "BUS_PHASE_A_LN_VOLTAGE",
    BUS_PHASE_A_TO_PHASE_B_VOLTAGE          : "BUS_PHASE_AB_VOLTAGE",
    BUS_PHASE_B_FREQUENCY                   : "BUS_PHASE_B_FREQUENCY",
    BUS_PHASE_B_TO_NEUTRAL_VOLTAGE          : "BUS_PHASE_B_VOLTAGE",
    BUS_PHASE_B_TO_PHASE_C_VOLTAGE          : "BUS_PHASE_BC_VOLTAGE",
    BUS_PHASE_C_FREQUENCY                   : "BUS_PHASE_C_FREQUENCY",
    BUS_PHASE_C_TO_NEUTRAL_VOLTAGE          : "BUS_PHASE_C_VOLTAGE",
    BUS_PHASE_C_TO_PHASE_A_VOLTAGE          : "BUS_PHASE_CA_VOLTAGE",

    
    COURSE_OVER_GROUND                      : "COG",

    DATE            		                : "DATE",
    DC_CURRENT      		                : "DC_CURRENT",
    DC_POWER        		                : "DC_POWER",
    DC_VOLTAGE      		                : "DC_VOLTAGE",
    DEPTH                                   : "DEPTH",
    DEPTH_TRANSDUCER_OFFSET                 : "DEPTH_TRANSDUCER_OFFSET",
    DEW_POINT                               : "DEW_POINT",
    
    HEADING                                 : "HEADING",
    HUMIDITY_INSIDE   		                : "HUMIDITY_INSIDE",
    HUMIDITY_OUTSIDE   		                : "HUMIDITY_OUTSIDE",
    INDICATOR       		                : "INDICATOR",
    
    LATITUDE_LONGITUDE                      : "LAT_LON",
    
    PITCH                                   : "PITCH",
    PRESSURE_BAROMETRIC		                : "PRESSURE_BAR",
    PRESSURE_STEAM   		                : "PRESSURE_STEAM",
    PRESSURE_WATER   		                : "PRESSURE_WATER",
    
    RIPPLE_VOLTAGE  		                : "RIPPLE_VOLTAGE",
    ROLL                                    : "ROLL",
    
    SCREEN_SELECT   		                : "SCREEN_SELECT",
    SPEED_OVER_GROUND                       : "SOG",
    SPEED_THROUGH_WATER                     : "STW",
    SWITCH_CURRENT                          : "SWITCH_CURRENT",
    SWITCH_GROUP                            : "SWITCH_GROUP",
    SWITCH_VOLTAGE                          : "SWITCH_VOLTAGE",
    
    TACHOMETER      		                : "TACHOMETER",
    TANK_CAPACITY                           : "TANK_CAPACITY",
    TANK_LEVEL                              : "TANK_LEVEL",
    TANK_REMAINING                          : "TANK_REMAINING",
    TEMPERATURE_SEA   	                    : "TEMPERATURE_SEA",
    TEMPERATURE_OUTSIDE 	                : "TEMPERATURE_OUTSIDE",
    TEMPERATURE_INSIDE 	                    : "TEMPERATURE_INSIDE",
    TEMPERATURE_ENGINE                      : "TEMPERATURE_ENGINE",
    TEMPERATURE_MAIN_CABIN                  : "TEMPERATURE_MAIN_CABIN",
    TEMPERATURE_LIVE_WELL                   : "TEMPERATURE_LIVE_WELL",
    TEMPERATURE_BAIT_WELL                   : "TEMPERATURE_BAIT_WELL",
    TEMPERATURE_REFRIGERATION               : "TEMPERATURE_REFRIGERATION",
    TEMPERATURE_HEATING_SYSTEM              : "TEMPERATURE_HEATING_SYSTEM",
    TEMPERATURE_FREEZER 	                : "TEMPERATURE_FREEZER",
    TEMPERATURE_EXHAUST 	                : "TEMPERATURE_EXHAUST",
    TIME            		                : "TIME",

    UTILITY_AVERAGE_CURRENT                 : "UTIL_AV_CURRENT",
    UTILITY_AVERAGE_FREQUENCY               : "UTIL_AV_FREQUENCY",
    UTILITY_AVERAGE_LINE_TO_NEUTRAL_VOLTAGE : "UTIL_AV_LN_VOLTAGE",
    UTILITY_AVERAGE_LINE_TO_LINE_VOLTAGE    : "UTIL_AV_LL_VOLTAGE",
    UTILITY_PHASE_A_APPARENT_POWER          : "UTIL_PHASE_A_APPARENT_POWER",
    UTILITY_PHASE_A_CURRENT                 : "UTIL_PHASE_A_CURRENT",
    UTILITY_PHASE_A_FREQUENCY               : "UTIL_PHASE_A_FREQUENCY",
    UTILITY_PHASE_A_POWER                   : "UTIL_PHASE_A_POWER",
    UTILITY_PHASE_A_POWER_FACTOR            : "UTIL_PHASE_A_POWER_FACTOR",
    UTILITY_PHASE_A_REACTIVE_POWER          : "UTIL_PHASE_A_REACTIVE_POWER",
    UTILITY_PHASE_A_REAL_POWER              : "UTIL_PHASE_A_REAL_POWER",
    UTILITY_PHASE_A_TO_NEUTRAL_VOLTAGE      : "UTIL_PHASE_A_LN_VOLTAGE",
    UTILITY_PHASE_A_TO_PHASE_B_VOLTAGE      : "UTIL_PHASE_AB_VOLTAGE",
    UTILITY_PHASE_B_APPARENT_POWER          : "UTIL_PHASE_B_APPARENT_POWER",
    UTILITY_PHASE_B_CURRENT                 : "UTIL_PHASE_B_CURRENT",
    UTILITY_PHASE_B_FREQUENCY               : "UTIL_PHASE_B_FREQUENCY",
    UTILITY_PHASE_B_POWER                   : "UTIL_PHASE_B_POWER",
    UTILITY_PHASE_B_POWER_FACTOR            : "UTIL_PHASE_B_POWER_FACTOR",
    UTILITY_PHASE_B_REACTIVE_POWER          : "UTIL_PHASE_B_REACTIVE_POWER",
    UTILITY_PHASE_B_REAL_POWER              : "UTIL_PHASE_B_REAL_POWER",
    UTILITY_PHASE_B_TO_NEUTRAL_VOLTAGE      : "UTIL_PHASE_B_LN_VOLTAGE",
    UTILITY_PHASE_B_TO_PHASE_C_VOLTAGE      : "UTIL_PHASE_BC_VOLTAGE",
    UTILITY_PHASE_C_APPARENT_POWER          : "UTIL_PHASE_C_APPARENT_POWER",
    UTILITY_PHASE_C_CURRENT                 : "UTIL_PHASE_C_CURRENT",
    UTILITY_PHASE_C_FREQUENCY               : "UTIL_PHASE_C_FREQUENCY",
    UTILITY_PHASE_C_POWER                   : "UTIL_PHASE_C_POWER",
    UTILITY_PHASE_C_POWER_FACTOR            : "UTIL_PHASE_C_POWER_FACTOR",
    UTILITY_PHASE_C_REACTIVE_POWER          : "UTIL_PHASE_C_REACTIVE_POWER",
    UTILITY_PHASE_C_REAL_POWER              : "UTIL_PHASE_C_REAL_POWER",
    UTILITY_PHASE_C_TO_NEUTRAL_VOLTAGE      : "UTIL_PHASE_C_LN_VOLTAGE",
    UTILITY_PHASE_C_TO_PHASE_A_VOLTAGE      : "UTIL_PHASE_CA_VOLTAGE",

    VARIATION                               : "VARIATION",
    
    WATER_BELOW_TRANSDUCER                  : "WATER_BELOW"

};

module.exports = { ParameterNames };

// eof
