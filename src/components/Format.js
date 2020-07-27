// File: src/components/Formats.js
// Description: Functions to format numbers for display
// Date: 01/21/2020
//..................................................................................................
console.log( "Mounting Format.js... " );

    const cardinalPoints = ["N", "NNE", "NE", "ENE",
				 			"E", "ESE", "SE", "SSE", 
				            "S", "SSW", "SW", "WSW", 
                     		"W", "WNW", "NW", "NNW"
				          ];


    /*********************************************************************************************
     * Convert a bearing/angle to the nearest cardinal compass poiunt
     *********************************************************************************************/
    function FormatCardinal( v ) {
        if ( v === null )
            return "-";
        else if ( isNaN( v ) )
            return v;
        else
        {
            while ( v < 0 ) 
                v += 360; // handle negative headings
            return cardinalPoints[Math.round((v / 360) * 16) % 16];
        }
    } // end function FormatCardinal

    
    /*********************************************************************************************
     * Formats
     *********************************************************************************************/
    /** v must be a Number, milliseconds since Unix Epoch */
    function FormatDDMMYYYY( v ) {
        if ( isNaN(v) )
            return "-";

        let date = new Date(v);
        return TwoDigits(date.getUTCDate())+"/"+TwoDigits(date.getUTCMonth()+1)+"/"+date.getUTCFullYear();
    }

    function FormatDecimal1( v ) {
        if ( v === null )
            return "-";
        else if ( isNaN( v ) )
            return v;
        else if ( v > 99.95 || v < -99.95 )
            return Math.round(v).toString();
        else
            return v.toFixed(1).toString();
    }
    
    function FormatDecimal2( v ) {
        if ( v === null )
            return "-";
        else if ( isNaN( v ) )
            return v;
        else if ( v > 99.995 || v < -99.995 )
            return Math.round(v).toString();
        else if ( v > 999.95 || v < -999.95 )
            return v.toFixed(1).toString();
        else
            return v.toFixed(2).toString();
    }
    
    function FormatDecimal1Degrees( v ) {
        if ( v === null )
            return "-";
        else if ( isNaN( v ) )
            return v;
        else
            return v.toFixed(1).toString() + "°";
    }

    function FormatDecimal1EWDegrees( v ) {
        if ( v === null )
            return "-";
        else if ( isNaN( v ) )
            return v;
        else if ( v < 0 )
            return -v.toFixed(1).toString() + "°W";
        else
            return +v.toFixed(1).toString() + "°E";
    }

    /*********************************************************************************************
     * Convert a date/time value in millisends into the format MM/DD/YYYY
     * @param v - must be a Number, milliseconds since the Unix Epoch in the timezone in which
     *  the time is to be displayed.
     *********************************************************************************************/
    function FormatMMDDYYYY( v ) {
        if ( isNaN(v) )
            return "-";

        let date = new Date(v);
        return TwoDigits(date.getUTCMonth()+1)+"/"+TwoDigits(date.getUTCDate())+"/"+date.getUTCFullYear();
    }

    /*********************************************************************************************
     * Convert a date/time value in millisends into the format HH:MM
     * @param v - must be a Number, milliseconds since the Unix Epoch in the timezone in which
     *  the time is to be displayed.
     *********************************************************************************************/
    function FormatHHMM( v ) {
        if ( isNaN(v) )
            return "-";

        let date = new Date(v);
        return TwoDigits(date.getUTCHours())+":"+TwoDigits(date.getUTCMinutes());
    }

    /*********************************************************************************************
     * Convert a date/time value in millisends into the format HH:MM:SS
     * @param v - must be a Number, milliseconds since the Unix Epoch in the timezone in which
     *  the time is to be displayed.
     *********************************************************************************************/
    function FormatHHMMSS( v ) {
        if ( isNaN(v) )
            return "-";

        let date = new Date(v);
        return TwoDigits(date.getUTCHours())+":"+TwoDigits(date.getUTCMinutes())+":"+TwoDigits(date.getUTCSeconds());
    }

    /*********************************************************************************************
     * Convert a date/time value in millisends into the format HH:MM am or pm
     * @param v - must be a Number, milliseconds since the Unix Epoch in the timezone in which
     *  the time is to be displayed.
     *********************************************************************************************/
    function FormatHHMMp( v ) {
        if ( isNaN(v) )
            return "-";

        let date = new Date(v);
        let hours = date.getUTCHours();
        let suffix = "am";
        if ( hours === 12 )
            suffix = "pm";
        else if ( hours > 12 )
        {
            hours -= 12;
            suffix = "pm";
        }
        return TwoDigits(hours)+":"+TwoDigits(date.getUTCMinutes())+suffix;
    }

    /*********************************************************************************************
     * Convert a date/time value in millisends into the format HH:MM:SS am or pm
     * @param v - must be a Number, milliseconds since the Unix Epoch in the timezone in which
     *  the time is to be displayed.
     *********************************************************************************************/
    function FormatHHMMSSp( v ) {
        if ( isNaN(v) )
            return "-";

        let date = new Date(v);
        let hours = date.getUTCHours();
        let suffix = "am";
        if ( hours === 12 )
            suffix = "pm";
        else if ( hours > 12 )
        {
            hours -= 12;
            suffix = "pm";
        }
        return TwoDigits(hours)+":"+TwoDigits(date.getUTCMinutes())+":"+TwoDigits(date.getUTCSeconds())+suffix;
    }

    /*********************************************************************************************
     * Convert a number to an Integer string
     *********************************************************************************************/
    function FormatInteger( v ) {
        if ( isNaN(v) )
            return "-";
        else
            return Math.round(v);
    }
    
    /*********************************************************************************************
     * Format a structure { latitude, longitude } to an array of string
     * ["dd°mm.mm'N","dd°mm.mm'W"]
     *********************************************************************************************/
    function FormatLatLong( v ) {
        if ( v == null )
           return "--°--.---'\n--°--.---'";

        var lat = Math.abs( v.latitude );
        var lon = Math.abs( v.longitude );
        if ( isNaN( lat ) || isNaN( lon ))
           return "--°--.---'\n--°--.---'";

        var latDegrees = Math.floor( lat );
        var latMinutes = (lat-latDegrees)*60.0;
        if ( latMinutes > 59.999 )
        {
            latMinutes = 0;
            latDegrees++;
        }

        var lonDegrees = Math.floor( lon );
        var lonMinutes = (lon-lonDegrees)*60.0;
        if ( lonMinutes > 59.999 )
        {
            lonMinutes = 0;
            lonDegrees++;
        }

        var s = TwoDigits(latDegrees)+"°"+TwoDigits(Math.round(latMinutes*1000)/1000)+"'"+( v.latitude < 0?"S":"N")
            + "\n" + TwoDigits(lonDegrees)+"°"+TwoDigits(Math.round(lonMinutes*1000)/1000)+"'"+( v.longitude < 0?"W":"E")
        return s;
    } // end function FormatLatLong

    /*********************************************************************************************
     * Format a structure { latitude, longitude } to an array of string
     * ["+/-dd.ddddd°","+/-dd.ddddd°"]
     *********************************************************************************************/
    function FormatLatLongDeg( v ) {
        //console.log( "--> Format.FormatLatLongDeg, v = " + JSON.stringify(v) );
        if ( v == null )
           return "--.--°\n--.--°";

        var lat = v.latitude;
        var lon = v.longitude;
        if ( isNaN( lat ) || isNaN( lon ))
           return "--.--°\n--.--°";

        var s = TwoDigits(Math.round(lat*100000)/100000)+"°"
            + "\n" + TwoDigits(Math.round(lon*100000)/100000)+"°";
        return s;
    } // end function FormatLatLongDeg

    /*********************************************************************************************
     * Format a structure { latitude, longitude } to an array of string
     * ["dd°mm'ss.s"N","dd°mm'ss.s"W"]
     *********************************************************************************************/
    function FormatLatLongDMS( v ) {
        if ( v == null )
           return "--°--'--.-\"\n--°--'--.-\"";

        var lat = Math.abs( v.latitude );
        var lon = Math.abs( v.longitude );
        if ( isNaN( lat ) || isNaN( lon ))
           return "--°--'--.-\"\n--°--'--.-\"";

        var latDegrees = Math.floor( lat );
        var latMinutes = Math.floor((lat-latDegrees)*60.0);
        var latSeconds = (lat-latDegrees-latMinutes/60)*3600;
        if ( latSeconds > 59.9 )
        {
            latSeconds = 0;
            latMinutes++;
            if ( latMinutes > 59 )
            {
                latMinutes = 0;
                latDegrees++;
            }
        }

        var lonDegrees = Math.floor( lon );
        var lonMinutes = Math.floor((lon-lonDegrees)*60.0);
        var lonSeconds = (lon-lonDegrees-lonMinutes/60)*3600;
        if ( lonSeconds > 59.9 )
        {
            lonSeconds = 0;
            lonMinutes++;
            if ( lonMinutes > 59 )
            {
                lonMinutes = 0;
                lonDegrees++;
            }
        }

        var s = TwoDigits(latDegrees)+"°"+TwoDigits(latMinutes)+"'"+Math.round(latSeconds*10)/10+'"'+( v.latitude < 0?"S":"N")
            + "\n" + TwoDigits(lonDegrees)+"°"+TwoDigits(lonMinutes)+"'"+Math.round(lonSeconds*10)/10+'"'+( v.longitude < 0?"W":"E")
        return s;
    } // end function FormatLatLongDMS

    /*********************************************************************************************
     * Convert a number to an integer and append a %
     *********************************************************************************************/
    function FormatPercent( v ) {
        if ( isNaN(v) )
            return "-";
        else
            return Math.round(v).toString() + "%";
    } // end function FormatPercent


    /*********************************************************************************************
     * Convert a number to a string with at least two digits, prepending zeros if required
     *********************************************************************************************/
    function TwoDigits(number) {
        var result = number<0?"-":"";
        if ( Math.abs(number) < 10 )
            result += "0";
        result = result + Math.abs(number).toString();
        return result;
    }

/*************************************************************************************************
 * function Format
 * This is the function exported for the file.
 * @param formatName - the name of the Formatter to use
 * @param v - the value to be formatted.
 *************************************************************************************************/

    export default function Format( formatName, v ) {
        //console.log( "--> Format.Format, formatName = " + formatName + ", v = " + v );
        if ( v === null )
            return "-";
        if ( formatName == null )
            return "No Format";
        switch ( formatName.toLowerCase() )
        {
            case "cardinal" : return FormatCardinal(v);
            case "ddmmyyyy" : return FormatDDMMYYYY(v);
            case "decimal1" : return FormatDecimal1(v);
            case "decimal2" : return FormatDecimal2(v);
            case "decimal1degrees" : return FormatDecimal1Degrees(v);
            case "decimal1ewdegrees" : return FormatDecimal1EWDegrees(v);
            case "hhmm"     : return FormatHHMM(v);
            case "hhmmp"    : return FormatHHMMp(v);
            case "hhmmss"   : return FormatHHMMSS(v);
            case "hhmmssp"  : return FormatHHMMSSp(v);
            case "integer"  : return FormatInteger(v);
            case "mmddyyyy" : return FormatMMDDYYYY(v);
            case "percent"  : return FormatPercent(v);
            case "lat long" : return FormatLatLong(v);
            case "lat long deg" : return FormatLatLongDeg(v);
            case "lat long dms" : return FormatLatLongDMS(v);
            default         : return v.toString();
        } // end switch
    }