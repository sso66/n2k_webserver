// File: Name.js
// Note: Definition of NMEA 2000 Namespaces for Devices
// Date: 04/15/2020
//............................................................................
console.log( 'Mounting Name.js...' );

/*********************************************************************************************
 * Class Name<br>
 * This is the NMEA 2000 defined NAME of a device. It is represented in a messages by a 64 bit
 * number with the following fields:
 * <li>Self-Configurable Address - 1 bit, always 1</li>
 * <li>Industry Group - 3 bits</li>
 * <li>System Instance - 4 bits</li>
 * <li>Device Class - 7 bits</li>
 * <li>Reserved - 1 bit, always 0</li>
 * <li>Device Function - 8 bits</li>
 * <li>Device Instance - 8 bits</li>
 * <li>Manufacturer Code - 11 bits</li>
 * <li>Unique Number - 21 bits</li>
 * @see <p>NMEA 2000 Appendix-D Application Notes section D.4</p>
 *********************************************************************************************/
class Name
{
    constructor() {
        this.mLow32bits = 0;
        this.mHigh32bits = 0;
    }  // end constructor

    /*****************************************************************************************
     * function SetParts<br>
     * NMEA2000 specifies that the system instance is part of the name.
     * For our purposes of identifying the same device on two different busses, we choose
     * to exclude the system instance when identifying a device.
     * @param industryGroup : uint
     * @param systemInstance : uint
     * @param deviceClass : uint
     * @param deviceFunction : uint
     * @param deviceInstance : uint
     * @param manufacturerCode : uint
     * @param uniqueNumber : uint
     *****************************************************************************************/
    SetParts( industryGroup,
              systemInstance,
              deviceClass,
              deviceFunction,
              deviceInstance,
              manufacturerCode,
              uniqueNumber ) {
        this.mLow32bits = ( manufacturerCode<<21 )
            +  uniqueNumber; // 32 bits
        this.mHigh32bits = 0x80000000
            + ( industryGroup<<28 )
            // exclude the system instance
            //      + ( uint(systemInstance) << 24 )
            + ( deviceClass<< 17 )
            // bit 16 is always 0
            + ( deviceFunction<<8 )
            + deviceInstance;
    } // end function SetParts

    /*****************************************************************************************
     * function HasHigherPriorityThan
     * @param other : Name
     *****************************************************************************************/
    HasHigherPriorityThan( other ) {
        if ( this.mHigh32bits > other.mHigh32bits )
            return true;
        else if ( this.mHigh32bits < other.mHigh32bits )
            return false;
        // high bits are the same, so check the low bits
        if ( this.mLow32bits > other.mLow32bits )
            return true;
        else
            return false;
    } // end function HasHigherPriorityThan

    /*****************************************************************************************
     * function Equals
     * @param other : Name
     *****************************************************************************************/
    Equals( other ) {
        return this.mHigh32bits == other.mHigh32bits && this.mLow32bits == other.mLow32bits;
    } // end function Equals

    /*****************************************************************************************
     * function toString
     *****************************************************************************************/
    toString() {
        var lowString = this.mLow32bits.toString(16);
        while ( lowString.length < 8 )
            lowString = "0" + lowString;
        var highString = this.mHigh32bits.toString(16);
        while ( highString.length < 8 )
            highString = "0" + highString;
        return "0x" + highString + lowString;
    } // end function toString

    ToString() {
        return "Industry Group = "   +   ((this.mHigh32bits>>28) & 0x7 )
            + ", System Instance = " +   ((this.mHigh32bits>>24) & 0xF )
            + ", Device Class = "    +   ((this.mHigh32bits>>17) & 0x7F )
            + ", Function Code = "   +   ((this.mHigh32bits>>8)  & 0xFF )
            + ", Device Instance = " +   ( this.mHigh32bits&0xFF )
            + ", Manufacturer Code = " + ((this.mLow32bits>>21)  & 0x7FF )
            + ", Unique Number = " +     ( this.mLow32bits       & 0x1FFFFF );
    }

    /*****************************************************************************************/
} // end class Name

module.exports = { Name };

// eof
