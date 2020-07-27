// File: server/Database.js
// Note: NMEA 2000 repository for data I/O services
// Date: 04/15/2020
//..............................................................................
console.log( "--> constructing Database" );

const TimeConstants                     = require( './TimeConstants' );
const Units                             = require( './Units' );

// ___ pgns package modules ___
const LoadControllerConnectionStatePGN  = require( './pgns/LoadControllerConnectionStatePGN' );
const Protocols                         = require( './pgns/Protocols' ).Protocols;
const RangeCheckers                     = require( './pgns/RangeCheckers' ).rangeCheckers;
const RangeCheckEnum                    = require( './pgns/RangeCheckers' ).CheckEnum;
const SwitchStateEnum                   = require( './pgns/SwitchState' ).SwitchStateEnum;

// ___ switchGroups package modules ___
const SwitchGroup                       = require( './switchGroup/SwitchGroup' );

// ___ common messaging package modules ___
const Controls                          = require( '../src/common/Controls' ).Controls;
const HumiditySources                   = require( '../src/common/HumiditySources' );
const ParameterNames                    = require( '../src/common/Parameters' ).ParameterNames;
const PressureSources                   = require( '../src/common/PressureSources' );
const TemperatureSources                = require( '../src/common/TemperatureSources' );

let pgns = { "127751" : { "100" : { "SID" : 3,
                                    "Connection Number" : 0,
                                    "DC Voltage" : 4,
                                    "DC Current" : 6 }
                     },
            "127488" :  { "100" : { "Engine Instance" : 0,
                                    "Engine Speed" : 400,
                                    "Engine Tilt/Trim" : 0 }
                     }
            };

// The attribute names for the PARAMETERS come from the ParameterNames file.
const PARAMETERS = {};
PARAMETERS[ ParameterNames.ALTITUDE                     ] = { getter : GetDataFromPgn,  pgnName : "129029", field : "Altitude" };

PARAMETERS[ ParameterNames.BATTERY_AH_REMAINING         ] = { getter : GetDataFromPgn,  pgnName : "127506", field : "State of Charge" };
PARAMETERS[ ParameterNames.BATTERY_STATE_OF_CHARGE      ] = { getter : GetDataFromPgn,  pgnName : "127506", field : "State of Charge" };
PARAMETERS[ ParameterNames.BATTERY_STATE_OF_HEALTH      ] = { getter : GetDataFromPgn,  pgnName : "127506", field : "State of Health" };
PARAMETERS[ ParameterNames.BATTERY_TEMPERATURE 	        ] = { getter : GetDataFromPgn,  pgnName : "127508", field : "Battery Case Temperature" };
PARAMETERS[ ParameterNames.BATTERY_TIME_REMAINING       ] = { getter : GetDataFromPgn,  pgnName : "127506", field : "Time Remaining" };
PARAMETERS[ ParameterNames.BREAKER           	        ] = { getter : GetBreaker };
PARAMETERS[ ParameterNames.BUS_AVERAGE_FREQUENCY        ] = { getter : GetDataFromPgn,  pgnName : "65004", field : "Frequency" };
PARAMETERS[ ParameterNames.BUS_AVERAGE_LINE_TO_LINE_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65004", field : "Line-Line Voltage" };
PARAMETERS[ ParameterNames.BUS_AVERAGE_LINE_TO_NEUTRAL_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65004", field : "Line-Neutral Voltage" };

PARAMETERS[ ParameterNames.COURSE_OVER_GROUND           ] = { getter : GetCourseOverGround };

PARAMETERS[ ParameterNames.DATE              	        ] = { getter : GetDate };
PARAMETERS[ ParameterNames.DC_CURRENT        	        ] = { getter : GetDcCurrent };
PARAMETERS[ ParameterNames.DC_POWER          	        ] = { getter : GetDcPower };
PARAMETERS[ ParameterNames.DC_VOLTAGE        	        ] = { getter : GetDcVoltage };
PARAMETERS[ ParameterNames.DEPTH             	        ] = { getter : GetDepth };
PARAMETERS[ ParameterNames.DEPTH_TRANSDUCER_OFFSET      ] = { getter : GetDataFromPgn,  pgnName : "128267", field : "Offset", unitsFunction : Units.ConvertDepth };
PARAMETERS[ ParameterNames.DEW_POINT           	        ] = { getter : GetDewPoint };

PARAMETERS[ ParameterNames.HEADING            	        ] = { getter : GetHeading };
PARAMETERS[ ParameterNames.HUMIDITY_INSIDE    	        ] = { getter : GetHumidity };
PARAMETERS[ ParameterNames.HUMIDITY_OUTSIDE    	        ] = { getter : GetHumidity };
PARAMETERS[ ParameterNames.INDICATOR         	        ] = { getter : GetIndicator };
PARAMETERS[ ParameterNames.LATITUDE_LONGITUDE           ] = { getter : GetPosition };

PARAMETERS[ ParameterNames.PITCH            	        ] = { getter : GetDataFromPgn,  pgnName : "127257", field : "Pitch", unitsFunction : Units.ConvertRelativeAngle };
PARAMETERS[ ParameterNames.PRESSURE_BAROMETRIC          ] = { getter : GetPressure };

PARAMETERS[ ParameterNames.RIPPLE_VOLTAGE    	        ] = { getter : GetDataFromPgn,  pgnName : "127506", field : "Ripple Voltage" };
PARAMETERS[ ParameterNames.ROLL              	        ] = { getter : GetDataFromPgn,  pgnName : "127257", field : "Roll", unitsFunction : Units.ConvertRelativeAngle };

PARAMETERS[ ParameterNames.SCREEN_SELECT     	        ] = { getter : GetScreenSelect };
PARAMETERS[ ParameterNames.SPEED_OVER_GROUND            ] = { getter : GetDataFromPgn,  pgnName : "129026", field : "Speed Over Ground", unitsFunction : Units.ConvertSpeed };
PARAMETERS[ ParameterNames.SPEED_THROUGH_WATER          ] = { getter : GetDataFromPgn,  pgnName : "128259", field : "Speed Water Referenced", unitsFunction : Units.ConvertSpeed };
PARAMETERS[ ParameterNames.SWITCH_CURRENT               ] = { getter : GetBreakerCurrent };
PARAMETERS[ ParameterNames.SWITCH_GROUP                 ] = { getter : GetBreakerGroup };
PARAMETERS[ ParameterNames.SWITCH_VOLTAGE               ] = { getter : GetBreakerVoltage };

PARAMETERS[ ParameterNames.TACHOMETER        	        ] = { getter : GetDataFromPgn,  pgnName : "127488", field : "Engine Speed" };
PARAMETERS[ ParameterNames.TANK_CAPACITY                ] = { getter : GetDataFromPgn,  pgnName : "127505", field : "Tank Capacity", unitsFunction : Units.ConvertVolume };
PARAMETERS[ ParameterNames.TANK_LEVEL                   ] = { getter : GetDataFromPgn,  pgnName : "127505", field : "Fluid Level" };
PARAMETERS[ ParameterNames.TANK_REMAINING               ] = { getter : GetTankRemaining };

PARAMETERS[ ParameterNames.TEMPERATURE_SEA   	        ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_OUTSIDE 	        ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_INSIDE 	        ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_ENGINE           ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_MAIN_CABIN       ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_LIVE_WELL        ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_BAIT_WELL        ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_REFRIGERATION    ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_HEATING_SYSTEM   ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_FREEZER 	        ] = { getter : GetTemperature };
PARAMETERS[ ParameterNames.TEMPERATURE_EXHAUST 	        ] = { getter : GetTemperature };

PARAMETERS[ ParameterNames.UTILITY_AVERAGE_CURRENT      ] = { getter : GetDataFromPgn,  pgnName : "65017", field : "Current" };
PARAMETERS[ ParameterNames.UTILITY_AVERAGE_FREQUENCY    ] = { getter : GetDataFromPgn,  pgnName : "65017", field : "Frequency" };
PARAMETERS[ ParameterNames.UTILITY_AVERAGE_LINE_TO_LINE_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65017", field : "Line-Line Voltage" };
PARAMETERS[ ParameterNames.UTILITY_AVERAGE_LINE_TO_NEUTRAL_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65017", field : "Line-Neutral Voltage" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_APPARENT_POWER ] = { getter : GetDataFromPgn,  pgnName : "65017", field : "Apparent Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_CURRENT      ] = { getter : GetDataFromPgn,  pgnName : "65014", field : "Current" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_FREQUENCY    ] = { getter : GetDataFromPgn,  pgnName : "65014", field : "Frequency" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_POWER_FACTOR ] = { getter : GetPowerFactor,  pgnName : "65012" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_REACTIVE_POWER ] = { getter : GetDataFromPgn,  pgnName : "65012", field : "Reactive Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_REAL_POWER   ] = { getter : GetDataFromPgn,  pgnName : "65013", field : "Real Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_TO_NEUTRAL   ] = { getter : GetDataFromPgn,  pgnName : "65014", field : "Line-Neutral Voltage" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_A_TO_PHASE_B_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65014", field : "AC Line-Line Voltage" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_APPARENT_POWER ] = { getter : GetDataFromPgn,  pgnName : "65010", field : "Apparent Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_CURRENT      ] = { getter : GetDataFromPgn,  pgnName : "65011", field : "Current" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_FREQUENCY    ] = { getter : GetDataFromPgn,  pgnName : "65011", field : "Frequency" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_POWER_FACTOR ] = { getter : GetPowerFactor,  pgnName : "65009" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_REACTIVE_POWER ] = { getter : GetDataFromPgn,  pgnName : "65009", field : "Reactive Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_REAL_POWER   ] = { getter : GetDataFromPgn,  pgnName : "65010", field : "Real Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_TO_NEUTRAL_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65011", field : "Line-Neutral Voltage" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_B_TO_PHASE_C_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65011", field : "BC Line-Line Voltage" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_APPARENT_POWER ] = { getter : GetDataFromPgn,  pgnName : "65007", field : "Apparent Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_CURRENT      ] = { getter : GetDataFromPgn,  pgnName : "65008", field : "Current" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_FREQUENCY    ] = { getter : GetDataFromPgn,  pgnName : "65008", field : "Frequency" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_POWER_FACTOR ] = { getter : GetPowerFactor,  pgnName : "65006" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_REACTIVE_POWER ] = { getter : GetDataFromPgn,  pgnName : "65006", field : "Reactive Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_REAL_POWER   ] = { getter : GetDataFromPgn,  pgnName : "65007", field : "Real Power" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_TO_NEUTRAL_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65008", field : "Line-Neutral Voltage" };
PARAMETERS[ ParameterNames.UTILITY_PHASE_C_TO_PHASE_A_VOLTAGE ] = { getter : GetDataFromPgn,  pgnName : "65008", field : "CA Line-Line Voltage" };

PARAMETERS[ ParameterNames.VARIATION                    ] = { getter : GetVariation };
PARAMETERS[ ParameterNames.WATER_BELOW_TRANSDUCER       ] = { getter : GetDataFromPgn,  pgnName : "128267", field : "Water Depth", unitsFunction : Units.ConvertDepth };

const switchIntervalID = setInterval( UpdateSwitchGroups, 0.5*TimeConstants.SECONDS, GetBreaker );

/*************************************************************************************************
 * function GetDataFromPgn
 *************************************************************************************************/
function GetDataFromPgn( metadata, pgnName, parameterName, unitsFunction ) {
    var value = undefined;
    var pgnRecord = GetPgnRecord( pgnName, metadata.instance, metadata.source );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, pgnName, parameterName );
        if ( value === undefined )
            value = "-";
        else if ( unitsFunction != undefined )
            value = unitsFunction( value, metadata.units );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    return { value : "-", units : metadata.units };
} // end function GetDataFromPgn


/*************************************************************************************************
 * function GetBreaker
 *************************************************************************************************/
function GetBreaker( metadata ) {
    const trace = false; //( metadata.instance === 65 && metadata.channel === 14 );
    if ( trace )
        console.log( "--> Database.GetBreaker, metadata = " + JSON.stringify( metadata ));
    var value = 3;
    var switchPosition = SwitchStateEnum.UNKNOWN;
    var locked = false;
    var sensedHigh = false;
    var isGFCIBreaker = false;
    var GFCITrip = false;
    var GFCISensorFault = false;
    var GFCIEndOfLife = false;
    var device;
    var pgn127500 = GetPgnRecord( "127500", metadata.instance, metadata.channel-1 );
    if ( pgn127500 )
    {
        if ( trace )
            console.log( "    found channel data" );
        locked = (pgn127500["Operational Status"] & 0x01) === 0x01;
        sensedHigh = (pgn127500["Connection Status"] & 0x0001) === 0x0001;
        GFCITrip = (pgn127500["Connection Status"] & 0x0040) === 0x0040;
        GFCIEndOfLife = (pgn127500["Connection Status"] & 0x0800) === 0x0800;
        device = pgn127500.device;
        if ( trace )
        {
            console.log( "    locked="+locked+", sensedHigh="+sensedHigh+",GFCITrip="+GFCITrip+",GFCIEndOfLife="+GFCIEndOfLife );
            console.log( "    Connection State = " + pgn127500["Connection State"] );
        }
        switch ( pgn127500["Connection State"] )
        {
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.OFF :
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.LOW :
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.TIMED_OFF :
                switchPosition = SwitchStateEnum.OFF;
                break;
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.HIGH :
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.TIMED_ON :
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.CYCLE_OFF :
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.CYCLE_ON :
                switchPosition = SwitchStateEnum.ON;
                break;
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.PWN :
                if ( pgn127500["PWN Duty Cycle"] === 0 )
                    switchPosition = SwitchStateEnum.OFF;
                else
                    switchPosition = SwitchStateEnum.ON;
                break;
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.TRIPPED :
                switchPosition = SwitchStateEnum.TRIPPED;
                break;
            case LoadControllerConnectionStatePGN.ConnectionStateEnum.FAULT :
                if ( sensedHigh )
                    switchPosition = SwitchStateEnum.ON;
                else if ( GFCITrip )
                    switchPosition = SwitchStateEnum.TRIPPED;
                else
                    switchPosition = SwitchStateEnum.OFF;
                break;
        } // end switch
    }

    if ( switchPosition === SwitchStateEnum.UNKNOWN )
    {
        var pgn127501 = null; //GetPgnRecord( "127501", metadata.instance );
        if ( pgn127501 )
        {
            var channelName = "#"+(metadata.channel);
            //console.log( "    channelName = " + channelName );
            switchPosition = pgn127501[channelName];
            device = pgn127501.device;
        }
    }

    // The Carling AC GenII Breaker Status message is transmitted upon request or state change,
    // so we must not check it for age.
    
    // console.log( "--- check for GFCI" );
    // console.log( "PGNS = " + JSON.stringify( pgns["65300_MT66"] ));
    var pgn65300_MT66 = GetPgnRecord( "65300_MT66", metadata.instance, metadata.channel );
    if ( pgn65300_MT66 )
    {
        var carlingBreakerStatus = GetNumberFromField( pgn65300_MT66, "65300_MT66", "Breaker Status" );
        if ( (carlingBreakerStatus & 0x20) == 0x20 )
            locked = true;
        if ( (carlingBreakerStatus & 0x08) == 0x08 )
            GFCITrip = true;
        if ( (carlingBreakerStatus & 0x04) == 0x04 )
            isGFCIBreaker = true;
    }

    // console.log( "    switchPosition = " + switchPosition + ", value = " + value + ", locked = " + locked );
    if ( switchPosition !== SwitchStateEnum.UNKNOWN )
    {
        // now combine the switch position with the decorator bits to give the value
        // .... .... .... 00xx   : Switch position</li>
        // .... .... ...x ....   : Breaker is locked</li>
        // .... .... ..x. ....   : Breaker is under Load Control</li>
        // .... .... .x.. ....   : Breaker is under Alert Control</li>
        // .... .... x... ....   : Breaker is a Switch Group Breaker</li>
        // .... ...x .... ....   : Breaker is under Group Control</li>
        // .... ..x. .... ....   : Breaker is under Timer Control</li>
        // .... .x.. .... ....   : Breaker is under Local Override</li>
        // .... x... .... ....   : Breaker was tripped for GFCI</li>
        // ...x .... .... ....   : Breaker is at GFCI End of Life</li>
        // ..x. .... .... ....   : Breaker is a GFCI Breaker</li>
        value = switchPosition;
        if ( locked )
            value |= 0x0010;
        else
        {
            // See if the Breaker is under Load Control
            // See if the Breaker is under Alert Control
            // See if the Breaker is under Group Control
            if ( trace )
                console.log( "    Checking for switch group, instance = " + metadata.instance + ", channel = " + metadata.channel );
            if ( SwitchGroup.BreakerIsInSwitchGroup( metadata.instance, metadata.channel ))
                value |= 0x100;
            // See if the Breaker is under Timer Control
        }
        if ( isGFCIBreaker )
            value |= 0x2000;
        if ( GFCITrip )
            value |= 0x0800;
        if ( GFCISensorFault || GFCIEndOfLife )
            value |= 0x1000;
        // Read the Carling Box Status message (65300_MT1) to determine Local Override Status
        var pgn65300_MT1 = pgns["65300_MT1"];
        if ( pgn65300_MT1 )
        {
            let statusInstance = pgn65300_MT1[metadata.instance.toString()];
            if ( statusInstance["Override Mode Active"] )
                value |= 0x0400;
        }
    }

    if ( trace )
        console.log( "<-- Database.GetBreaker, value = 0x" + value.toString(16) );
    return { value : value, device : device, units : metadata.units };
} // end function GetBreaker

/*************************************************************************************************
 * function GetBreakerCurrent
 *************************************************************************************************/
function GetBreakerCurrent( metadata ) {
    var trace = false; //( metadata.channel === 4 );
    if ( trace ) console.log( "--> Database.GetBreakerCurrent, metadata = " + JSON.stringify( metadata ));
    var current;
    /** This message comes from the Maretron DCR100, PGN 65284 */
    var pgnRecord = GetPgnRecord( "65284", metadata.instance, metadata.channel );
    if ( pgnRecord )
    {
        // console.log( "    pgnRecord = " + JSON.stringify(pgnRecord));
        current = GetNumberFromField( pgnRecord, "65284", "Breaker Current" ); // Amps
        return { value : current, device : pgnRecord.device, units : metadata.units };
    }
    if ( trace ) console.log( "    Looking for the Carling Breaker Status Message" );
    /** This message is the Carling Breaker Status Message PGN 130921_MT2 */
    pgnRecord = GetPgnRecord( "130921_MT2", metadata.instance, metadata.channel );
    if ( pgnRecord )
    {
        if ( trace ) console.log( "    pgnRecord = " + JSON.stringify(pgnRecord));
        current = GetNumberFromField( pgnRecord, "130921_MT2", "Current" ); // Amps
        if ( trace ) console.log( "<-- Database.GetBreakerCurrent, current = " + current );
        return { value : current, device : pgnRecord.device, units : metadata.units };
    }
    if ( trace ) console.log( "<-- Database.GetBreakerCurrent, value = -" );
    return { value : "-", units : metadata.units };
} // end function GetBreakerCurrent

/*************************************************************************************************
 * function GetBreakerVoltage
 *************************************************************************************************/
function GetBreakerVoltage( metadata ) {
    //console.log( "--> Database.GetBreakerVoltage, metadata = " + JSON.stringify( metadata ));
    var voltage;
    /** This message is the Carling Breaker Status Message PGN 130921_MT2 */
    var pgnRecord = GetPgnRecord( "130921_MT2", metadata.instance, metadata.channel );
    if ( pgnRecord )
    {
        // console.log( "    pgnRecord = " + JSON.stringify(pgnRecord));
        voltage = GetNumberFromField( pgnRecord, "130921_MT2", "Voltage" ); // Volts
        //console.log( "<-- Database.GetBreakerVoltage, voltage = " + voltage );
        return { value : voltage, device : pgnRecord.device, units : metadata.units };
    }

    // console.log( "<-- Database.GetBreakerVoltage, value = -" );
    return { value : "-", units : metadata.units };
} // end function GetBreakerVoltage

/*************************************************************************************************
 * function GetBreakerGroup
 *************************************************************************************************/
function GetBreakerGroup( metadata ) {
    let instance = metadata.instance;
    let channel = metadata.channel;
    // console.log( "--> Database.GetBreakerGroup instance = " + instance + ", channel = " + channel );

    const switchGroup = SwitchGroup.GetGroup( channel );
    // console.log( "    switchGroup = " + JSON.stringify( switchGroup ));
    if ( switchGroup == null )
        return null;
    let switchPosition = switchGroup.mCurrentState | 0x80;
/*
CONFIG::desktop
{
            // See if the Breaker is under Alert Control
            var alerts : Vector.<BasicAlert> = AlertManager.GetAlerts();
            for each ( var alert : BasicAlert in alerts )
            {
                if ( !alert.IsDisabled()
                    && alert.mEnableSwitchAction
                    && mN2KView.mAllowSwitchActions )
                {
                    if ( alert.mSwitchActionInstance == instance
                        && alert.mSwitchActionIndicator == indicator )
                    {
                        result.value |= 0x40;
                        break;
                    }
                    else if ( alert.mSwitchActionInstance == SwitchGroup.SWITCH_GROUP_INSTANCE )
                    {
                        switchGroup = SwitchGroup.GetGroup( alert.mSwitchActionIndicator );
                        if ( switchGroup != null )
                        {
                            for each ( var breaker0 : SwitchGroupEntry in switchGroup.mSwitches )
                            {
                                if ( breaker0.mInstanceNo == instance
                                    && breaker0.mIndicator == indicator )
                                {
                                    result.value |= 0x40;
                                    break;
                                }
                            } // end for loop
                        }
                    }
                } // end if
            } // end for loop
} // end CONFIG::desktop
*/
    return { value : switchPosition, units : metadata.units };
} // end function GetBreakerGroup

/*************************************************************************************************
 * function GetCarlingACBreakerConfiguration
 *************************************************************************************************/
function GetCarlingACBreakerConfiguration( metadata ) { 
    // console.log( "--> Database.GetCarlingACBreakerConfiguration ");
    // Try the AC Gen 2 configuration message first
    var gen2Record = GetPgnRecord( "65300_MT67", metadata.instance, metadata.channel );
    if ( gen2Record )
    {
        // console.log( "    gen2Record found for instance " + metadata.instance + ", channel " + metadata.channel );
        var flags = GetNumberFromField( gen2Record, "65300_MT67", "Configuration Flags" );
        return {
            defaultState                : ( flags&0x80) === 0x80,
            defaultLockState            : ( flags&0x40) === 0x40,
            userConfigurationEnabled    : ( flags&0x10) === 0x10,
            activateAlarmWhenTripped    : ( flags&0x08) === 0x08,
            defaultToLastState          : ( flags&0x01) === 0x01,
            brownOutEnabled             : false,
            dimmingEnabled              : false,
            breakerGroup                : GetNumberFromField( gen2Record, "65300_MT67", "Breaker Group" )
        };
    };
    // console.log( "<-- Database.GetCarlingACBreakerConfiguration not found");
} // end function GetCarlingACBreakerConfiguration

/*************************************************************************************************
 * function GetCarlingACBreakerStatus
 *************************************************************************************************/
function GetCarlingACBreakerStatus( metadata ) { 
    // console.log( "--> Database.GetCarlingACBreakerStatus ");
    // Try the AC Gen 2 configuration message first
    var gen2Record = GetPgnRecord( "65300_MT66", metadata.instance, metadata.channel );
    if ( gen2Record )
    {
        // console.log( "    gen2Record found for instance " + metadata.instance + ", channel " + metadata.channel );
        var breakerStatus1 = GetNumberFromField( gen2Record, "65300_MT66", "Breaker Status" );
        // console.log( "<-- Database.GetCarlingACBreakerStatus found");
        return {
            breakerPresent              : ( breakerStatus1&0x80) === 0x80,
            breakerOn                   : ( breakerStatus1&0x40) === 0x40,
            breakerLocked               : ( breakerStatus1&0x20) === 0x20,
            overcurrrentTrip            : ( breakerStatus1&0x10) === 0x10,
            GFCITrip                    : ( breakerStatus1&0x08) === 0x08,
            breakerIsGFCI               : ( breakerStatus1&0x04) === 0x04,
            onCircuitFault              : ( breakerStatus1&0x02) === 0x02,
            offCircuitFault             : ( breakerStatus1&0x01) === 0x01,
            breakerProfileVoltage       : GetNumberFromField( gen2Record, "65300_MT66", "Breaker Profile, Voltage" ),
            breakerProfileCurrent       : GetNumberFromField( gen2Record, "65300_MT66", "Breaker Profile, Current" )
        };
    };
    // console.log( "<-- Database.GetCarlingACBreakerStatus not found");
} // end function GetCarlingACBreakerStatus

/*************************************************************************************************
 * function GetCarlingDCBreakerConfiguration
 *************************************************************************************************/
function GetCarlingDCBreakerConfiguration( metadata ) { 
    // console.log( "--> Database.GetCarlingDCBreakerConfiguration ");
    var pgnRecord = GetPgnRecord( "130921_MT3", metadata.instance, metadata.channel );
    if ( pgnRecord )
    {
        // console.log( "    pgnRecord found for instance " + metadata.instance + ", channel " + metadata.channel );
        var flags = GetNumberFromField( pgnRecord, "130921_MT3", "Configuration Flags" );
        return {
            tripDelay                   : GetNumberFromField( pgnRecord, "130921_MT3", "Trip Delay" ),
            inrushDelay                 : GetNumberFromField( pgnRecord, "130921_MT3", "Inrush Delay" ),

            defaultState                : ( flags&0x80) === 0x80,
            defaultLockState            : ( flags&0x40) === 0x40,
            dimmingEnabled              : ( flags&0x20) === 0x20,
            userConfigurationEnabled    : ( flags&0x10) === 0x10,
            activateAlarmWhenTripped    : ( flags&0x08) === 0x08,
            brownOutEnabled             : ( flags&0x04) !== 0x04,
            defaultToLastState          : ( flags&0x01) !== 0x01,   // 0 => Default to last state

            currentRating               : GetNumberFromField( pgnRecord, "130921_MT3", "Current Rating" ),
            factoryMaximumRating        : GetNumberFromField( pgnRecord, "130921_MT3", "Factory Maximum Rating" ),
            loadShedPriorityScheduleA   : GetNumberFromField( pgnRecord, "130921_MT3", "Load Shed Priority Schedule A" ),
            loadShedPriorityScheduleB   : GetNumberFromField( pgnRecord, "130921_MT3", "Load Shed Priority Schedule B" ),
            defaultDimValue             : GetNumberFromField( pgnRecord, "130921_MT3", "Default Dim Value" ),
            flashMapIndex               : GetNumberFromField( pgnRecord, "130921_MT3", "Flash Map Index" ),
            breakerGroup                : GetNumberFromField( pgnRecord, "130921_MT3", "Breaker Group" )
        };
    };
    // console.log( "<-- Database.GetCarlingDCBreakerConfiguration not found");
} // end function GetCarlingDCBreakerConfiguration

/*************************************************************************************************
 * function GetCarlingDCBreakerStatus
 *************************************************************************************************/
function GetCarlingDCBreakerStatus( metadata ) { 
    // console.log( "--> Database.GetCarlingDCBreakerStatus ");
    // Try the AC Gen 2 configuration message first
    var pgnRecord = GetPgnRecord( "130921_MT2", metadata.instance, metadata.channel );
    if ( pgnRecord )
    {
        // console.log( "    pgnRecord found for instance " + metadata.instance + ", channel " + metadata.channel );
        var breakerStatus2 = GetNumberFromField( pgnRecord, "130921_MT2", "Breaker Status 2" );
        var breakerStatus3 = GetNumberFromField( pgnRecord, "130921_MT2", "Breaker Status 3" );
        // console.log( "<-- Database.GetCarlingDCBreakerStatus found");
        return {
            current                     : GetNumberFromField( pgnRecord, "130921_MT2", "Current" ),
            voltage                     : GetNumberFromField( pgnRecord, "130921_MT2", "Voltage" ),
            dimValue                    : GetNumberFromField( pgnRecord, "130921_MT2", "Dim Value" ),
            
            breakerCommunicating        : ( breakerStatus2&0x80) === 0x80,
            breakerOn                   : ( breakerStatus2&0x40) === 0x40,
            breakerTripped              : ( breakerStatus2&0x20) === 0x20,
            breakerLocked               : ( breakerStatus2&0x10) === 0x10,
            busControl                  : ( breakerStatus2&0x08) === 0x08,
            abnormalHigh                : ( breakerStatus2&0x04) === 0x04,
            abnormalLow                 : ( breakerStatus2&0x02) === 0x02,
            shortLoad                   : ( breakerStatus2&0x01) === 0x01,
            
            openLoad                    : ( breakerStatus3&0x80) === 0x80,
            communicationsError         : ( breakerStatus3&0x40) === 0x40,
            addressError                : ( breakerStatus3&0x20) === 0x20,
            adcError                    : ( breakerStatus3&0x10) === 0x10,
            arc                         : ( breakerStatus3&0x08) === 0x08,
            fuseDestruct                : ( breakerStatus3&0x04) === 0x04,
            fuseDestructFailed          : ( breakerStatus3&0x02) === 0x02,
            stateMismatch               : ( breakerStatus3&0x01) === 0x01,
            
            breakerModel                : GetNumberFromField( pgnRecord, "130921_MT2", "Model Number" ),
            breakerGroupNumber          : GetNumberFromField( pgnRecord, "130921_MT2", "Group Number" ),
            ecbSoftwareVersion          : GetNumberFromField( pgnRecord, "130921_MT2", "ECB Software Version" )
        };
    };
    // console.log( "<-- Database.GetCarlingDCBreakerStatus not found");
} // end function GetCarlingDCBreakerStatus

/*************************************************************************************************
 * function GetCourseOverGround
 * @return Course over Ground (COG) in degrees clockwise from true north
 *************************************************************************************************/
function GetCourseOverGround( metadata ) {
    var value; // course over ground in degrees True
    var pgnRecord = GetPgnRecord( "129026", metadata.instance );
    if ( pgnRecord )
    {
        let cog = GetNumberFromField( pgnRecord, "129026", "Course Over Ground" ); // radians
        let sog = GetNumberFromField( pgnRecord, "129026", "Speed Over Ground" ); // meters/sec
        let reference = GetNumberFromField( pgnRecord, "129026", "COG Reference" );
        let variation = GetVariation( { instance : -1 } ); // degrees
        let deviation = GetDataFromPgn( { instance : -1 }, "172250", "Deviation" );
        if ( sog < 0.01 )
        {
            let heading = GetHeading( { instance : -1 } );
            if ( heading !== undefined )
            {
                value = heading;
                reference = 1;
            }
        }
        else
        {
            if ( reference === 1 )
            {
                // we have magnetic COG, we want true COG
                if ( !isNaN( variation ) )
                    value = DegreesOf(cog)+variation;
                else
                    value = "No Var";
            }
            else
                value = DegreesOf(cog);
        }
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    return { value : "-", units : metadata.units };
} // end function GetCourseOverGround

/*************************************************************************************************
 * function GetDate
 *************************************************************************************************/
function GetDate(metadata) {
    // var pgnData = pgns["127501"];
    // if ( pgnData )
    // {
       // var pgnInstance = pgnData[metadata.instance.toString()];
    // }
    var now = new Date();
    var value = now.getTime();
    var unitText = "Local";

   // console.log( "--> " + metadata.control + " timezone = " + metadata.timezoneOffset );
    if ( metadata.timezoneOffset != null )
    {
        if ( !isNaN( metadata.timezoneOffset ))
        {
            value += metadata.timezoneOffset * TimeConstants.MINUTES;
            unitText = HHMM(metadata.timezoneOffset);
        }
        else if ( metadata.timezoneOffset.toUpperCase().localeCompare( "UTC" ) == 0 )
        {
            unitText = "UTC";
        }
        else if ( metadata.timezoneOffset.toUpperCase().localeCompare( "LOCAL" ) == 0 )
        {
            value -= now.getTimezoneOffset * TimeConstants.MINUTES;
        }
    }
    else
    {
        // console.log( "    no timezone specified" );
        value -= now.getTimezoneOffset() * TimeConstants.MINUTES;
        unitText = "Local";
    }

    // console.log( "    now = " + now );
    // console.log( "    UTCHours = " + now.getUTCHours() + ", Hours = " + now.getHours() );
    if ( metadata.control.localeCompare( Controls.CLOCK ) == 0 )
    {
        let valueDate = new Date( value );
        // console.log( "    value = " + valueDate );
        // console.log( "    UTCHours = " + valueDate.getUTCHours() + ", Hours = " + valueDate.getHours() );
        if ( valueDate.getUTCHours() < 12 )
            unitText = unitText + ", am";
        else
            unitText = unitText + ", pm";
    }

    // console.log( "<-- Database.GetDate now = " + now.getTime() + ", units = " + unitText );
    return { value : value, units : unitText };
} // end function GetDate

/*************************************************************************************************
 * function GetDcCurrent
 *************************************************************************************************/
function GetDcCurrent( metadata ) {
    var value;
    var pgnRecord = GetPgnRecord( "127751", metadata.instance );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "127751", "DC Current" );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    
    pgnRecord = GetPgnRecord( "127508", metadata.instance );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "127508", "Battery Current" );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    return { value : "-", units : metadata.units };
} // end function GetDcCurrent

/*************************************************************************************************
 * function GetDcPower
 *************************************************************************************************/
function GetDcPower( metadata ) {
    var value;
	var voltage;
	var current;
    var pgnRecord = GetPgnRecord( "127751", metadata.instance );
    if ( pgnRecord )
    {
        current = GetNumberFromField( pgnRecord, "127751", "DC Current" );
        voltage = GetNumberFromField( pgnRecord, "127751", "DC Voltage" );
        value = voltage*current;
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    pgnRecord = GetPgnRecord( "127508", metadata.instance );
    if ( pgnRecord )
    {
        current = GetNumberFromField( pgnRecord, "127508", "Battery Current" );
        voltage = GetNumberFromField( pgnRecord, "127508", "Battery Voltage" );
        value = voltage*current;
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    return { value : "-", units : metadata.units };
} // end function GetDcPower

/*************************************************************************************************
 * function GetDcVoltage
 *************************************************************************************************/
function GetDcVoltage( metadata ) {
    var value = undefined;
    var pgnRecord = GetPgnRecord( "127751", metadata.instance );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "127751", "DC Voltage" );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    
    pgnRecord = GetPgnRecord( "127508", metadata.instance );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "127508", "Battery Voltage" );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    return { value : "-", units : metadata.units };
} // end function GetDcVoltage

/*************************************************************************************************
 * function GetDepth
 * @return Depth of water in units specified in metadata.units
 *************************************************************************************************/
function GetDepth( metadata ) {
    var value = undefined;
    var pgnRecord = GetPgnRecord( "128267", metadata.instance );
    if ( pgnRecord )
    {
        let depthBelowTransducer = GetNumberFromField( pgnRecord, "128267", "Water Depth" );
        let transducerOffset     = GetNumberFromField( pgnRecord, "128267", "Offset" );
        if ( !isNaN( depthBelowTransducer ) && !isNaN( transducerOffset ))
            value = depthBelowTransducer + transducerOffset;
        if ( value === undefined )
            value = "-";
        else
            value = Units.ConvertDepth( value, metadata.units );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    return { value : "-", units : metadata.units };
} // end function GetDepth

/*************************************************************************************************
 * function GetDewPoint
 * @param  metadata
 * @return Dew Point in temperature units specified in metadata.units
 *************************************************************************************************/
function GetDewPoint( metadata ) {
    /** Dry Bulb temperature in °C */
    const temperatureMetadata = { instance : metadata.instance, parameter  : ParameterNames.TEMPERATURE_OUTSIDE, units : "°C" };
    var temperature = GetTemperature( temperatureMetadata );
    /** Relative Humidity as a Percentage */
    const humidityMetadata = { instance : metadata.instance, parameter : ParameterNames.HUMIDITY_OUTSIDE };
    var humidity    = GetHumidity( humidityMetadata );
    if ( temperature != null && !isNaN( temperature.value ) && humidity != null && !isNaN( humidity.value ) )
    {
        /** Ambient Vapor pressure in kPa */
        var e = (humidity.value/100)*0.611*Math.exp(17.27*temperature.value/(temperature.value+237.3));
        /** Dew Point in °C */
        var Td = (116.9+237.3*Math.log(e))/(16.78-Math.log(e));

        var value = Units.ConvertTemperature( Td + 273.15, metadata.units );
        return { value : value, device : temperature.device, units : metadata.units };
    }        
        
    return { value : "-", units : metadata.units };
} // end function GetDewPoint

/*************************************************************************************************
 * function GetHeading
 * @return Heading in degrees clockwise from true north
 *************************************************************************************************/
function GetHeading( metadata ) {
    // console.log( "--> Database.GetHeading, instance = " + metadata.instance );
    var value; // heading in degrees true
    var pgnRecord = GetPgnRecord( "127250", metadata.instance );
    if ( pgnRecord )
    {
        let heading = GetNumberFromField( pgnRecord, "127250", "Heading" ); // radians
        let reference = GetNumberFromField( pgnRecord, "127250", "Reference" );
        let variation = GetVariation( { instance : -1 } ).value; // degrees
        let deviation = GetNumberFromField( pgnRecord, "127250", "Deviation" ); // radians
        if ( reference === 1 )
        {
            // we have magnetic heading, we want true heading
            if ( !isNaN( variation ) )
            {
                value = DegreesOf(heading)+variation;
                if ( !isNaN( deviation ) )
                    value = value+DegreesOf(deviation);
            }
            else
                value = "No Var";
        }
        else
            value = DegreesOf(heading);
        if ( value == undefined )
            value = "-";
        // console.log( "<-- Database.GetHeading, value = " + value + ", units = " + metadata.units );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    // console.log( "<-- Database.GetHeading, value = -, units = " + metadata.units );
    return { value : "-", units : metadata.units };
} // end function GetHeading

/*************************************************************************************************
 * function GetHumidity
 *************************************************************************************************/
function GetHumidity( metadata ) {
    var value = undefined;
    var source = HumiditySources.GetValue(metadata.parameter);
    // console.log( "    source = " + source );
    // First try PGN 130313, Humidity PGN
    var pgnRecord = GetPgnRecord( "130313", metadata.instance, source );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "130313", "Actual Humidity" );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    // Second try PGN 130311, Environment PGN
    if ( parseInt(metadata.source) === HumiditySources.OUTSIDE || parseInt(metadata.source) === HumiditySources.INSIDE )
    {
        pgnRecord = GetPgnRecord( "130311", metadata.instance, source );
        if ( pgnRecord )
        {
            value = GetNumberFromField( pgnRecord, "130311", "Humidity" );
            return { value : value, device : pgnRecord.device, units : metadata.units };
        }
    } // end if source is OUTSIDE or INSIDE
    
    return { value : "-", units : metadata.units };
} // end function GetHumidity

/*************************************************************************************************
 * function GetIndicator
 *************************************************************************************************/
function GetIndicator( metadata ) {
    var pgnRecord = GetPgnRecord( "127501", metadata.instance );
    if ( pgnRecord )
    {
        var value = pgnRecord["#"+metadata.channel];
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    
    return { value : "-", units : metadata.units };
} // end function GetIndicator

/*************************************************************************************************
 * function GetPosition
 *************************************************************************************************/
function GetPosition( metadata ) {
    var value = "-";
    var latitude;
    var longitude;
    var pgnRecord = GetPgnRecord( "129029", metadata.instance );
    if ( pgnRecord )
    {
        var gpsMNode = GetNumberFromField( pgnRecord, "129029", "Method, GNSS" );
        if ( gpsMode == 1 || gpsMode == 2 || gpsMode == 3 )
        {
            latitude = GetNumberFromField( pgnRecord, "129029", "Latitude" );
            longitude = GetNumberFromField( pgnRecord, "129029", "Longitude" );
            value = { latitude : latitude, longitude : longitude };
            return { value : value, device : pgnRecord.device, units : metadata.units };
        }
    }
    pgnRecord = GetPgnRecord( "129025", metadata.instance );
    if ( pgnRecord )
    {
        latitude = GetNumberFromField( pgnRecord, "129025", "Latitude" );
        longitude = GetNumberFromField( pgnRecord, "129025", "Longitude" );
        value = { latitude : latitude, longitude : longitude };
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    return null; //{ value : value, units : metadata.units };
} // end function GetPosition

/*************************************************************************************************
 * function GetPowerFactor
 *************************************************************************************************/
function GetPowerFactor( metadata, pgnName ) {
    var pgnRecord = GetPgnRecord( pgnName, metadata.instance );
    if ( pgnRecord )
    {
        var value;
        var pf  = pgnRecord[ "Power Factor" ];
        var lag = pgnRecord[ "Power Factor Lagging" ];
        if ( lag === 0 )
            value = pf;
        else if ( lag === 1 )
            value = -pf;
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    
    return { value : "-", units : metadata.units };
} // end function GetPowerFactor

/*************************************************************************************************
 * function GetPressure
 *************************************************************************************************/
function GetPressure( metadata ) {
    var value = undefined;
    // console.log( "--> Database.GetPressure metadata = " + JSON.stringify(metadata));
    var source = PressureSources.GetValue(metadata.parameter);
    // console.log( "    source = " + source );
    
    // First try PGN 130314, Extended Temperature PGN
    var pgnRecord = GetPgnRecord( "130314", metadata.instance, source );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "130314", "Pressure" );
        if ( value === undefined )
            value = "-";
        else
            value = Units.ConvertPressure( value, metadata.units );
            // console.log( "<-- Database.GetPressure value = " + value + ", units = " + metadata.units );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    if ( source == PressureSources.ATMOSPHERIC )
    {
        // Second try PGN 130311, Environmental Parameters 2
        pgnRecord = GetPgnRecord( "130311", metadata.instance );
        if ( pgnRecord )
        {
            value = GetNumberFromField( pgnRecord, "130311", "Atmospheric Pressure" );
            if ( value === undefined )
                value = "-";
            else
                value = Units.ConvertPressure( value, metadata.units );
                // console.log( "<-- Database.GetPressure value = " + value + ", units = " + metadata.units );
            return { value : value, device : pgnRecord.device, units : metadata.units };
        }

        // Third try PGN 130310, Environmental Parameters
        pgnRecord = GetPgnRecord( "130310", metadata.instance );
        if ( pgnRecord )
        {
            value = GetNumberFromField( pgnRecord, "130310", "Atmospheric Pressure" );
            if ( value === undefined )
                value = "-";
            else
                value = Units.ConvertPressure( value, metadata.units );
                // console.log( "<-- Database.GetPressure value = " + value + ", units = " + metadata.units );
            return { value : value, device : pgnRecord.device, units : metadata.units };
        }
        // console.log( "   pressure 2 = " + value );
   } // end if source is Atmospheric

    if ( value === undefined )
        value = "-";
    else
        value = Units.ConvertPressure( value, metadata.units );
    
    // console.log( "<-- Database.GetPressure value = -, units = " + metadata.units );
    return { value : "-", units : metadata.units };
} // end function GetPressure

/*************************************************************************************************
 * function GetScreenSelect
 *************************************************************************************************/
function GetScreenSelect( metadata ) {
    return { value : "-", units : "-" };
} // end function GetScreenSelect

/*************************************************************************************************
 * function GetTankRemaining
 *************************************************************************************************/
function GetTankRemaining( metadata ) {
    var value = undefined;
    var pgnRecord = GetPgnRecord( "127505", metadata.instance, metadata.source );
    if ( pgnRecord )
    {
        let capacity = GetNumberFromField( pgnRecord, "127505", "Tank Capacity" );
        let level    = GetNumberFromField( pgnRecord, "127505", "Fluid Level" );
        value = capacity * level / 100;
        if ( value === undefined )
            value = "-";
        else
            value = Units.ConvertVolume( value, metadata.units );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    return { value : "-", units : metadata.units };
} // end function GetTankRemaining

/*************************************************************************************************
 * function GetTemperature
 *************************************************************************************************/
function GetTemperature( metadata ) {
    var value;
    // console.log( "--> Database.GetTemperature metadata = " + JSON.stringify(metadata));
    var source = TemperatureSources.GetValue(metadata.parameter);
    // console.log( "    source = " + source );
    // First try PGN 130316, Extended Temperature PGN
    var pgnRecord = GetPgnRecord( "130316", metadata.instance, source );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "130316", "Actual Temperature" );
        value = Units.ConvertTemperature( value, metadata.units );
        // console.log( "<-- Database.GetTemperature value = " + value + ", units = " + metadata.units );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }

    // Second try PGN 130312, Temperature PGN
    pgnRecord = GetPgnRecord( "130312", metadata.instance, source );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "130312", "Actual Temperature" );
        value = Units.ConvertTemperature( value, metadata.units );
        // console.log( "<-- Database.GetTemperature value = " + value + ", units = " + metadata.units );
        return { value : value, device : pgnRecord.device, units : metadata.units };
    }
    
    // console.log( "<-- Database.GetTemperature value = " + value + ", units = " + metadata.units );
    return { value : "-", units : metadata.units };
} // end function GetTemperature

/*************************************************************************************************
 * function GetVariation
 *************************************************************************************************/
function GetVariation( metadata ) {
    var value;
    var pgnRecord = GetPgnRecord( "127258", metadata.instance );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "127258", "Variation" );
        value = Units.ConvertRelativeAngle( value );
        return { value : value, device : pgnRecord.device, units : "Degrees" };
    }

    pgnRecord = GetPgnRecord( "127250", metadata.instance );
    if ( pgnRecord )
    {
        value = GetNumberFromField( pgnRecord, "127250", "Variation" );
        value = Units.ConvertRelativeAngle( value );
        return { value : value, device : pgnRecord.device, units : "Degrees" };
	}

    return { value : "-", units : "Degrees" };
} // end function GetVariation

/*************************************************************************************************
 * function GetPgnRecord
 * The number is range checked, and the resolution and offset applied as the number is retrieved
 * from the database.
 * @param pgnName - String, the name of the PGN as defined in Parameters
 * @param instance - Integer, the required instance number, may be -1 for Any
 * @param source - Integer, source number or channel number, may be undefined
 * @return may return a record or null
 *************************************************************************************************/
function GetPgnRecord( pgnName, instance, source = undefined ) {
    const trace = false; //( pgnName == "127500" );
    if ( trace )
        console.log( "--> Database.GetPgnRecord, pgnName = " + pgnName + ", instance = " + instance + ", source = " + source );
    var record = pgns[pgnName];
    if ( record )
    {
        if ( trace ) console.log( "    pgn record found, " + JSON.stringify( record ));
        if ( instance === -1 )
        {
            let indices = Object.keys(record);
            if ( trace ) console.log( "    indices = [" + indices + "]" );
            let tempRecord = undefined;
            indices.some( index => {
                if ( trace ) console.log( "    checking instance " + index );
                let indexRecord = record[ indices[0] ];
                if ( source === undefined )
                {
                    tempRecord = indexRecord;
                    if ( trace ) console.log( "    No Source" );
                    return true;
                }
                else
                {
                    if ( trace ) console.log( "    looking for source " + source );
                    indexRecord = indexRecord[source.toString()];
                    if ( indexRecord )
                    {
                        tempRecord = indexRecord;
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            });
            record = tempRecord;
            if ( trace ) console.log( "    record = " + JSON.stringify( record ));
        }
        else
        {
            record = record[instance.toString()];
            if ( record )
            {
                if ( trace ) console.log( "    instance record found, " + JSON.stringify( record ));
                if ( source !== undefined )
                {
                    if ( trace ) console.log( "    looking for source " + source );
                    record = record[source.toString()];
                }
            }
        }
    }

/* TODO Move the timeout function to here
    // Test that the record was received within the timeout period
    if ( record )
    {
        if ( trace ) console.log( "    record found, "  + JSON.stringify( record ));
        let age = (new Date()) - record.timestamp;
        if ( age <= 10*TimeConstants.SECONDS )
        {
            if ( trace ) console.log( "<-- Database.GetPgnRecord returning record" );
            return record;
        }
        if ( trace ) console.log( "    data was too old to use" );
    }
    if ( trace ) console.log( "<-- Database.GetPgnRecord returning null" );
    return null;
*/
    if ( trace ) console.log( "<-- Database.GetPgnRecord" );
    return record;
} // end function GetPgnRecord

/*************************************************************************************************
 * function GetNumberFromField
 * The number is range checked, and the resolution and offset applied as the number is retrieved
 * from the database.
 * @param pgnData - object, the lowest level in the database, containing the value.
 * @param pgnName - this is required to get the protocol for the message.
 * @param parameterName
 * @return may return a string, a number, or NaN
 *************************************************************************************************/
function GetNumberFromField( pgnData, pgnName, parameterName ){
    const protocol = Protocols[pgnName];
    var timeout = 20*TimeConstants.SECONDS;
    var trace = false; //( pgnName == "127258" );
    if ( trace )
    {
        console.log( "--> Database.GetNumberFromField pgnName = " + pgnName + ", parameterName = " + parameterName );
        console.log( "    protocol = " + JSON.stringify( protocol ));
    }
    const field = protocol.fields[parameterName];
    if ( trace )
        console.log( "    field = " + JSON.stringify( field ));
    if ( protocol.timeout != undefined )
        timeout = protocol.timeout;
    else if ( protocol.defaultUpdateRate != undefined )
        timeout = 6*protocol.defaultUpdateRate;
    var age = (new Date()) - pgnData.timestamp;
    if ( age > timeout )
        return "-";

    /** field value is the string value of the data in the field */
    let fieldValue = pgnData[parameterName];
    if ( fieldValue == undefined )
        return "-";

    if ( trace )
        console.log( "    fieldValue = " + fieldValue );
    let value = parseFloat( fieldValue );
    if ( isNaN( value ))
        return "-";

    // Now do a range check on the value */
    let rangeCheck = RangeCheckers[field.type];
    if ( trace )
        console.log( "    rangeCheck = " + rangeCheck );
    if ( rangeCheck )
    {
        switch ( rangeCheck(value) )
        {
            case RangeCheckEnum.FALSE :
                return "-";
            case RangeCheckEnum.OUT_OF_RANGE :
            case RangeCheckEnum.NOT_AVAILABLE :
            case RangeCheckEnum.RESERVED :
                return NaN;
            case RangeCheckEnum.INFINITE :
                return Number.POSITIVE_INFINITY;
        } // end switch
    }

    // To get here, value must be a well behaved Number, in range
    if ( field.resolution )
    {
        if ( trace )
            console.log( "    field has resolution " + field.resolution );
        value *= field.resolution;
    }
    if ( field.offset )
    {
        if ( trace )
            console.log( "    field has offset " + field.offset );
        value -= field.offset;
    }

    if ( trace )
        console.log( "<-- Database.GetNumberFromField, value = " + value );
    return value;
} // end function GetNumberFromField

/*************************************************************************************************
 * function HandleButtonChange
 *************************************************************************************************
function HandleButtonChange(button) {
    var pgnData = pgns["127501"];
    if ( pgnData )
    {
        var pgnInstance = pgnData[button.props.metadata.instance.toString()];
        if ( pgnInstance )
            pgnInstance["#"+button.props.metadata.channel] = 1-button.props.value;
    }
} // end function HandleButtonChange

/*********************************************************************************************
 * function UpdateSwitchGroups
 *********************************************************************************************/
function UpdateSwitchGroups( GetBreakerFunction ) {
    // console.log( "--> Database.UpdateSwitchGroups" );
    // console.log( "    database = " + typeof( GetBreakerFunction ));
    
    // SwitchGroup.Update(GetBreakerFunction); 
    SwitchGroup.UpdateGroup(GetBreakerFunction);
    // console.log( "<-- Database.UpdateSwitchGroups" );
} // end function UpdateSwitchGroups

/*********************************************************************************************
 * function DegreesOf
 *********************************************************************************************/
function DegreesOf( radians )  {
    return radians*180/Math.PI;
} // end function DegreesOf

/*********************************************************************************************
 * function HHMM
 * Convert minutes into a string HH:MM
 * @param value - in minutes
 *********************************************************************************************/
function HHMM( value ) {
    var minutes = Math.abs( value );
    var hours = Math.floor( minutes/60 );
    minutes = Math.round( minutes - hours*60 );
    var result = "";
    if ( value < 0 )
        result = "-";
    if ( hours < 10 )
        result += "0";
    result += hours + ":";
    if ( minutes < 10 )
        result += "0";
    result += minutes;
    return result;
} // end function HHMM

/*************************************************************************************************/

console.log( "<-- constructing Database" );

module.exports = { 
    PARAMETERS, 
    pgns, 
    GetCarlingACBreakerConfiguration, 
    GetCarlingACBreakerStatus, 
    GetCarlingDCBreakerConfiguration,
    GetCarlingDCBreakerStatus, 
    GetBreaker, 
    GetPgnRecord, 
    GetNumberFromField 
    };

// eof
