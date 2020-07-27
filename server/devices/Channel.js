// File: Channel.js
// Note: Device Channels Data Schema
// Date: 04/15/2020
//..............................................................................
console.log( 'Mounting Channel.js...' );

const FIRST_BANK_CHANNEL_NO   = 239;
const SECOND_BANK_CHANNEL_NO  = 238;
const THIRD_BANK_CHANNEL_NO   = 237;

/** The channel number on the device that is reserved for the device as a whole
 *  @default 252 (0xFC) */
const DEVICE_CHANNEL_NO       = 252;
const LOWEST_BANK_CHANNEL_NO  = THIRD_BANK_CHANNEL_NO;

module.exports = { FIRST_BANK_CHANNEL_NO, 
                   SECOND_BANK_CHANNEL_NO,
                   THIRD_BANK_CHANNEL_NO, 
                   DEVICE_CHANNEL_NO, 
                   LOWEST_BANK_CHANNEL_NO
                 };

// eof
                 