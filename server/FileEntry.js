// File: server/FileEntry.js
// Note: File entry object for synchronous and asynchronous I/O operations
// Date: 04/15/2020
//..............................................................................
console.log( "--> constructing FileEntry" );

/*************************************************************************************************
 * class FileEntry
 *************************************************************************************************/
class FileEntry {
	/*********************************************************************************************
	 * constructor
     * filename - String
     * contents - String
     * length - number 
	 *********************************************************************************************/
	constructor( filename, contents, length = NaN ) {
		// console.log( "--> FileEntry.constructor" );
        this.mFilename = filename;
		this.mContents = contents;
        this.mLength = length;
		this.mOriginalLength = contents.length;
		// console.log( "<-- FileEntry.constructor" );
	} // end constructor
    
    /*********************************************************************************************
     * the length of the FileEntry
     *********************************************************************************************/ 
    get length()
    {
        if ( !isNaN( this.mLength ))
            return this.mLength;
        else
            return this.mContents.length;
    }
    
    /*********************************************************************************************/ 
   
} // end Class FileEntry

/*************************************************************************************************/

console.log( "<-- constructing FileEntry" );

module.exports = { FileEntry };

// eof
