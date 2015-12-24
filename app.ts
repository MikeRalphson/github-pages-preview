/// <reference path='typings/tsd.d.ts' />
import Bunyan = require( 'bunyan' );

//  create our log
var log:Bunyan.Logger = Bunyan.createLogger({
    name:'JekyllJS',
    streams:[
        {
            name:'console',
            level:'debug',			// all debug and over to console
            stream:process.stdout
        }
    ]
});
log.info( "JekyllJS starting up on", new Date() );