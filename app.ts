/// <reference path='typings/tsd.d.ts' />
import Bunyan		= require( 'bunyan' );
import FS			= require( 'fs' );
import Path			= require( 'path' );
import RMRF			= require( 'rimraf' );
import YAML			= require( 'js-yaml' );
import ConfigHelper	= require( './src/ConfigHelper' );
import Content		= require( './src/Content' );
import YAMLConfig	= require( './src/YAMLConfig' );

// declare our vars
var log:Bunyan.Logger 		= null;
var config:ConfigHelper		= null;
var yamlConfig:YAMLConfig	= null;
var posts:Content[]			= [];
var pages:Content[]			= [];

function start():void
{
	_createLog();
	_readToolConfig();
	_readYAMLConfig();
	
	_readContents( "_posts/", posts );
	_readContents( "pages/", pages );
	log.info( posts.length + " posts and " + pages.length + " pages were read" );
}
start();

// creates the logger that we're going to use
function _createLog():void
{
	//  create our log
	log = Bunyan.createLogger({
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
}

// reads the tool config
function _readToolConfig():void
{
	config = new ConfigHelper();
	config.parse();
	log.debug( "Config src", config.src );
}

// reads the yaml config of our site
function _readYAMLConfig():void
{
	var path = Path.join( config.src.path, "_config.yml" );
	log.debug( "Reading yaml config from " + path );
	var yaml = ( FS.existsSync( path ) && YAML.load( FS.readFileSync( path, "utf-8" ) ) ) || {};
	
	// create our objectc
	yamlConfig = new YAMLConfig();
	yamlConfig.fromObj( yaml );
	log.debug( "YAML config:", yamlConfig );
}

// reads the contents of a folder
function _readContents( dir:string, ar:Content[] ):void
{
	var path = Path.join( config.src.path + dir );
	FS.readdirSync( path ).forEach( function( filename ){
		
		// make sure it's a html file
		if( filename.lastIndexOf( ".html" ) !== ( filename.length - 5 ) )
		{
			log.info( "Ignoring the file '" + filename + "' as it's not a HTML file" );
			return;
		}
		
		// create our content object
		var contentsRaw:string 	= FS.readFileSync( Path.join( path, filename ), "utf-8" );
		var content:Content 	= new Content();
		content.readFromFile( filename, contentsRaw );
		
		ar.push( content );
	});
	
	ar.sort( function( a:Content, b:Content ){
		return a.date - b.date;
	});
}