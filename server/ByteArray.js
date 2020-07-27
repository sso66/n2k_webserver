// File: server/ByteArray.js
// Note: Byte Array data I/O Buffering Utility
// Date: 4/15/2020
//..............................................................................
console.log( "--> constructing ByteArray " );

/*****************************************************************************************************
 * class ByteArray
 *****************************************************************************************************/
class ByteArray {
	/*************************************************************************************************
	 * constructor
	 *************************************************************************************************/
	constructor() {
		// console.log( "--> ByteArray.constructor" );
		this.mContents = new Uint8Array(0);
		this.mPosition = 0;
        this.mBytesTotal = 0;
		// console.log( "<-- ByteArray.constructor" );
	} // end constructor

	/*************************************************************************************************
	 * getter bytesAvailable
	 *************************************************************************************************/
    get bytesAvailable()
    {
        return this.mBytesTotal - this.mPosition;
    }

	/*************************************************************************************************
	 * length getter and setter
	 *************************************************************************************************/
    get length()
    {
        return this.mBytesTotal;
    }

    set length(newLength)
    {
        // console.log( "--> ByteArray.length setter, newLength = " + newLength );
        // console.log( "    mBytesTotal = " + this.mBytesTotal + ", mPosition = " + this.mPosition );
        // console.log( "    mContents = [" + this.mContents + "]" );
        var newContents = new Uint8Array( newLength );
        newContents.set( this.mContents.slice( 0, newLength ));
        this.mContents = newContents;
        this.mBytesTotal = newLength;
        if ( this.mPosition > newLength )
            this.mPosition = newLength;
        // console.log( "    mBytesTotal = " + this.mBytesTotal + ", mPosition = " + this.mPosition );
        // console.log( "    mContents = [" + this.mContents + "]" );
        // console.log( "<-- ByteArray.length setter" );
    };

	/*************************************************************************************************
	 * position getter and setter
	 *************************************************************************************************/
    get position()
    {
        return this.mPosition;
    }

    set position(newPosition)
    {
        this.mPosition = newPosition;
    }

	/*************************************************************************************************
	 * function GetByteAt
	 *************************************************************************************************/
    GetByteAt( index )
    {
        return this.mContents[index];
    } // end function GetByteAt

	/*************************************************************************************************
	 * function ReadBytes 
     * Reads the number of data bytes, specified by the length parameter, from this byte stream.
     * The bytes are read into the ByteArray object specified by the bytes parameter, and the bytes
     * are written into the destination ByteArray starting at the position specified by offset.
     * @param bytes - the ByteArray into which the data will be read
     * @param offset - The offset in the bytes parameter at which the read data should be written
     * @param length - The number of bytes to read. The default case of 0 causes all available data
     *                 to be read.
	 *************************************************************************************************/
    ReadBytes( bytes, offset=0, length=0 )
    {
        // console.log( "--> ByteArray.ReadBytes, offset = " + offset + ", length = " + length );
        // console.log( "    mBytesTotal = " + this.mBytesTotal + ", mPosition = " + this.mPosition );
        // console.log( "    mContents = [" + this.mContents + "]" );

        if ( length == 0 ) this.crash();

        // newPosition is the index after the last byte that we will read
        var newPosition = Math.min( this.mPosition + length, this.mBytesTotal );
        var bytesRead = this.mContents.slice( this.mPosition, newPosition );
        this.mPosition = newPosition;

        bytes.WriteBytes( bytesRead, offset );
        // console.log( "    mBytesTotal = " + this.mBytesTotal + ", mPosition = " + this.mPosition );
        // console.log( "    mContents = [" + this.mContents + "]" );
        // console.log( "<-- ByteArray.ReadBytes" );
    } // end function ReadBytes

	/*************************************************************************************************
	 * function ReadUnsignedByte
	 *************************************************************************************************/
    ReadUnsignedByte()
    {
        var result = this.mContents[this.mPosition];
        this.mPosition++;
        return result;
    } // end function ReadUnsignedByte

	/*************************************************************************************************
	 * function ReadUTF
	 *************************************************************************************************/
    ReadUTF()
    {
        var noOfBytes = 256*this.mContents[this.mPosition] + this.mContents[this.mPosition+1];
        this.mPosition += 2;
        var result = "";
        for ( let i=0; i<noOfBytes; i++ )
            result += String.fromCharCode(this.mContents[this.mPosition+i]);
        this.mPosition += noOfBytes;
        return result;
    } // end function ReadUTF

	/*************************************************************************************************
	 * function ReadUTFBytes
	 *************************************************************************************************/
    ReadUTFBytes( noOfBytes )
    {
        var result = "";
        for ( let i=0; i<noOfBytes; i++ )
            result += String.fromCharCode(this.mContents[this.mPosition+i]);
        this.mPosition += noOfBytes;
        return result;
    } // end function ReadUTFBytes

	/*************************************************************************************************
	 * function Truncate
     * Creates a new contents consisting only of the bytes after mPosition
	 *************************************************************************************************/
    Truncate()
    {
        // console.log( "--> ByteArray.Truncate" );
        // console.log( "    mBytesTotal = " + this.mBytesTotal + ", mPosition = " + this.mPosition );
        // console.log( "    mContents = [" + this.mContents + "]" );
        var newBytesTotal = this.mBytesTotal - this.mPosition;
        var newContents = new Uint8Array( newBytesTotal );
        newContents.set( this.mContents.slice( this.mPosition, this.mBytesTotal ));
        this.mContents = newContents;
        this.mBytesTotal = newBytesTotal;
        this.mPosition = 0;

        // console.log( "    mBytesTotal = " + this.mBytesTotal + ", mPosition = " + this.mPosition );
        // console.log( "    mContents = [" + this.mContents + "]" );
        // console.log( "<-- ByteArray.Truncate" );
    } // end function Truncate

	/*************************************************************************************************
	 * function WriteByte
     * Writes one byte into the byte stream.
	 *************************************************************************************************/
    WriteByte( byte )
    {
        // console.log( "--> ByteArray.WriteByte" );
        // console.log( "    byte = 0x" + byte.toString(16));
        // console.log( "    mBytesTotal = " + this.mBytesTotal );
        // console.log( "    mContents = [" + this.mContents + "]" );

        var newBytesTotal = this.mBytesTotal + 1;
        var newContents = new Uint8Array( newBytesTotal );
        newContents.set( this.mContents, 0 );
        newContents[ this.mBytesTotal ] = byte & 0xFF;
        this.mContents = newContents;
        this.mBytesTotal = newBytesTotal;

        // console.log( "    mBytesTotal = " + this.mBytesTotal );
        // console.log( "    mContents = [" + this.mContents + "]" );
        // console.log( "<-- ByteArray.WriteByte" );
    } // end function WriteByte

	/*************************************************************************************************
	 * function WriteBytes
     * Writes a sequence of length bytes from the specified byte array, bytes, starting offset
     * (zero-based index) bytes into the byte stream.
     * @param bytes : ByteArray
	 *************************************************************************************************/
    WriteBytes( bytes, offset=0, length=0 )
    {
       // console.log( "--> ByteArray.WriteBytes, offset = " + offset + ", length = " + length );
       // console.log( "    bytes = " + JSON.stringify(bytes));
       // console.log( "    mBytesTotal = " + this.mBytesTotal );
       // console.log( "    this = " + JSON.stringify(this) );
       // console.log( "    mContents = [" + this.mContents + "]" );

        if ( offset != 0 ) this.crash();
        if ( length == 0 )
            length = bytes.length;

        var newBytesTotal = this.mBytesTotal + length;
       // console.log( "    newBytesTotal = " + newBytesTotal );
        var newContents = new Uint8Array( newBytesTotal );
        newContents.set( this.mContents, 0 );
       // console.log( "    newContents = [" + newContents + "]" );
        newContents.set( bytes, this.mBytesTotal );
        this.mContents = newContents;
        this.mBytesTotal = newBytesTotal;

       // console.log( "    mBytesTotal = " + this.mBytesTotal );
       // console.log( "    mContents = [" + this.mContents + "]" );
       // console.log( "<-- ByteArray.WriteBytes" );
    } // end function WriteBytes

	/*************************************************************************************************
	 * function Contents
	 *************************************************************************************************
    Contents()
    {
        return this.mContents;
    } // end function Contents

	/*************************************************************************************************
	 * function ToString
	 *************************************************************************************************/
    ToString()
    {
        return "Position = " + this.mPosition + ", bytes = [" + this.mContents + "]";
    } // end function ToString

	/*************************************************************************************************/

} // end class ByteArray

/*************************************************************************************************/

console.log( "<-- constructing ByteArray" );

module.exports = { ByteArray };

// eof
