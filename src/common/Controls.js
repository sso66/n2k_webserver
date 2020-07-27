// File: src/common/Controls.js
// Note: Available Common Control Action Types 
// Date: 04/21/2020
//..................................................................................................
console.log( "Mounting Controls.js... " );

const Controls = { 

    ACTIVE_BUTTON2x1                       : "AB2x1",
    ACTIVE_BUTTON4x1                       : "AB4x1",
    ACTIVE_BUTTON2x1_GRAY                  : "A2G",
    ACTIVE_BUTTON4x1_GRAY                  : "A4G",

    AIR_CONDITIONING                       : "DAC", // Dometic Air Conditioning

    ANCHOR_WATCH                           : "AW",

    ARROW_BUTTON_LEFT                      : "ABtL",
    ARROW_BUTTON_RIGHT                     : "ABtR",
    ARROW_BUTTON_UP                        : "ABtU",
    ARROW_BUTTON_DOWN                      : "ABtD",

    ATTITUDE_INDICATOR                     : "At",

    BAR_GRAPH                              : "BAR_GRAPH",
    BAR_GRAPH_HORIZONTAL                   : "BAR_GRAPH_HORZ",

    BNWAS_TIMER                            : "BNWAS",
    BORDERLESS_BAR                         : "Bb",
    CARDINAL                               : "CARDINAL",
    CIRCUIT_BREAKER                        : "Cb",
    CLOCK                                  : "CLOCK",
    DEPTH_GRAPH                            : "DG",

    DIGITAL1x1                             : "DIGITAL1x1",
    DIGITAL2x1                             : "DIGITAL2x1",
    DIGITAL2x1INVISIBLE                    : "DIGITAL2x1I",
    DIGITAL_2_LINE                         : "DIGITAL2",
    DIGITAL_INPUT                          : "DIGITAL_IN",

    DIMMER                                 : "DMR",
    DIGITAL_COUNTER                        : "DIGITAL_COUNTER",
    DIGITAL_TIMER                          : "DIGITAL_TIMER",
    DOMETIC_ICEMAKER                       : "DIM",
    GAUGE                                  : "GAUGE",
    GPS_STATUS                             : "GPS",
    HEAD_UP_ROSE                           : "Cr", // This was called a COURSE UP ROSE
    HR_SWITCH                              : "HR_SW",
    
    INCLINOMETER                           : "Il",
    INDICATOR1x1                           : "INDICATOR1x1",
    INDICATOR2x1                           : "INDICATOR2x1",
    INDICATOR4x1                           : "INDICATOR4x1",

    INDICATOR_GRAPH                        : "IND_G",
    LINE_GRAPH                             : "L",

    MOMENTARY_HR_SWITCH                    : "MOMENTARY_HR_SW",
    MOMENTARY_PUSH_BUTTON1x1               : "MOMENTARY_PUSH_BUTTON1x1",
    MOMENTARY_PUSH_BUTTON_1                : "PM1",
    MOMENTARY_PUSH_BUTTON2x1               : "MOMENTARY_PUSH_BUTTON2x1",
    MOMENTARY_PUSH_BUTTON_4                : "PM4",
    MOMENTARY_PUSH_BUTTON4x1               : "MOMENTARY_PUSH_BUTTON4x1",
    MOMENTARY_PUSH_BUTTON_1x1_INVISIBLE    : "P1WI",
    MOMENTARY_SWITCH                       : "MS",
    MOMENTARY_SWITCH_VERTICAL              : "MSV",

    MOON_PHASE                             : "MOON",

    MULTILINE_TEXT_1x1                     : "Mt1x1",
    MULTILINE_TEXT_2x1                     : "Mt2x1",
    MULTILINE_TEXT_4x1                     : "Mt4x1",

    NORTH_UP_ROSE                          : "NORTH_UP_ROSE",

    PUSH_BUTTON1x1                         : "PUSH_BUTTON1x1",
    PUSH_BUTTON_1                          : "PUSH_BUTTON_1",
    PUSH_BUTTON2x1                         : "PUSH_BUTTON2x1",
    PUSH_BUTTON_4                          : "PUSH_BUTTON_4",
    PUSH_BUTTON4x1                         : "PUSH_BUTTON4x1",
    PUSH_BUTTON_1x1_INVISIBLE              : "PUSH_BUTTON_I",

    RUDDER_ANGLE                           : "RA",
    RUDDER_ANGLE_REVERSED                  : "RR",

    SEA_RECOVERY_STATUS                    : "SR",
    SIGNAL_STRENGTH                        : "SS",

    SMALL_BEAM_LEFT                        : "IND_BL",
    SMALL_BEAM_RIGHT                       : "IND_BR",
    SMALL_BEAM_UP                          : "IND_BU",
    SMALL_BEAM_DOWN                        : "IND_BD",
    SMALL_BEAM_CIRCLE                      : "IND_BC",

    SWITCH                                 : "S",
    SWITCH_VERTICAL                        : "SV",

    TANK                                   : "TANK",

    TEXT1x1                                : "TEXT1x1",
    TEXT2x1                                : "TEXT2x1",
    TEXT4x1                                : "TEXT4x1",

    TEXT_MESSAGE                           : "TXT",
    TRIM_BAR_GRAPH                         : "TB",
    DEMO_VIDEO                             : "V",
    VACUUM_GAUGE                           : "VG",

    VIDEO                                  : "AV",
    VIDEO1x1                               : "AV1x1",
    VIDEO3x4                               : "AV3x4",
    VIDEO4x3                               : "AV4x3",
    VIDEO16x9                              : "AV16x9",
    VIDEO_WITH_PTZ                         : "PTZ",
    VIDEO1x1_WITH_PTZ                      : "PTZ1x1",
    VIDEO3x4_WITH_PTZ                      : "PTZ3x4",
    VIDEO4x3_WITH_PTZ                      : "PTZ4x3",
    VIDEO16x9_WITH_PTZ                     : "PTZ16x9",

    WIND_ANGLE                             : "W",
    WIND_CLOSE_ANGLE                       : "Wc"
}

//-------------------------------------------------------------------------------------------------

const MOMENTARY_CONTROLS = [
    Controls.MOMENTARY_HR_SWITCH,
    Controls.MOMENTARY_PUSH_BUTTON1x1,
    Controls.MOMENTARY_PUSH_BUTTON2x1,
    Controls.MOMENTARY_PUSH_BUTTON4x1,
    Controls.MOMENTARY_PUSH_BUTTON_1x1_INVISIBLE,
    Controls.MOMENTARY_SWITCH,
    Controls.MOMENTARY_SWITCH_VERTICAL ];
    
function IsMomentary( control ) {
    return MOMENTARY_CONTROLS.indexOf( control ) >= 0;
}

const LOCKABLE_CONTROLS = [ 
    Controls.HR_SWITCH,
    Controls.PUSH_BUTTON1x1,
    Controls.PUSH_BUTTON2x1,
    Controls.PUSH_BUTTON4x1,
    Controls.PUSH_BUTTON_1x1_INVISIBLE,
    Controls.SWITCH,
    Controls.SWITCH_VERTICAL,
    Controls.MOMENTARY_HR_SWITCH,
    Controls.MOMENTARY_PUSH_BUTTON1x1,
    Controls.MOMENTARY_PUSH_BUTTON2x1,
    Controls.MOMENTARY_PUSH_BUTTON4x1,
    Controls.MOMENTARY_PUSH_BUTTON_1x1_INVISIBLE,
    Controls.MOMENTARY_SWITCH,
    Controls.MOMENTARY_SWITCH_VERTICAL ];

function IsLockable( control ) {
    return LOCKABLE_CONTROLS.indexOf( control ) >= 0;
}

function HasBreakerDetails( control ) {
    return LOCKABLE_CONTROLS.indexOf( control ) >= 0;
}

module.exports = {Controls, HasBreakerDetails, IsMomentary, IsLockable }

// eof
