// File: server/pngs/SwitchState.js
// Note: Enumerated States for Switches and Circuit Breakers 
// Date: 04/16/2020
//..............................................................................
console.log( "Mounting SwitchState.js..." );

const SwitchStateEnum = {
    OFF         : 0,
    ON          : 1,
    TRIPPED     : 2,
    UNKNOWN     : 3,
    properties  : {
        0  : { name : "Off", value:0 },
        1  : { name : "On", value:1 },
        2  : { name : "Tripped", value:2 },
        3  : { name : "Unknown", value:3 },
    }
};

module.exports = { SwitchStateEnum };

// eof
