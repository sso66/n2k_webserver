// File: Protocols.js
// Note: To talk to any Display Unit or Device compatible with N2K prototcol 
// Date: 04/15/2020
//..............................................................................
console.log( "--> constructing Protocols" );

var Globals         = require('../Globals');
var TimeConstants   = require('../TimeConstants');

console.log( "    constructing Protocols: require complete" );
/*
 * NMEA 2000 protocol:
 * NMEA 2000 connects devices using Controller Area Network (CAN) technology 
 * originally developed for the auto industry. NMEA 2000 is based on the 
 * SAE J1939 high-level protocol, but defines its own messages. ... 
 * It uses a compact binary message format as opposed to the ASCII serial 
 * communications protocol used by NMEA 0183.
 */

const Protocols = {
    
    "59392" : {
                name:"ISO Acknowledgement",
                priority:6,
                singleFrame:true,
                fields:{
                    "Control Byte"                  : { type:"uint8", position:0},
                    "Group Function"                : { type:"uint8", position:1},
                    "Reserved"                      : { type:"uint24", position:2},
                    "PGN"                           : { type:"pgn24", position:3}
                }
            },

    "59904" : {
                name:"ISO Request",
                priority:6,
                singleFrame:true,
                fields : {
                    "PGN"                           : { type:"pgn24", position:0 }
                    }
            },

    "60928" : {
                name:"ISO Address Claim",
                priority:6,
                singleFrame:true,
                fields:{
                    "Unique Number"                 : { type:"uint21", position:0},
                    "Manufacturer Code"             : { type:"uint11", position:1, testValue:137},
                    "Device Instance Lower"         : { type:"uint3",  position:2},
                    "Device Instance Upper"         : { type:"uint5",  position:3},
                    "Device Function"               : { type:"uint8",  position:4},
                    "Reserved"                      : { type:"uint1",  position:5},
                    "Device Class"                  : { type:"uint7",  position:6},
                    "System Instance"               : { type:"uint4",  position:7},
                    "Industry Group"                : { type:"uint3",  position:8, testValue:"4"},
                    "ISO Self Configurable"         : { type:"uint1",  position:9}
                    }
                },

    "61184_SEA_RECOVERY_STATUS" : {
                name:"Sea Recovery Watermaker Control",
                priority:2,
                singleFrame:true,
                fields:{
                    "Manufacturer Code"             : { type:"uint11", position:0, testValue:"285"},
                    "Reserved"                      : { type:"uint2",  position:1 },
                    "Industry Group"                : { type:"uint3",  position:2, testValue:"4"},
                    "Message Id"                    : { type:"uint8",  position:3, testValue:"4"},
                    "Command"                       : { type:"uint4",  position:4 },
                    "Reserved2"                     : { type:"uint4",  position:5 }
                }
            },

	"61184_CARLING_REQUEST_FOR_INFORMATION" : {
                name:"Carling Request For Information",
                priority:2,
				singleFrame:true,
				fields : {
                    "Manufacturer Code"             : { type:"uint11", position:0, testValue:"1046"},
                    "Reserved"                      : { type:"uint2",  position:1, testValue:"3"},
                    "Industry Group"                : { type:"uint3",  position:2, testValue:"0"},
					"Message Type"                  : { type:"uint8",  position:3, testValue:"5"},
					"Breaker Mapping 1"             : { type:"uint8s", position:4 },
					"Breaker Mapping 2"             : { type:"uint8s", position:5 },
                    "Reserved 2"                    : { type:"uint5",  position:6 },
                    "Breaker Mapping 3"             : { type:"uint3",  position:7 },
					"Info Requested"                : { type:"uint8s", position:8 }
				}
			},

    // This is sent to the AC Panel or DC Panel to Lock/Unlock a Breaker
    "61184_CARLING_BREAKER_COMMAND" : {
                name:"Carling Breaker Command",
                priority:2,
                singleFrame:true,
                fields : {
                    "Manufacturer Code"             : { type:"uint11", position:0, testValue:"1046"},
                    "Reserved"                      : { type:"uint2",  position:1, testValue:"3"},
                    "Industry Group"                : { type:"uint3",  position:2, testValue:"0"},
                    "Message Type"                  : { type:"uint8",  position:3, testValue:"2"},
                    "Breaker Mapping 1"             : { type:"uint8s", position:4 },
                    "Breaker Mapping 2"             : { type:"uint8s", position:5 },
                    "Reserved 2"                    : { type:"uint5",  position:6 },
                    "Breaker Mapping 3"             : { type:"uint3",  position:7 },
                    "Breaker Command"               : { type:"uint8s", position:8 },
                    "Dim Value"                     : { type:"uint8",  position:9}
                }
            },

    "65001" : {
                name:"Bus #1 Phase C Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Line-Line Voltage"             : { type:"uint16_65030", position:0},       // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},       // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:1} // resolution = 1/128 Hz
                }
            },

    "65002" : {
                name:"Bus #1 Phase B Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                devices:[],
                singleFrame:true,
                fields:{
                    "Line-Line Voltage"             : { type:"uint16_65030", position:0},       // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},       // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2} // resolution = 1/128 Hz
                }
            },

    "65003" : {
                name:"Bus #1 Phase A Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                devices:[],
                singleFrame:true,
                fields:{
                    "Line-Line Voltage"             : { type:"uint16_65030", position:0},       // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},       // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2} // resolution = 1/128 Hz
                }
            },

    "65004" : {
                name:"Bus Average Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Line-Line Voltage"             : { type:"uint16_65030", position:0},    // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},    // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2} // resolution = 1/128 Hz
                }
            },

    "65005" : {
                name:"Utility Total AC Energy",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "kW Hours Export"               : { type:"uint32_65030", position:0},
                    "kW Hours Import"               : { type:"uint32_65030", position:1}
                }
            },

    "65006" : {
                name:"Utility Phase C AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Reactive Power"                : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, position:1},
                    "Power Factor Lagging"          : { type:"uint2_65030", offset:2000000000, position:2}
                }
            },

    "65007" : {
                name:"Utility Phase C AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Real Power"                    : { type:"uint32_65030", offset:2000000000, position:0},
                    "Apparent Power"                : { type:"uint32_65030", offset:2000000000, position:1}
                }
            },

    "65008" : {
                name:"Utility Phase C Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "CA Line-Line Voltage"          : { type:"uint16_65030", position:0},
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2},
                    "Current"                       : { type:"uint16_65030", position:3}
                }
            },

    "65009" : {
                name:"Utility Phase B AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Reactive Power"                : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, position:1},
                    "Power Factor Lagging"          : { type:"uint2_65030", offset:2000000000, position:2}
                }
            },

    "65010" : {
                name:"Utility Phase B AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Real Power"                    : { type:"uint32_65030", offset:2000000000, position:0},
                    "Apparent Power"                : { type:"uint32_65030", offset:2000000000, position:1}
                }
            },

    "65011" : {
                name:"Utility Phase B Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "BC Line-Line Voltage"          : { type:"uint16_65030", position:0},
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2},
                    "Current"                       : { type:"uint16_65030", position:3}
                }
            },

    "65012" : {
                name:"Utility Phase A AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Reactive Power"                : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, position:1},
                    "Power Factor Lagging"          : { type:"uint2_65030", offset:2000000000, position:2}
                }
            },

    "65013" : {
                name:"Utility Phase A AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Real Power"                    : { type:"uint32_65030", offset:2000000000, position:0},
                    "Apparent Power"                : { type:"uint32_65030", offset:2000000000, position:1}
                }
            },

    "65014" : {
                name:"Utility Phase A Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "AB Line-Line Voltage"          : { type:"uint16_65030", position:0},
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2},
                    "Current"                       : { type:"uint16_65030", position:3}
                }
            },

    "65015" : {
                name:"Utility Total AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Total Reactive Power"          : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, offset:1, position:1},
                    "Power Factor Lagging"          : { type:"uint2_65030", position:2}
}
            },

    "65016" : {
                name:"Utility Total AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Total Real Power"              : { type:"uint32_65030", offset:2000000000, position:0},
                    "Total Apparent Power"          : { type:"uint32_65030", offset:2000000000, position:1}
                }
            },

    "65017" : {
                name:"Utility Average Basic AC Properties",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Line-Line Voltage"             : { type:"uint16_65030", position:0},       // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},       // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2}, // resolution = 1/128 Hz
                    "Current"                       : { type:"uint16_65030", position:3}        // Amps
                }
            },

    "65018" : {
                name:"Generator Total AC Energy",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "kW Hours Export"               : { type:"uint32_65030", position:0},
                    "kW Hours Import"               : { type:"uint32_65030", position:1}
                }
            },

    "65019" : {
                name:"Generator Phase C AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Reactive Power"                : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, offset:1, position:1},
                    "Power Factor Lagging"          : { type:"uint2_65030", position:2}
                }
            },

    "65020" : {
                name:"Generator Phase C AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Real Power"                    : { type:"uint32_65030", offset:2000000000, position:0},
                    "Apparent Power"                : { type:"uint32_65030", offset:2000000000, position:1}
                }
            },

    "65021" : {
                name:"Generator Phase C Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "CA Line-Line Voltage"          : { type:"uint16_65030", position:0},   // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},   // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2}, // resolution = 1/128 Hz
                    "Current"                       : { type:"uint16_65030", position:3}    // Amps
                }
            },

    "65022" : {
                name:"Generator Phase B AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Reactive Power"                : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, offset:1, position:1},
                    "Power Factor Lagging"          : { type:"uint2_65030", position:2}
                }
            },

    "65023" : {
                name:"Generator Phase B AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Real Power"                    : { type:"uint32_65030", offset:2000000000, position:0},
                    "Apparent Power"                : { type:"uint32_65030", offset:2000000000, position:1}
                }
            },

    "65024" : {
                name:"Generator Phase B Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "BC Line-Line Voltage"          : { type:"uint16_65030", position:0},   // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},   // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2}, // resolution = 1/128 Hz
                    "Current"                       : { type:"uint16_65030", position:3}    // Amps
                }
            },

    "65025" : {
                name:"Generator Phase A AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Reactive Power"                : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, offset:1, position:1},
                    "Power Factor Lagging"          : { type:"uint2", position:2}
                }
            },

    "65026" : {
                name:"Generator Phase A AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Real Power"                    : { type:"uint32_65030", offset:2000000000, position:0},
                    "Apparent Power"                : { type:"uint32_65030", offset:2000000000, position:1}
                }
            },

    "65027" : {
                name:"Generator Phase A Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "AB Line-Line Voltage"          : { type:"uint16_65030", position:0},   // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},   // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2}, // resolution = 1/128 Hz
                    "Current"                       : { type:"uint16_65030", position:3}    // Amps
                }
            },

    "65028" : {
                name:"Generator Total AC Reactive Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Total Reactive Power"          : { type:"uint32_65030", offset:2000000000, position:0},
                    "Power Factor"                  : { type:"uint16_65030", resolution:1/16384, offset:1, position:1},
                    "Power Factor Lagging"          : { type:"uint2_65030", position:2}
                }
            },

    "65029" : {
                name:"Generator Total AC Power",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Total Real Power"              : { type:"uint32_65030", offset:2000000000, position:0}, // Watts
                    "Total Apparent Power"          : { type:"uint32_65030", offset:2000000000, position:1}  // Watts
                }
            },

    "65030" : {
                name:"Generator Average Basic AC Quantities",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:500,
                singleFrame:true,
                fields:{
                    "Line-Line Voltage"             : { type:"uint16_65030", position:0},   // Volts
                    "Line-Neutral Voltage"          : { type:"uint16_65030", position:1},   // Volts
                    "Frequency"                     : { type:"uint16_65030", resolution:1/128, position:2}, // resolution = 1/128 Hz
                    "Current"                       : { type:"uint16_65030", position:3}    // Amps
                }
            },

    "65284": {
                name:"DC Breaker Current",
                priority:6,
                singleFrame:true,
                defaultUpdateRate:TimeConstants.ONE_SECOND,
                timeout:2*TimeConstants.SECONDS,
                instanceField:"Bank Instance",
                indexes:{source:"Indicator Number"},
                fields:{
                    "Manufacturer Code"             : { type:"uint11", testValue:"137", position:0},
                    "Reserved"                      : { type:"uint2", position:1},
                    "Industry Group"                : { type:"uint3", testValue:"4", position:2},
                    "Bank Instance"                 : { type:"uint8", position:3},
                    "Indicator Number"              : { type:"uint8", position:4}, // 252 = total current at distribution box
                    "Breaker Current"               : { type:"int16", resolution:0.1, position:5}, // + means current exported to load, 1/10 Amp
                    "Reserved"                      : { type:"uint16", position:6}
                }
            },

    "65286" : {
                name:"Fluid Flow Rate",
                priority:5,
                singleFrame:true,
                defaultUpdateRate:500,
                timeout:2*TimeConstants.SECONDS,
                instanceField:"Flow Rate Instance",
                indexes:{fluidType:"Fluid Type"},
                fields:{
                    "Manufacturer Code"             : { type:"uint11", testValue:"137", position:0},
                    "Reserved"                      : { type:"uint2", position:1},
                    "Industry Group"                : { type:"uint3", testValue:"4", position:2},
                    "SID"                           : { type:"uint8", position:3},
                    "Flow Rate Instance"            : { type:"uint8", position:4},
                    "Fluid Type"                    : { type:"uint4", position:5},
                    "Reserved"                      : { type:"uint4", position:6},
                    "Fluid Flow Rate"               : { type:"int24", resolution:"0.0001", position:7} // cubic metres per hour
                }
            },

    "65287" : {
                name:"Trip Volume",
                priority:5,
                singleFrame:true,
                defaultUpdateRate:TimeConstants.ONE_SECOND,
                timeout:2*TimeConstants.SECONDS,
                instanceField:"Volume Instance",
                indexes:{fluidType:"Fluid Type"},
                fields:{
                    "Manufacturer Code"             : { type:"uint11", testValue:"137", position:0},
                    "Reserved"                      : { type:"uint2", position:1},
                    "Industry Group"                : { type:"uint3", testValue:"4", position:2},
                    "SID"                           : { type:"uint8", position:3},
                    "Volume Instance"               : { type:"uint8", position:4},
                    "Fluid Type"                    : { type:"uint4", position:5},
                    "Reserved"                      : { type:"uint4", position:6},
                    "Trip Volume"                   : { type:"uint24", resolution:"0.001", position:7} // cubic metres
                }
            },

    "65288" : {
                name:"4-20 mA",
                priority:5,
                singleFrame:true,
                defaultUpdateRate:200,
                timeout:2*TimeConstants.SECONDS,
                instanceField:"Data Instance",
                fields:{
                    "Manufacturer Code"             : { type:"uint11", testValue:"137", position:0},
                    "Reserved"                      : { type:"uint2",  position:1},
                    "Industry Group"                : { type:"uint3",  testValue:"4", position:2},
                    "SID"                           : { type:"uint8",  position:3},
                    "Data Instance"                 : { type:"uint8",  position:4},
                    "4-20 mA Data"                  : { type:"uint16", position:5}, // milliAmps
                    "Reserved"                      : { type:"uint16", position:6}
                    }
            },

    "65289" : {
                name:"0-10 V",
                priority:5,
                singleFrame:true,
                defaultUpdateRate:200,
                timeout:2*TimeConstants.SECONDS,
                instanceField:"Data Instance",
                fields:{
                    "Manufacturer Code"             : { type:"uint11", testValue:"137", position:0},
                    "Reserved"                      : { type:"uint2",  position:1},
                    "Industry Group"                : { type:"uint3",  testValue:"4", position:2},
                    "SID"                           : { type:"uint8",  position:3},
                    "Data Instance"                 : { type:"uint8",  position:4},
                    "0-10 V Data"                   : { type:"uint16", resolution:"0.000244140625", position:4}, // Volts (resolution=1/4096)
                    "Reserved"                      : { type:"uint16", position:6}
                }
            },

    "65290" : {
                name:"Rotational Rate",
                priority:5,
                singleFrame:true,
                defaultUpdateRate:200,
                timeout:2*TimeConstants.SECONDS,
                instanceField:"Data Instance",
                fields:{
                    "Manufacturer Code"             : { type:"uint11", testValue:"137", position:0},
                    "Reserved"                      : { type:"uint2", position:1},
                    "Industry Group"                : { type:"uint3", testValue:"4", position:2},
                    "SID"                           : { type:"uint8", position:3},
                    "Data Instance"                 : { type:"uint8", position:4},
                    "Rotational Rate"               : { type:"uint16", resolution:"0.25", position:5}, // RPM (resolution=1/4)
                    "Reserved"                      : { type:"uint16", position:6}
                }
            },

    "65291" : {
                name:"Resistance",
                priority:5,
                singleFrame:true,
                defaultUpdateRate:200,
                timeout:2*TimeConstants.SECONDS,
                instanceField:"Data Instance",
                fields:{
                    "Manufacturer Code"             : { type:"uint11", testValue:"137", position:0},
                    "Reserved"                      : { type:"uint2", position:1},
                    "Industry Group"                : { type:"uint3", testValue:"4", position:2},
                    "SID"                           : { type:"uint8", position:3},
                    "Data Instance"                 : { type:"uint8", position:4},
                    "Resistance"                    : { type:"uint16", resolution:0.01, position:5}, // Ohms
                    "Reserved"                      : { type:"uint16", position:6}
                }
            },

    "65300_MT66" : {
                name:"Carling AC GenII Breaker Status (MT66)",
                priority:7,
                useDeviceInstance:true,
                defaultUpdateRate:10*TimeConstants.SECONDS,
                timeout:100*TimeConstants.SECONDS,
                singleFrame:true,
                fields:{
                    "Manufacturer Code"             : { type:"uint11", position:0 },
                    "Reserved"                      : { type:"uint2",  position:1 },
                    "Industry Group"                : { type:"uint3",  position:2 },
                    "Message Type"                  : { type:"uint8",  position:3 },
                    "Breaker Mapping 1"             : { type:"uint8s", position:4 },
                    "Breaker Mapping 2"             : { type:"uint8s", position:5 },
                    "Reserved 2"                    : { type:"uint5",  position:6 },
                    "Breaker Mapping 3"             : { type:"uint3",  position:7 },
                    "Breaker Status"                : { type:"uint8s", position:8 },
                    "Breaker Profile, Voltage"      : { type:"uint4",  position:9, offset:"-28", resolution:"2" }, // Volts
                    "Breaker Profile, Current"      : { type:"uint4",  position:10 } // Amps
                }
            },
            
    "65300_MT67" : {
                name:"Carling AC GenII Configuration (MT67)",
                priority:7,
                useDeviceInstance:true,
                defaultUpdateRate:10*TimeConstants.SECONDS,
                timeout:100*TimeConstants.SECONDS,
                singleFrame:true,
                fields:{
                    "Manufacturer Code"             : { type:"uint11", position:0, testValue:"1046"},
                    "Reserved"                      : { type:"uint2",  position:1, testValue:"3"},
                    "Industry Group"                : { type:"uint3",  position:2, testValue:"0"},
                    "Message Type"                  : { type:"uint8",  position:3, testValue:"67"},
                    "Breaker Mapping 1"             : { type:"uint8s", position:4 },
                    "Breaker Mapping 2"             : { type:"uint8s", position:5 },
                    "Reserved 2"                    : { type:"uint5",  position:6 },
                    "Breaker Mapping 3"             : { type:"uint3",  position:7 },
                    "Configuration Flags"           : { type:"uint8s", position:8 },
                    "Breaker Group"                 : { type:"uint8" , position:9 }
                }
            },

    // Generic header for PGN 126208 so that we can get the Function Code
    "126208" : {
                    name:"NMEA Request / Command / Acknowledge Group",
                    priority:3,
                    singleFrame:false,
                    fields:{
                        "Function Code"             : { type:"uint8", position:0, testValue:1 }
                    }
                },

    // PGN 126208 with Function Code == 0 is an NMEA 2000 Request PGN
    "126208_REQ" : {
                    name:"Request Group",
                    priority:3,
                    singleFrame:false,
                    fields:{
                        "Function Code"             : { type:"uint8", position:0, testValue:0 }, // value = 0
                        "Requested PGN"             : { type:"pgn24", position:1 },
                        "Transmission Interval"     : { type:"uint32", position:2 },
                        "Transmission Interval Offset" : { type:"uint16", position:3 },
                        "Number Of Pairs"           : { type:"uint8", position:4 },
                        "First Requested Field No"  : { type:"uint8", position:5 },
                        "First Requested Field Value" : { type:"uint8", position:6 }, // this type can change depending on the commanded PGN
                        "Second Requested Field No" : { type:"uint8", position:7 },
                        "Second Requested Field Value" : { type:"uint8", position:8 } // this type can change depending on the commanded PGN
                    }
                },

    // PGN 126208 with Function Code == 1 is an NMEA 2000 Command PGN
    "126208_CMD" : {
                    name:"Command Group",
                    priority:3,
                    singleFrame:false,
                    fields:{
                        "Function Code"             : { type:"uint8", position:0, testValue:1 }, // value = 1
                        "Commanded PGN"             : { type:"pgn24", position:1 },
                        "Priority Setting"          : { type:"uint4", position:2 },
                        "Reserved"                  : { type:"uint4", position:3 },
                        "Number Of Pairs"           : { type:"uint8", position:4 },
                        "First Field No"            : { type:"uint8", position:5 },
                        "First Field Value"         : { type:"uint8", position:6 }, // this type can change depending on the commanded PGN
                        "Second Field No"           : { type:"uint8", position:7 },
                        "Second Field Value"        : { type:"uint8", position:8 }, // this type can change depending on the commanded PGN
                        "Third Field No"            : { type:"uint8", position:9 },
                        "Third Field Value"         : { type:"uint8", position:10}, // this type can change depending on the commanded PGN
                        "Fourth Field No"           : { type:"uint8", position:11},
                        "Fourth Field Value"        : { type:"uint8", position:12}, // this type can change depending on the commanded PGN
                        "Fifth Field No"            : { type:"uint8", position:13},
                        "Fifth Field Value"         : { type:"uint8", position:14}, // this type can change depending on the commanded PGN
                    }
                },

    // PGN 126208 with Function Code == 2 is an NMEA 2000 Acknowlwedge PGN
    "126208_ACK" : {
                    name:"Acknowledge Group",
                    priority:3,
                    singleFrame:false,
                    fields:{
                        "Function Code"             : { type:"uint8", position:0, testValue:0 }, // value = 0
                        "Acknowledged PGN"          : { type:"pgn24", position:1 },
                        "PGN Error Code"            : { type:"uint4", position:2 },
                        "Transmission Interval Error Code" : { type:"uint4", position:3 },
                        "Number Of Parameters"      : { type:"uint8", position:4 },
                        "First Error Code"          : { type:"uint8", position:5 },
                        "Second Error Code"         : { type:"uint8", position:6 },
                        "Third Error Code"          : { type:"uint8", position:7 },
                        "Fourth Error Code"         : { type:"uint8", position:8 }
                    }
                },

    "126996" : {
                name:"Product Information",
                priority:6,
                singleFrame:false,
                fields:{
                    "NMEA 2000 Database Version"    : { type:"uint16", position:0},
                    "NMEA Manufacturers Product Code" : { type:"uint16", position:1},
                    "Manufacturers Model Id"        : { type:"string", length:"32", position:2},
                    "Manufacturers Software Version Code": { type:"string", length:"32", position:3},
                    "Manufacturers Model Version"   : { type:"string", length:"32", position:4},
                    "Manufacturers Model Serial Code" : { type:"string", length:"32", position:5},
                    "NMEA 2000 Certification Level" : { type:"uint8", position:6},
                    "Load Equivalency"              : { type:"uint8", position:7}
                }
            },

    "126998" : {
                    name:"Alert Value",
                    priority:2,
                    defaultUpdateRate:10*TimeConstants.SECONDS,
                    timeout:20*TimeConstants.SECONDS,
                    singleFrame:false,
                    fields:{
                        "Alert Type"                : { type:"uint4",  position:0 },
                        "Alert Category"            : { type:"uint4",  position:1 },
                        "Alert System"              : { type:"uint8s", position:2 },
                        "Alert Subsystem"           : { type:"uint8s", position:3 },
                        "Alert Id"                  : { type:"uint16", position:4 },
                        "Data Source Network Id-hi" : { type:"uint32", position:5 },
                        "Data Source Network Id-lo" : { type:"uint32", position:6 },
                        "Data Source Instance"      : { type:"uint8",  position:7 },
                        "Data Source Index or Source":{ type:"uint8s", position:8 },
                        "Alert Occurrence Number"   : { type:"uint8",  position:9 },
                        // Maretron will support only 1 parameter
                        "Total Number of Value Parameters":{ type:"uint8", position:10 },
                        "Value Parameter Number"    : { type:"uint8",  position:11 },
                        "Value Data Format"         : { type:"uint8",  position:12 }, // DF number
                        "Value Data"                : { type:"string16", position:13 } // this is actually a variable type
                    }
                },

    "127250" : {
                name:"Vessel Heading",
                priority:2,
                defaultUpdateRate:0.1*TimeConstants.SECONDS,
                timeout:2*TimeConstants.SECONDS,
                useDeviceInstance:true,
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0 },
                    "Heading"                       : { type:"uint16", resolution:0.0001, position:1 }, // radians
                    "Deviation"                     : { type:"uint16", resolution:0.0001, position:2 }, // radians
                    "Variation"                     : { type:"uint16", resolution:0.0001, position:3 }, // radians
                    "Reference"                     : { type:"uint2",  position:4 },
                    "Reserved"                      : { type:"uint6",  position:5 }
                }
            },

    "127257" : {
                name:"Attitude",
                priority:3,
                useDeviceInstance:true,
                defaultUpdateRate:TimeConstants.ONE_SECOND,
                timeout:2*TimeConstants.SECONDS,
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8", position:0},
                    "Yaw"                           : { type:"int16", resolution:0.0001, position:1}, // radians
                    "Pitch"                         : { type:"int16", resolution:0.0001, position:2}, // radians
                    "Roll"                          : { type:"int16", resolution:0.0001, position:3}, // radians
					"Reserved"                      : { type:"uint8", position:4}
                }
            },

    "127258" : {
                name:"Magnetic Variation",
                priority:6,
                useDeviceInstance:true,
                defaultUpdateRate:TimeConstants.ONE_SECOND,
				timeout:2*TimeConstants.MINUTES,
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "Variation Source"              : { type:"uint4",  position:1},
                    "Reserved Bits"                 : { type:"uint4",  position:2},
                    "Age Of Service"                : { type:"uint16", position:3},
                    "Variation"                     : { type:"int16",  resolution:0.0001,  position:4}
                }
    	    },

    "127488" : {
                name:"Engine Parameters, Rapid Update",
                priority:2,
                defaultUpdateRate:100,
                timeout:3*TimeConstants.SECONDS,
                instanceField:"Engine Instance",
                singleFrame:true,
                fields:{
                    "Engine Instance"               : { type:"uint8",  position:0},
                    "Engine Speed"                  : { type:"uint16", resolution:0.25, position:1 }, // RPM
                    "Engine Boost Pressure"         : { type:"uint16", resolution:100,  position:2 }, // Pa
                    "Engine Tilt/Trim"              : { type:"int8",   position:3 }, // Percent
					"Reserved"                      : { type:"uint16", position:4 }
                }
            },

    "127500" : {
                name:"Load Controller Connection State",
                priority:3,
                defaultUpdateRate:15*TimeConstants.SECONDS,
                timeout:35*TimeConstants.SECONDS,
                useDeviceInstance:true,
                sourceField:"Connection Id",
                singleFrame:true,
                fields:{
                    "Sequence Id"                   : { type:"uint8",  position:0 },
                    "Connection Id"                 : { type:"uint8",  position:1 },
                    "Connection State"              : { type:"uint8s", position:2 },
                    "Connection Status"             : { type:"uint13s",position:3 },
                    "Operational Status"            : { type:"uint3",  position:4 },
                    "PWM Duty Cycle"                : { type:"uint8",  position:5 },            // percent
                    "Time On"                       : { type:"uint8", resolution:0.01,  position:6 },  // seconds
                    "Time Off"                      : { type:"uint8", resolution:0.01,  position:7 }  // seconds
                }
            },

    "127501" : {
                name:"Binary Switch Bank Status",
                priority:3,
                defaultUpdateRate:10*TimeConstants.SECONDS,
                timeout:35*TimeConstants.SECONDS,
                instanceField:"Indicator Bank Instance",
                singleFrame:true,
                fields:{
                    "Indicator Bank Instance"       : { type:"uint8",  position:0 },
                    "#1"                            : { type:"uint2s", position:1 },
                    "#2"                            : { type:"uint2s", position:2 },
                    "#3"                            : { type:"uint2s", position:3 },
                    "#4"                            : { type:"uint2s", position:4 },
                    "#5"                            : { type:"uint2s", position:5 },
                    "#6"                            : { type:"uint2s", position:6 },
                    "#7"                            : { type:"uint2s", position:7 },
                    "#8"                            : { type:"uint2s", position:8 },
                    "#9"                            : { type:"uint2s", position:9 },
                    "#10"                           : { type:"uint2s", position:10 },
                    "#11"                           : { type:"uint2s", position:11 },
                    "#12"                           : { type:"uint2s", position:12 },
                    "#13"                           : { type:"uint2s", position:13 },
                    "#14"                           : { type:"uint2s", position:14 },
                    "#15"                           : { type:"uint2s", position:15 },
                    "#16"                           : { type:"uint2s", position:16 },
                    "#17"                           : { type:"uint2s", position:17 },
                    "#18"                           : { type:"uint2s", position:18 },
                    "#19"                           : { type:"uint2s", position:19 },
                    "#20"                           : { type:"uint2s", position:20 },
                    "#21"                           : { type:"uint2s", position:21 },
                    "#22"                           : { type:"uint2s", position:22 },
                    "#23"                           : { type:"uint2s", position:23 },
                    "#24"                           : { type:"uint2s", position:24 },
                    "#25"                           : { type:"uint2s", position:25 },
                    "#26"                           : { type:"uint2s", position:26 },
                    "#27"                           : { type:"uint2s", position:27 },
                    "#28"                           : { type:"uint2s", position:28 }
                }
            },

    "127505" : {
                name:"Fluid Level",
                priority:6,
                defaultUpdateRate:2500,
                timeout:10*TimeConstants.SECONDS,
                instanceField:"Fluid Instance",
                sourceField:"Fluid Type",
                singleFrame:true,
                fields:{
                    "Fluid Instance"				: { type:"uint4",  position:0 },
                    "Fluid Type"					: { type:"uint4",  position:1 },
                    "Fluid Level"					: { type:"int16",  resolution:0.004,  position:2 },   // percent
                    "Tank Capacity"				    : { type:"uint32", resolution:0.0001,  position:3 },  // cubic meters
                    "Reserved"                      : { type:"uint8", position:4 },
                }
            },

    "127506" : {
                name:"DC Detailed Status",
                priority:6,
                defaultUpdateRate:1500,
                timeout:10*TimeConstants.SECONDS,
                instanceField:"DC Instance",
                singleFrame:false,
                fields:{
                    "SID"							: { type:"uint8",  position:0 },
                    "DC Instance"					: { type:"uint8",  position:1 },
                    "DC Type"						: { type:"uint8",  position:2 },
                    "State of Charge"				: { type:"uint8",  position:3 },
                    "State of Health"				: { type:"uint8",  position:4 },
                    "Time Remaining"				: { type:"uint16withInfinite",  position:5 },
                    "Ripple Voltage"				: { type:"uint16", resolution:0.001,  position:6 } // note NMEA spec is wrong regarding resolution
                }
            },

    "127508" : {
                name:"Battery Status",
                priority:6,
                defaultUpdateRate:1500,
                timeout:10*TimeConstants.SECONDS,
                instanceField:"Battery Instance",
                singleFrame:true,
                fields:{
                    "Battery Instance"				: { type:"uint8",  position:0},
                    "Battery Voltage"				: { type:"int16",  resolution:0.01,  position:1},
                    "Battery Current"				: { type:"int16",  resolution:0.1,   position:2},
                    "Battery Case Temperature"		: { type:"uint16", resolution:0.01,  position:3},
                    "SID"							: { type:"uint8",  position:4}
                }
            },

    "127751" : {
                name:"DC Voltage/Current",
                priority:6,
                useDeviceInstance:true,
                sourceField:"Connection Number",
                defaultUpdateRate:1500,
                singleFrame:true,
                fields:{
                    "SID"							: { type:"uint8",  position:0},
                    "Connection Number"				: { type:"uint8",  position:1},
                    "DC Voltage"					: { type:"uint16", resolution:0.1,  position:2},  // DD367, DF106, Volts
                    "DC Current"					: { type:"int24",  resolution:0.01,  position:3}, // DD368, DF114, Amps
                    "Reserved Bits"					: { type:"uint8",  position:4}
                }
            },

    "129025" : {
                name:"Position, Rapid Update",
                priority:2,
                defaultUpdateRate:100,
                useDeviceInstance:true,
                singleFrame:true,
                fields:{
                    "Latitude"                      : { type:"int32", resolution:0.0000001,  position:0}, // DD022, DF23, degrees
                    "Longitude"                     : { type:"int32", resolution:0.0000001,  position:1} // DD023, DF25, degrees
                }
            },

    "129026" : {
                name:"COG & SOG, Rapid Update",
                priority:2,
                indexes:{reference:"COG Reference"},
                defaultUpdateRate:250,
                useDeviceInstance:true,
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "COG Reference"                 : { type:"uint2",  position:1},  // 0 => true, 1 => magetic
                    "Reserved Bits"                 : { type:"uint6",  position:2},
                    "Course Over Ground"            : { type:"uint16", resolution:0.0001, position:3}, // DD165, DF02, radians
                    "Speed Over Ground"             : { type:"uint16", resolution:0.01,   position:4}, // DD044, DF35, m/s
                    "Reserved Bits 2"               : { type:"uint16", position:5}
                }
            },

    "130060" : {
                name:"Label",
                priority:7,
                singleFrame:false,
                fields:{
                    "Hardware Channel Id"           : { type:"uint8",   position:0},
                    "PGN"                           : { type:"pgn24" ,  position:1},
                    "Data Source Instance Field Number" : { type:"uint8", position:2},
                    "Data Source Instance Value"    : { type:"uint8",   position:3},
                    "Secondary Enumeration Field Number" : { type:"uint8", position:4},
                    "Secondary Enumeration Field Value" : { type:"uint8", position:5},
                    "Parameter Field Number"        : { type:"uint8",   position:6},
                    "Label"                         : { type:"string",  position:7}
                }
            },

    "130306" : {
                name:"Wind Data",
                priority:2,
                defaultUpdateRate:100,
				timeout:3*TimeConstants.SECONDS,
                useDeviceInstance:true,
                indexes:{reference:"Wind Reference"},
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "Wind Speed"                    : { type:"uint16", resolution:0.01,   position:1},
                    "Wind Direction"                : { type:"uint16", resolution:0.0001, position:2}, // radians
                    "Wind Reference"                : { type:"uint3",  position:3},
					"Reserved"                      : { type:"uint21", position:4}
                }
            },

    "130310" : {
                name:"Environmental Parameters",
                priority:5,
                defaultUpdateRate:500,
                timeout:6*TimeConstants.SECONDS,
                useDeviceInstance:true,
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",    position:0},
                    "Water Temperature"             : { type:"uint16",   resolution:0.01, position:1}, // Kelvin
                    "Outside Ambient Air Temperature" : { type:"uint16", resolution:0.01, position:2}, // Kelvin
                    "Atmospheric Pressure"          : { type:"uint16",   resolution:100,  position:3},
					"Reserved"                      : { type:"uint8",    position:4}
                }
            },

    "130311" : {
                name:"Environmental Parameters 2",
                priority:5,
                defaultUpdateRate:500,
                timeout:6*TimeConstants.SECONDS,
                useDeviceInstance:true,
                indexes:{temperatureSource:"Temperature Source",
                         humiditySource:"Humidity Source"},
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "Temperature Source"            : { type:"uint6",  position:1},
                    "Humidity Source"               : { type:"uint2",  position:2},
                    "Temperature"                   : { type:"uint16", position:3, resolution:0.01}, // Kelvin
                    "Humidity"                      : { type:"int16",  position:4, resolution:0.004}, // percent
                    "Atmospheric Pressure"          : { type:"uint16", position:5, resolution:100}
                }
            },

    "130312" : {
                name:"Temperature",
                priority:5,
                defaultUpdateRate:2*TimeConstants.SECONDS,
                timeout:6*TimeConstants.SECONDS,
                instanceField:"Temperature Instance",
                sourceField:"Temperature Source",
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "Temperature Instance"          : { type:"uint8",  position:1},
                    "Temperature Source"            : { type:"uint8",  position:2},
                    "Actual Temperature"            : { type:"uint16", position:3, resolution:0.01}, // Kelvin
                    "Set Temperature"               : { type:"uint16", position:4, resolution:0.01},
                    "Reserved"                      : { type:"uint8",  position:5}
                }
            },

    "130313" : {
                name:"Humidity",
                priority:5,
                defaultUpdateRate:2*TimeConstants.SECONDS,
                timeout:6*TimeConstants.SECONDS,
                instanceField:"Humidity Instance",
                sourceField:"Humidity Source",
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "Humidity Instance"             : { type:"uint8",  position:1},
                    "Humidity Source"               : { type:"uint8",  position:2},
                    "Actual Humidity"               : { type:"int16",  position:3, resolution:0.004},
                    "Set Humidity"                  : { type:"int16",  position:4},
                    "Reserved"                      : { type:"uint8",  position:5}
                }
            },

    "130314" : {
                name:"Pressure",
                priority:5,
                defaultUpdateRate:2*TimeConstants.SECONDS,
                timeout:6*TimeConstants.SECONDS,
                instanceField:"Pressure Instance",
                sourceField:"Pressure Source",
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "Pressure Instance"             : { type:"uint8",  position:1},
                    "Pressure Source"               : { type:"uint8",  position:2},
                    "Pressure"                      : { type:"int32",  position:3, resolution:0.1},
                    "Reserved"                      : { type:"uint8",  position:4}
                }
            },

    "130316" : {
                name:"Temperature, Extended Range",
                priority:5,
                defaultUpdateRate:2*TimeConstants.SECONDS,
                timeout:6*TimeConstants.SECONDS,
                instanceField:"Temperature Instance",
                sourceField:"Temperature Source",
                singleFrame:true,
                fields:{
                    "SID"                           : { type:"uint8",  position:0},
                    "Temperature Instance"          : { type:"uint8",  position:1},
                    "Temperature Source"            : { type:"uint8",  position:2},
                    "Actual Temperature"            : { type:"uint24", position:3, resolution:0.001},  // Kelvin
                    "Set Temperature"               : { type:"uint16", position:4, resolution:0.1} // Kelvin
                }
            },

    "130318" : {
                name:"Maretron Label",
                priority:6,
                singleFrame:false,
                fields:{
                    "Manufacturer Code"             : { type:"uint11", position:0, testValue:"137"},
                    "Reserved"                      : { type:"uint2",  position:1, testValue:"3"},
                    "Industry Group"                : { type:"uint3",  position:2, testValue:"4"},
                    "Instance"                      : { type:"uint8",  position:3},
                    "Data Source"                   : { type:"uint8",  position:4},
                    "Data Indicator"                : { type:"uint8",  position:5},
                    "Label"                         : { type:"string", position:6},
                    "Hardware Channel"              : { type:"uint8",  position:7}
                }
            },


    // Carling Propriety PGNs
    "130921_MT2" : {
                name:"Carling DC Breaker Status-MT2",
                priority:7,
    			useDeviceInstance:true,
    			defaultUpdateRate:10*TimeConstants.SECONDS,
    			timeout:100*TimeConstants.SECONDS,
                singleFrame:false,
    			fields:{
    				"Manufacturer Code"             : { type:"uint11", position:0, testValue:"1046"},
    				"Reserved"                      : { type:"uint2",  position:1, testValue:"3"},
    				"Industry Group"                : { type:"uint3",  position:2, testValue:"0"},
    				"Message Type"                  : { type:"uint8",  position:3, testValue:"2"},
    				"Breaker Mapping 1"             : { type:"uint8s", position:4},
    				"Breaker Mapping 2"             : { type:"uint8s", position:5},
                    "Breaker Status 1"              : { type:"uint5",  position:6},
    				"Breaker Mapping 3"             : { type:"uint3",  position:7},
    				"Voltage"                       : { type:"uint8",  position:8},
    				"Current"                       : { type:"uint8",  position:9},
    				"Dim Value"                     : { type:"uint8",  position:10, testValue:"20"},
    				"Breaker Status 2"              : { type:"uint8s", position:11},
    				"Breaker Status 3"              : { type:"uint8s", position:12},
                    "Group Number"                  : { type:"uint4",  position:13},
                    "Model Number"                  : { type:"uint4",  position:14},
    				"ECB Software Version"          : { type:"uint8",  position:15}
    			}
            },

    "130921_MT3" : {
                name:"Carling Breaker Configuration-MT3",
                priority:7,
                useDeviceInstance:true,
                defaultUpdateRate:10*TimeConstants.SECONDS,
                timeout:100*TimeConstants.SECONDS,
                singleFrame:false,
                fields:{
                    "Manufacturer Code"             : { type:"uint11", position:0, testValue:"1046"},
                    "Reserved"                      : { type:"uint2",  position:1, testValue:"3"},
                    "Industry Group"                : { type:"uint3",  position:2, testValue:"0"},
                    "Message Type"                  : { type:"uint8",  position:3, testValue:"3"},
                    "Breaker Mapping 1"             : { type:"uint8s", position:4 },
                    "Breaker Mapping 2"             : { type:"uint8s", position:5 },
                    "Reserved 2"                    : { type:"uint5",  position:6 },
                    "Breaker Mapping 3"             : { type:"uint3",  position:7 },
                    "Inrush Delay"                  : { type:"uint4",  position:8, resolution:"100"},   // milliseconds
                    "Trip Delay"                    : { type:"uint4",  position:9, resolution:"50"},    // milliseconds
                    "Configuration Flags"           : { type:"uint8s", position:10 },
                    "Current Rating"                : { type:"uint8",  position:11 },                   // Amps
                    "Factory Maximum Rating"        : { type:"uint8",  position:12 },                   // Amps
                    "Load Shed Priority Schedule B" : { type:"uint4",  position:13 },
                    "Load Shed Priority Schedule A" : { type:"uint4",  position:14 },
                    "Default Dim Value"             : { type:"uint8",  position:15, resolution:"5"},    // % (0 = OFF)
                    "Breaker Group"                 : { type:"uint4",  position:16 },
                    "Flash Map Index"               : { type:"uint4",  position:17 }
                }
            }

} // end structure Protocols

Globals.Protocols = Protocols;
console.log( "<-- constructing Protocols" );

module.exports = { Protocols };

// eof
