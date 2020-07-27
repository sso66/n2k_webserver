// File: src/common/MessageTypes.js
// Note: Common Message Types
// Date: 03/20/2020
//..................................................................................................
console.log( "Mounting MessageTypes.js... " );

const MessageTypes = {
    BREAKER_DETAILS         : "breakerDetails",
    BREAKER_DETAILS_REQUEST : "requestBreakerDetails",
    CONFIGURATION_NAMES     : "configurationNames",
    CONFIGURATION_SELECT    : "configurationSelect",
    SCREEN_LAYOUT           : "screenLayout",
    SCREEN_SELECT           : "screenSelect",
    SWITCH_LOCK             : "switchLock",
    SWITCH_PRESS            : "switchPress",
    SWITCH_UNLOCK           : "switchUnlock",
    USER_EVENT              : "userevent",
    VALUES                  : "values"
}

module.exports = { MessageTypes };

// eof

