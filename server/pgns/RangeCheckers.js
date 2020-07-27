// File: server/pgns/RangeCheckers.js
// Note: Checksums Utility for  N2K Protocal/TCP host-to-host communications 
// Date: 04/16/2020
//..............................................................................
console.log( "Mounting RangeCheckers.js..." );

var CheckEnum = {
    FALSE           : 0, // CheckEnum.FALSE means that the number was completely outside the range of the data type. @default 0
    TRUE            : 1, // CheckEnum.TRUE means that the number was inside the valid range of the data type. @default 1
    RESERVED        : 2, // CheckEnum.RESERVED means that the number was in the reserved range of the data type. @default 2
    OUT_OF_RANGE    : 3, // CheckEnum.OUT_OF_RANGE means that the number was set to the 'out-of-range' value for the data type. @default 3
    NOT_AVAILABLE   : 4, // CheckEnum.NOT_AVAILABLE means that the number was set to the 'not-available' value for the data type. @default 4
    INFINITE        : 5  // CheckEnum.INFINITE means that the number was set to the 'infinite' value for the data type. @default 5 
};

const rangeCheckers =
{
     /* special case for switches, which can be zero, one, or two */
    uint2s : function(x) { return (0<=x && x<=2)?CheckEnum.TRUE:CheckEnum.FALSE },
    uint2  : function(x) { return (0<=x && x<=3)?CheckEnum.TRUE:CheckEnum.FALSE },
    uint4  : function(x) { return (0<=x && x<=15)?CheckEnum.TRUE:CheckEnum.FALSE },
    uint8  : function(x) { if      ( x == 253 ) return CheckEnum.RESERVED;
                         else if ( x == 254 ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 255 ) return CheckEnum.NOT_AVAILABLE;
                         else if ( 0 <= x && x <= 252 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE},
    uint16  : function(x) { if      ( x == 65533 ) return CheckEnum.RESERVED;
                         else if ( x == 65534 ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 65535 ) return CheckEnum.NOT_AVAILABLE;
                         else if ( 0 <= x && x <= 65532 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    uint16withInfinite : function(x) { if      ( x == 65533 ) return CheckEnum.RESERVED;
                         else if ( x == 65534 ) return CheckEnum.INFINITE;
                         else if ( x == 65535 ) return CheckEnum.NOT_AVAILABLE;
                         else if ( 0 <= x && x <= 65532 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    uint16_65030:function(x) { return (0<=x && x<=64255)?CheckEnum.TRUE:CheckEnum.FALSE },    // special case for 65030
    uint24 : function(x) { if      ( x == 16777213 ) return CheckEnum.RESERVED;
                         else if ( x == 16777214 ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 16777215 ) return CheckEnum.NOT_AVAILABLE;
                         else if ( 0 <= x && x <= 16777212 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    uint32_65030 : function(x) { if ( x == 4294967295 ) return CheckEnum.NOT_AVAILABLE;
                        else if ( 0 <= x && x <= 4294967294 ) return CheckEnum.TRUE;
                        else return CheckEnum.FALSE },
    uint32 : function(x) { if      ( x == 4294967293 ) return CheckEnum.RESERVED;
                         else if ( x == 4294967294 ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 4294967295 ) return CheckEnum.NOT_AVAILABLE;
                         else if ( 0 <= x && x <= 4294967292 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    uint40 : function(x) { if      ( x == 1099511627773 ) return CheckEnum.RESERVED;
                        else if ( x == 1099511627774 ) return CheckEnum.OUT_OF_RANGE;
                        else if ( x == 1099511627775 ) return CheckEnum.NOT_AVAILABLE;
                        else if ( 0 <= x && x <= 1099511627772 ) return CheckEnum.TRUE;
                        else return CheckEnum.FALSE },
    uint48 : function(x) { if      ( x == 281474976710653 ) return CheckEnum.RESERVED;
                        else if ( x == 281474976710654 ) return CheckEnum.OUT_OF_RANGE;
                        else if ( x == 281474976710655 ) return CheckEnum.NOT_AVAILABLE;
                        else if ( 0 <= x && x <= 281474976710652 ) return CheckEnum.TRUE;
                        else return CheckEnum.FALSE },
    uint64 : function(x) { if      ( x == 0xFFFFFFFFFFFFFFFD ) return CheckEnum.RESERVED;
                        else if ( x == 0xFFFFFFFFFFFFFFFE ) return CheckEnum.OUT_OF_RANGE;
                        else if ( x == 0xFFFFFFFFFFFFFFFF ) return CheckEnum.NOT_AVAILABLE;
                        else return CheckEnum.TRUE },

    int8   : function(x) { if      ( x == 125 ) return CheckEnum.RESERVED;
                         else if ( x == 126 ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 127 ) return CheckEnum.NOT_AVAILABLE;
                         else if ( -128 <= x && x <= 127 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    int16  : function(x) { if      ( x == 32765 ) return CheckEnum.RESERVED;
                         else if ( x == 32766 ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 32767 ) return CheckEnum.NOT_AVAILABLE;
                         else if ( -32768 <= x && x <= 32767 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    int24  : function(x) { if      ( x == 0x7FFFFD ) return CheckEnum.RESERVED;
                         else if ( x == 0x7FFFFE ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 0x7FFFFF ) return CheckEnum.NOT_AVAILABLE;
                         else if ( -524288 <= x && x <= 0x7FFFFF ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    int32  : function(x) { if      ( x == 0x7FFFFFFD ) return CheckEnum.RESERVED;
                         else if ( x == 0x7FFFFFFE ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 0x7FFFFFFF ) return CheckEnum.NOT_AVAILABLE;
                         else if ( -2147483648 <= x && x <= 2147483647 ) return CheckEnum.TRUE;
                         else return CheckEnum.FALSE },
    int64  : function(x) { if      ( x == 0x7FFFFFFFFFFFFFFD ) return CheckEnum.RESERVED;
                         else if ( x == 0x7FFFFFFFFFFFFFFE ) return CheckEnum.OUT_OF_RANGE;
                         else if ( x == 0x7FFFFFFFFFFFFFFF ) return CheckEnum.NOT_AVAILABLE;
                         else return CheckEnum.TRUE }
}

module.exports = { CheckEnum, rangeCheckers };

// eof
