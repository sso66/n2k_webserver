// File: server/server.js
// Note: NMEA 2000 Web Server for web application and system services
// Date: 04/20/2020
//..............................................................................
console.log( "--> constructing server" );

const dgram                         = require('dgram');
const fs                            = require('fs');
const http                          = require('http');
const ip                            = require('ip');
const net                           = require('net');
const path                          = require('path');
const webSocketServer               = require('websocket').server;

const ByteArray                     = require( './ByteArray' ).ByteArray;
const {
        ReadConfigurationFile,
        ReadConfigurationNames }    = require( './Configuration' );
const Database                      = require( './Database' );
const PARAMETERS                    = require( './Database').PARAMETERS;
const FileEntry                     = require( './FileEntry' );
const Globals                       = require( './Globals' );
const TimeConstants                 = require( './TimeConstants' );
const ServerManager                 = require( './ServerManager' );

// ___ devices package modules __
const Bus                           = require( './devices/Bus' );
const Device                        = require( './devices/Device' );

// ___ pgns package modules ___
const Protocols                     = require( './pgns/Protocols' ).Protocols;
const CarlingRequestPGN             = require( './pgns/CarlingRequestPGN' );
const NMEACommandPGN                = require( './pgns/NMEACommandPGN' );

// ___ switchGroups package modules ___
const SwitchGroup                   = require( './switchGroup/SwitchGroup' );

// ___ common messaging package modules ___
const Controls                      = require( '../src/common/Controls' );
const MessageTypes                  = require( '../src/common/MessageTypes' ).MessageTypes;
const SwitchActions                 = require( '../src/common/SwitchActions' ).SwitchActions;

// Create the http server and the websocket server
const server = http.createServer();
const wsServer = new webSocketServer({ httpServer: server });

// Create the tcp socket server to listen for configurations from N2KView
const n2kViewServer = net.createServer();

// Generates unique ID for every new connection (connected clients)
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

// We're maintaining all active connections in this object
const clients = {};

var updateTimer     = setInterval( SendUpdates, 80, this );
var updateDataTimer = setInterval( UpdatePGNs, 100, this );
var idTimer         = setInterval( SendId, 30*TimeConstants.SECONDS, this );

// TODO: These will need to be moved to inside the clients array.
var breakerRequestTimer = setInterval( RequestBreakerDetails, 5*TimeConstants.SECONDS, this );
var breakerRequestDetails;

/*********************************************************************************************
 * function SendId
 * This establishes and send broadcast UDP messages every 60 seconds advertising to...
 *********************************************************************************************/
function SendId() {
    const PORT = 65401;
    const myIpAddress = ip.address();
    const message = Buffer.from( "webserver, Web Server, Serial, HW Model, " + myIpAddress );
    const client = dgram.createSocket('udp4');

    client.bind( function() {
            client.setBroadcast(true);
        });

    client.send( message, PORT, '255.255.255.255', (err) => {
            console.log( "Sent Id UDP Message: '" + message + "'" );
            client.close();
        });
        
    console.log( "    UDP host start broadcasting messages...on port " + PORT );
        
} // end function SendId

/*********************************************************************************************
 * function SendUpdates
 *********************************************************************************************/
function SendUpdates() {
    for (var client in clients)
    {
        SendUpdate(clients[client]);
    }
} // end function SendUpdates

/*********************************************************************************************
 * function RequestBreakerDetails
 * This function requests the breaker status and breaker configuration from the NMEA 2000 bus.
 * It also transmits the breaker status to the client.
 *********************************************************************************************/
function RequestBreakerDetails() {
    if ( breakerRequestDetails )
    {
        // console.log( "--> server.RequestBreakerDetails" );
        RequestCarlingBreakerStatus( breakerRequestDetails.instance, breakerRequestDetails.channel );
        RequestCarlingBreakerConfiguration( breakerRequestDetails.instance, breakerRequestDetails.channel );
        SendBreakerDetails( breakerRequestDetails.client, breakerRequestDetails.instance, breakerRequestDetails.channel );
        // console.log( "<-- server.RequestBreakerDetails" );
    }
} // end function RequestBreakerDetails

/*****************************************************************************************
 * function RequestCarlingBreakerStatus
 *****************************************************************************************/
function RequestCarlingBreakerStatus( instance, channel ) {
    var device;
    var gen1BreakerStatusPGN = Database.GetPgnRecord( "130921_MT2", instance, channel );
    var gen2BreakerStatusPGN = Database.GetPgnRecord( "65300_MT66", instance, channel );
    var binarySwitchBankStatusPGN = Database.GetPgnRecord( "127501", instance );
    
    // console.log( "\n--> server.RequestCarlingBreakerStatus" );
    // console.log( "    instance = " + instance + ", channel = " + channel );
    // console.log( "    gen1BreakerStatusPGN =  " + JSON.stringify( gen1BreakerStatusPGN ));
    // console.log( "    gen2BreakerStatusPGN =  " + JSON.stringify( gen2BreakerStatusPGN ));
    // console.log( "    binarySwitchBankStatusPGN =  " + JSON.stringify( binarySwitchBankStatusPGN ));
    
    if ( gen1BreakerStatusPGN )
    {
        // We have a Gen 1 AC Breaker Status Message or DC Breaker Status Message
        device = gen1BreakerStatusPGN.device;
        // Send this twice - we have no way of knowing if this is an old Moritz box with the wrong GROUP and MANUF ID
        // or the new Carling version. It also seems that you can't use the values from the breakerStatusMsg
        var carlingRequest1 = new CarlingRequestPGN.CarlingRequestPGN( Device.CARLING_ALT_GROUP,
            Device.CARLING_ALT,
            CarlingRequestPGN.BREAKER_STATUS,
            channel );
        Globals.TransmissionController.Send( carlingRequest1, device );
        
        var carlingRequest2 = new CarlingRequestPGN.CarlingRequestPGN( Device.MARINE,
            Device.CARLING,
            CarlingRequestPGN.BREAKER_STATUS,
            channel );
        Globals.TransmissionController.Send( carlingRequest2, device );
    }
    else if ( gen2BreakerStatusPGN )
    {
        // We have a Gen 2 AC Breaker Status Message
        device = gen2BreakerStatusPGN.device;
        var carlingRequest3 = new CarlingRequestPGN.CarlingRequestPGN( Device.MARINE,
            Device.CARLING,
            CarlingRequestPGN.AC_GENII_BREAKER_STATUS,
            channel );
        Globals.TransmissionController.Send( carlingRequest3, device );
    }
    else if ( binarySwitchBankStatusPGN )
    {
        // We have neither, so request both getting data from PGN 127501
        device = binarySwitchBankStatusPGN.device;
        // Send this twice - we have no way of knowing if this is an old Moritz box with the wrong GROUP and MANUF ID
        // or the new Carling version. It also seems that you can't use the values from the breakerStatusMsg
        var statusRequestMessageType = CarlingRequestPGN.BREAKER_STATUS;
        if ( device.IsCarlingGen2ACSwitchBox() )
            statusRequestMessageType = CarlingRequestPGN.AC_GENII_BREAKER_STATUS;
            
        var carlingRequest4 = new CarlingRequestPGN.CarlingRequestPGN( Device.CARLING_ALT_GROUP,
            Device.CARLING_ALT,
            statusRequestMessageType,
            channel );
        Globals.TransmissionController.Send( carlingRequest4, device );
        
        var carlingRequest5 = new CarlingRequestPGN.CarlingRequestPGN( Device.MARINE,
            Device.CARLING,
            statusRequestMessageType,
            channel );
        Globals.TransmissionController.Send( carlingRequest5, device );
    }   
    // console.log( "<-- server.RequestCarlingBreakerStatus" );
} // end function RequestCarlingBreakerStatus

/*****************************************************************************************
 * function RequestCarlingBreakerConfiguration
 * Note that we use the reception of the Breaker Status message to identify the device 
 * from which we need to request the Configuration, otherwise we cannot request a 
 * Configuration Message until we get one.
 *****************************************************************************************/
function RequestCarlingBreakerConfiguration( instance, channel ) {
    // console.log( "--> server.RequestCarlingBreakerConfiguration" );
    var device;
    var breakerStatusPGN = Database.GetPgnRecord( "130921_MT2", instance, channel );
    if ( breakerStatusPGN )
    {
        device = breakerStatusPGN.device;
        // Send this twice - we have no way of knowing if this is an old Moritz box with the wrong GROUP and MANUF ID
        // or the new Carling version. It also seems that you can't use the values from the breakerStatusMsg
        var carlingRequest1 = new CarlingRequestPGN.CarlingRequestPGN( Device.CARLING_ALT_GROUP,
            Device.CARLING_ALT,
            CarlingRequestPGN.BREAKER_CONFIGURATION,
            channel );
        Globals.TransmissionController.Send( carlingRequest1, device );
        var carlingRequest2 = new CarlingRequestPGN.CarlingRequestPGN( Device.MARINE,
            Device.CARLING,
            CarlingRequestPGN.BREAKER_CONFIGURATION,
            channel );
        Globals.TransmissionController.Send( carlingRequest2, device );
    }
    // Now see if we are getting the Gen2 AC Breaker Status Message
    breakerStatusPGN = Database.GetPgnRecord( "65300_MT66", instance, channel );
    if ( breakerStatusPGN )
    {
        // console.log( "    Gen 2 ACBreaker Status found" );
        device = breakerStatusPGN.device;
        var carlingRequest3 = new CarlingRequestPGN.CarlingRequestPGN( 
            Device.IndustryEnum.MARINE,         // Industry Group
            Device.ManufacturerEnum.CARLING,    // Manufacturer Code
            CarlingRequestPGN.AC_GENII_BREAKER_CONFIGURATION,
            channel );
        Globals.TransmissionController.Send( carlingRequest3, device );
    }
    // console.log( "<-- server.RequestCarlingBreakerConfiguration" );
} // end function RequestCarlingBreakerConfiguration

/*********************************************************************************************
 * function SendUpdate
 *********************************************************************************************/
function SendUpdate( client ) {
    var updates = [];
    if ( client.configuration )
    {
        var page = client.configuration.pages[client.screen];
        if ( !page )
        {
            client.screen = 0;
            page = client.configuration.pages[0];
        }
        for ( var c=0; c<page.controls.length; c++ )
        {
            var control = page.controls[c];
			if ( control.parameter !== undefined )
			{
                var parameter = PARAMETERS[control.parameter];
                if ( parameter )
                {
                    var data = parameter.getter(control,parameter.pgnName,parameter.field,parameter.unitsFunction);
                    if ( data && data.device )
                    {
                        // console.log( "server.SendUpdate device = " + JSON.stringify( data.device ));
                        data.isCarlingACBreaker = data.device.IsCarlingACSwitchBox();
                        data.isCarlingDCBreaker = data.device.IsCarlingDCSwitchBox();
                    }
                    updates.push( { index   : c,
                                    data    : data
                                  } 
                                );
				} // end if parameter
            }
        } // end for loop
    }
    const json = { type : MessageTypes.VALUES, updates : updates };
    // console.log("\n   ##########\n" + JSON.stringify(json));
    client.connection.sendUTF(JSON.stringify(json));
} // end function SendUpdate

/*********************************************************************************************
 * function SendScreenLayout
 *********************************************************************************************/
function SendScreenLayout( client ) {
    // console.log( "     type = " + JSON.stringify(MessageTypes.SCREEN_LAYOUT) + ", MessageTypes = " + JSON.stringify( MessageTypes ));
    var screenNo = client.screen;
    if ( screenNo >= client.configuration.pages.length )
        screenNo = 0;
    
    var controls            = client.configuration.pages[screenNo].controls;
    var hasLockableBreakers = controls.some( control => Controls.IsLockable( control.control ));
    var hasBreakerDetails   = controls.some( control => Controls.HasBreakerDetails( control.control ));
    
    const json = {
        type : MessageTypes.SCREEN_LAYOUT,
        width : client.configuration.pages[screenNo].width,
        height : client.configuration.pages[screenNo].height,
        configurationName : client.configuration.configurationName,
        backgroundColor : client.configuration.pages[screenNo].backgroundColor,
        backgroundImage : client.configuration.pages[screenNo].backgroundImage,
        hasLockableBreakers : hasLockableBreakers,
        hasBreakerDetails : hasBreakerDetails,
        controls : controls };
    client.connection.sendUTF(JSON.stringify(json));
} // end function SendScreenLayout

/*********************************************************************************************
 * function SendConfigurationNames
 *********************************************************************************************/
function SendConfigurationNames(client) {
    console.log( "--> server.SendConfigurationNames" );
    const json = {
        type : MessageTypes.CONFIGURATION_NAMES,
        configurationNames : ReadConfigurationNames()
    };
    client.connection.sendUTF(JSON.stringify(json));
    console.log( "<-- server.SendConfigurationNames, " + JSON.stringify(json));
} // end function SendConfigurationNames

/*********************************************************************************************
 * function SendBreakerDetails
 * Send the Breaker Details to the client.
 *********************************************************************************************/
function SendBreakerDetails( client, instance, channel ) {
    var breakerState = Database.GetBreaker( { instance : instance, channel : channel } );
    if ( breakerState.device )
    {
        if ( breakerState.device.IsCarlingACSwitchBox() )
        {
            var ACBreakerConfiguration = Database.GetCarlingACBreakerConfiguration( { instance : instance, channel : channel } );
            var ACBreakerStatus = Database.GetCarlingACBreakerStatus( { instance : instance, channel : channel } );
            // If the Load Controller message is present, the values in it's status must take
            // priority over status bits in the Proprietary Carling PGNs
            var loadControllerPGN = Database.GetPgnRecord( "127500", instance, channel );
            if ( loadControllerPGN )
            {
                let connectionStatus = Database.GetNumberFromField( loadControllerPGN, "127500", "Connection Status" );
                ACBreakerStatus.overcurrentTrip = (connectionStatus&0x0100) == 0x0100;
                ACBreakerStatus.GFCITrip        = (connectionStatus&0x0040) == 0x0040;
                ACBreakerStatus.GFCIEndOfLife   = (connectionStatus&0x0800) == 0x0800;
            }
            const json = {
                type            : MessageTypes.BREAKER_DETAILS,
                instance        : instance,
                channel         : channel,
                breakerState    : breakerState,
                breakerConfiguration : ACBreakerConfiguration,
                breakerStatus   : ACBreakerStatus
            };
            client.connection.sendUTF(JSON.stringify(json));
        }
        else if ( breakerState.device.IsCarlingDCSwitchBox() )
        {
            var DCBreakerConfiguration = Database.GetCarlingDCBreakerConfiguration( { instance : instance, channel : channel } );
            var DCBreakerStatus = Database.GetCarlingDCBreakerStatus( { instance : instance, channel : channel } );
            // If the Load Controller message is present, the values in it's status must take
            // priority over status bits in the Proprietary Carling PGNs
            var loadControllerPGN = Database.GetPgnRecord( "127500", instance, channel );
            if ( loadControllerPGN )
            {
                let connectionStatus = Database.GetNumberFromField( loadControllerPGN, "127500", "Connection Status" );
                DCBreakerStatus.overcurrentTrip = (connectionStatus&0x0100) == 0x0100;
                DCBreakerStatus.GFCITrip        = (connectionStatus&0x0040) == 0x0040;
                DCBreakerStatus.GFCIEndOfLife   = (connectionStatus&0x0800) == 0x0800;
            }
            const json = {
                type            : MessageTypes.BREAKER_DETAILS,
                instance        : instance,
                channel         : channel,
                breakerState    : breakerState,
                breakerConfiguration : DCBreakerConfiguration,
                breakerStatus   : DCBreakerStatus
            };
            client.connection.sendUTF(JSON.stringify(json));
        }
    }
} // end SendBreakerDetails 

/*********************************************************************************************
 * function UpdatePGNs
 * This code generates some test data
 *********************************************************************************************/
let data = [ { pgn : "127751", instance : 100, field : "DC Voltage", delta : 0.2, min : 6, max : 18 },
             { pgn : "127751", instance : 100, field : "DC Current", delta : 0.5, min : 2, max : 9 },
             { pgn : "127488", instance : 100, field : "Engine Speed", delta : 60,  min : 0, max : 5000 },
           ];

function UpdatePGNs()
{
    for ( var c=0; c<data.length; c++ )
    {
        var pgnData = Database.pgns[data[c].pgn];
        if ( pgnData )
        {
            var pgnInstance = pgnData[data[c].instance];
            if ( pgnInstance )
            {
                if ( data[c].delta )
                {
                    var value = pgnInstance[data[c].field];
                    // get the metadata for the field to see if we need to apply a resolution
                    let field = Protocols[data[c].pgn].fields[data[c].field];
                    if ( field.resolution )
                        value *= field.resolution;

                    value += data[c].delta;
                    if ( value > data[c].max )
                    {
                        value = data[c].max;
                        data[c].delta = -data[c].delta;
                    }
                    else if ( value < data[c].min )
                    {
                        value = data[c].min;
                        data[c].delta = -data[c].delta;
                    }

                    if ( field.resolution )
                        value /= field.resolution;
                    value = Math.round( value );

                    // Save the modified value back in the pgn database
                    pgnInstance[data[c].field] = value;
                }
                pgnInstance.timestamp = new Date();
            } // end if ( pgnInstance )
        } // end if ( pgnData )
    } // end for loop
} // end UpdatePGNs

/*********************************************************************************************
 * function OriginIsAllowed
 * To detect whether the specified origin is allowed
 *********************************************************************************************/
function OriginIsAllowed(origin){
    // put logic here...
    console.log("origin: "+ origin);
    return true;
} // end OriginIsAllowed

/*********************************************************************************************/

//___ Applied event handlers for TCP socket communciations ___
n2kViewServer.on('connection', function(socket) {
    console.log((new Date()) + ' Received a new N2KView connection' + ' from ' + socket.localAddress + '.');
    // socket.setEncoding( 'utf8' );

	var partialReceivedMessage = new ByteArray();
    var configurationName;
    var n2kViewFileReceived;

    // on 'data' event from N2KView, message is a Buffer module
    socket.on('data', function(message) {
        console.log( "Received message from N2KView" );
        partialReceivedMessage.WriteBytes( message );

        while ( partialReceivedMessage.bytesAvailable >= 2 )
        {
            let parts = partialReceivedMessage.ReadUTF().split("=");
            // console.log( "    received " + parts[0] + ", data length = " + parts[1].length );
            switch ( parts[0].toUpperCase() )
            {
                case "NAME" :
                    console.log( "    Receiving Configuration '" + parts[1] + "'" );
                    configurationName = parts[1];

                    var directory = path.resolve(__dirname,"..","public/" + configurationName );
                    if ( !fs.existsSync( directory ) )
                        fs.mkdirSync(directory);
                    console.log( "    Created directory = " + directory );
                    break;

                case "FILENAME" :
                    console.log( "    Receiving File '" + parts[1] + "'" );
                    n2kViewFileReceived = new FileEntry.FileEntry( parts[1], "", NaN );
                    break;

                case "FILE" :
                    console.log( "    File Part is " + parts[1].length + " bytes" );
                    n2kViewFileReceived.mContents = parts[1];
                    break;

                case "FILECONT" :
                    console.log( "    File part is " + parts[1].length + " bytes." );
                    n2kViewFileReceived.mContents += parts[1];
                    break;

                case "FILEEND" :
                    console.log( "    Completed File '" + parts[1] + "'" );
                    var file = path.resolve( __dirname,"..","public/" + configurationName + "/" + parts[1] );
                    fs.writeFileSync( file, n2kViewFileReceived.mContents );
            } // end switch
            console.log( "  partialReceivedMessage.bytesAvailable = " + partialReceivedMessage.bytesAvailable );
        } // end loop
        partialReceivedMessage.Truncate();
    }); // end on data handler

    // tcp socket client disconnected
    socket.on('close', function(error) {
        console.log((new Date()) + " N2KView Connection disconnected.");
    }); // end on close handler

    socket.on('error',function(error) {
        console.log('Error : ' + error);
    }); // end on error handler
}); // end n2kviewServer on connection

// Emitted when tcp socket server closes ...not emitted until all connections closes.
n2kViewServer.on('close',function(){
  console.log('Server closed !');
}); // end n2kviewServer on close

//___ Applied event handlers for websocket communciations ___
wsServer.on('request', function(request) {
    var userID = getUniqueID();
    console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.');
    // You can rewrite this part of the code to accept only the requests from allowed origin
    if (!OriginIsAllowed(request.origin)) {
        // Make sure we only accept requests form an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.orgin + ' is rejected.');
        return;
    }
    const connection = request.accept(null, request.origin);
    console.log( userID + ' connected to server.' );
    var configuration = ReadConfigurationFile("default");
    var currentScreenNo = Math.floor(Math.random()*configuration.pages.length);
    clients[userID] = {
        id:userID,
        screen:currentScreenNo,
        noOfScreens:configuration.pages.length,
        connection:connection,
        configuration:configuration
    };
    SendScreenLayout(clients[userID]);
    SendConfigurationNames(clients[userID]);
    // on 'message' event from websocket client
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            try {
                // console.log( "--> Server.wsServer.on received " + message.utf8Data );
                const dataFromClient = JSON.parse(message.utf8Data);
                switch (dataFromClient.type )
                {
                    case MessageTypes.BREAKER_DETAILS_REQUEST :
                        console.log( "Request Breaker Details, instance " + dataFromClient.instance + ", channel " + dataFromClient.channel );
                        if ( dataFromClient.instance && dataFromClient.channel )
                        {
                            SendBreakerDetails( clients[userID], dataFromClient.instance, dataFromClient.channel );
                            breakerRequestDetails = { client : clients[userID], instance : dataFromClient.instance, channel : dataFromClient.channel };
                        }
                        else
                            breakerRequestDetails = null;
                        break;
                    case MessageTypes.SWITCH_LOCK :
                        LockSwitch( dataFromClient.instance,dataFromClient.channel,"lock" );
                        break;
                    case MessageTypes.SWITCH_PRESS :
                        CommandSwitch( dataFromClient.instance,dataFromClient.channel,dataFromClient.action );
                        break;
                    case MessageTypes.SWITCH_UNLOCK :
                        LockSwitch( dataFromClient.instance,dataFromClient.channel,"unlock" );
                        break;
                    case MessageTypes.SCREEN_SELECT :
                        console.log( "Screen Select, direction = " + dataFromClient.direction + ", screenName = " + dataFromClient.screenName );
                        if ( dataFromClient.direction === "next" )
                        {
                            clients[userID].screen++;
                            if ( clients[userID].screen >= clients[userID].noOfScreens )
                                clients[userID].screen = 0;
                        }
                        else if ( dataFromClient.direction === "prev" )
                        {
                            clients[userID].screen--;
                            if ( clients[userID].screen < 0 )
                                clients[userID].screen = clients[userID].noOfScreens-1;
                        }
                        else
                        {
                            let pages = clients[userID].configuration.pages;
                            for ( let i=0; i<pages.length; i++)
                            {
                                if ( pages[i].name.localeCompare( dataFromClient.screenName ) === 0 )
                                {
                                    clients[userID].screen = i;
                                    break;
                                }
                            } // end for loop
                        }
                        SendScreenLayout( clients[userID] );
                        break;
                    case MessageTypes.CONFIGURATION_SELECT :
                        console.log( "Select Configuration " + dataFromClient.configurationName );
                        clients[userID].configuration = ReadConfigurationFile(dataFromClient.configurationName);
                        SendScreenLayout( clients[userID] );
                        SendConfigurationNames(clients[userID]);
                        break;
                } // end switch
                // console.log( "<-- Server.wsServer.on" );
            }
            catch(error) {
                console.error( error );
            }
        } // end if ( type == 'utf8' )
    });

    // websocket client disconnected
    connection.on('close', function(connection) {
        console.log((new Date()) + " Peer " + userID + " disconnected.");
        delete clients[userID];
    });
});

/*************************************************************************************************
 * function CommandSwitch
 * Command a Breaker or Switch Group to a known state, or toggle the existing state.
 *************************************************************************************************/
function CommandSwitch( instance, channel, action ) {
    console.log( "--> Server.CommandSwitch, instance = " + instance + ", channel = " + channel + ", action = " + action );
    if ( instance === SwitchGroup.SWITCH_GROUP_INSTANCE )
    {
        let switchGroup = SwitchGroup.GetGroup( channel );
        if ( switchGroup )
        {
            console.log( "    found switch group" );
            switch ( action )
            {
                case SwitchActions.TURN_OFF :
                    newState = 0;
                    break;
                case SwitchActions.TURN_ON :
                case SwitchActions.TOGGLE :
                    newState = 1;
                    break;
            }
        switchGroup.SetSwitch( newState, CommandSwitch );
        }
    }
    else
    {
        // CommandBreaker( instance, channel, action );

        var pgnData = Database.pgns["127501"];
        if ( pgnData )
        {
            var pgnInstance = pgnData[instance];
            if ( pgnInstance )
            {
                var channelName = "#"+(channel);
                var newState;
                var currentValue = pgnInstance[channelName];
                switch ( action )
                {
                    case SwitchActions.TURN_OFF :
                        newState = 0;
                        break;
                    case SwitchActions.TURN_ON :
                        newState = 1;
                        break;
                    case SwitchActions.TOGGLE :
                        if ( currentValue == 1 || currentValue == 2 )
                            newState = 0;
                        else
                            newState = 1;
                        break;
                }
                var address = pgnInstance.msg.mSourceAddress;
                console.log( "    CommandSwitch, address = " + address
                    + ", channel = " + channel
                    + ", action = " + action
                    + ", newState = " + newState );
                var device      = Device.GetDeviceForAddress(address,Bus.BusEnum.PRIMARY);
                var switchCommand = new NMEACommandPGN.NMEACommandPGN( 127501 );
                switchCommand.SetFieldValuePair( 1, instance );
                switchCommand.SetFieldValuePair( channel+1, newState );
                ServerManager.Send( switchCommand, device );
                setTimeout( VerifySwitch, 500, {device:device,instance:instance,channel:channel,newState:newState} );
            }
        }

    }
    console.log( "<-- Server.CommandSwitch" );
} // end function CommandSwitch

/*************************************************************************************************
 * function VerifySwitch
 *************************************************************************************************/
function VerifySwitch( metadata ) {
    var pgnData = Database.pgns["127501"];
    if ( pgnData )
    {
        var pgnInstance = pgnData[metadata.instance];
        if ( pgnInstance )
        {
            var channelName = "#"+(metadata.channel);
            var currentValue = pgnInstance[channelName];
            if ( currentValue !== metadata.newState )
            {
                console.log( "Server.js VerifySwitch - Value did not change, issuing command again" );
                var switchCommand = new NMEACommandPGN.NMEACommandPGN( 127501 );
                switchCommand.SetFieldValuePair( 1, metadata.instance );
                switchCommand.SetFieldValuePair( metadata.channel+1, metadata.newState);
                ServerManager.Send( switchCommand, metadata.device );
            }
        }
    }
} // end function VerifySwitch

/*************************************************************************************************
 * function LockSwitch
 * @param action - string = [ 'lock' | 'unlock' ]
 *************************************************************************************************/
function LockSwitch( instance, channel, action ) {
    console.log( "--> Server.LockSwitch, instance = " + instance + ", channel = " + channel + ", action = " + action );
    if ( instance !== SwitchGroup.SWITCH_GROUP_INSTANCE )
    {
        var pgn127500 = Database.GetPgnRecord( "127500", instance, channel-1 );
        if ( pgn127500 )
        {
            var address = pgn127500.msg.mSourceAddress;
            console.log( "    LockSwitch, address = " + address
                + ", channel = " + channel
                + ", action = " + action );
            var device      = Device.GetDeviceForAddress(address,Bus.BusEnum.PRIMARY);
            var lockCommand = new NMEACommandPGN.NMEACommandPGN( 127500 );
            lockCommand.SetFieldValuePair( 2, channel-1 );
            if ( action == "lock" )
                lockCommand.SetFieldValuePair( 5, 1 );
            else if ( action == "unlock" )
                lockCommand.SetFieldValuePair( 5, 0 );
            ServerManager.Send( lockCommand, device );
        }
    }
    console.log( "<-- Server.LockSwitch" );
} // end function LockSwitch

/*************************************************************************************************/

// Complete start up for all networking services
const webSocketsServerPort = 8000;
server.listen(webSocketsServerPort);

// Start listening for N2KView requests
const n2kViewServerPort = 65402;
n2kViewServer.listen(n2kViewServerPort);
console.log( "    TCP Socket Server waiting on port " + n2kViewServerPort );

// Establish UDP host-to-host communications
SendId();

console.log( "    Websocket Server waiting on port " + webSocketsServerPort );
console.log( "<-- constructing server" );


// eof
