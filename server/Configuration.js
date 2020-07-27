// File: server/Configuration.js
// Note: NMEA 2000 Metadata Configuration Utility
// Date: 04/15/2020
//..............................................................................
console.log( "Mounting Configuration.js..." );

const path        = require('path');
const fs          = require('fs');

// ___ switchGroups package modules ___
const SwitchGroup = require( './switchGroup/SwitchGroup' );

/*********************************************************************************************
 * function ReadConfigurationNames
 *********************************************************************************************/
function ReadConfigurationNames() {
    console.log( "--> Configuration.readConfigurationNames" );

    var directory = path.resolve(__dirname,"..","public");
    console.log( "    Directory = " + directory );
    var names = fs.readdirSync(directory, {withFileTypes:true} )
        .filter( dirent => dirent.isDirectory() )
        .filter( dirent => dirent.name.localeCompare( "assets" ) != 0 )
        .map( dirent => dirent.name );
    console.log( "<-- Configuration.readConfigurationNames, names = [" + names + "]" );
    return names;
} // end function ReadConfigurationNames

/*********************************************************************************************
 * function ReadConfigurationFile
 *********************************************************************************************/
function ReadConfigurationFile( configurationName ) {
    console.log( "--> Configuration.readConfigurationFile" );

    var directory = path.resolve(__dirname,"..","public",configurationName);
    console.log("Configuration directory: " + directory)

    var filename = path.resolve(__dirname,"..",directory,configurationName+".json");
    console.log( "    filename = " + filename );

    var data=fs.readFileSync(filename,'utf8');
    var config = JSON.parse(data);;
    config.configurationName = configurationName;

    // This code is wrong. --> can we factor out with SwitchConfiguration.js???
    // The SwitchGroup must either belong to the configuration, in which case different configurations will
    // have their own definition of SwitchGroups,
    // or the definition must be placed in a different file.
    SwitchGroup.Clear();
    if ( config.switchGroups )
        SwitchGroup.PopulateFromJSON( config.switchGroups );
    console.log( "<-- Configuration.readConfigurationFile, configurationName = " + config.configurationName );
    return config;
} // end function ReadConfigurationFile

/*********************************************************************************************/

module.exports = { ReadConfigurationFile, ReadConfigurationNames };

// eof
