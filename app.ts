/// <reference path='typings/tsd.d.ts' />
import Bunyan		= require( 'bunyan' );
import FS			= require( 'fs' );
import Path			= require( 'path' );
import RMRF			= require( 'rimraf' );
import YAML			= require( 'js-yaml' );
import ConfigHelper	= require( './src/ConfigHelper' );
import Content		= require( './src/Content' );
import Site			= require( './src/Site' );
import YAMLConfig	= require( './src/YAMLConfig' );
	
/************************************************************/

// declare our vars
var config:ConfigHelper		= null;
var log:Bunyan.Logger 		= null;
var yamlConfig:YAMLConfig	= null;
var site:Site				= null;
	
/************************************************************/

/**
 * Runs our tool, exporting our site
 */
function run():void
{
	_readToolConfig();
	_createLog();
	_readYAMLConfig();
	_createSite();
	
	_readContents( "_posts/", site.posts );
	_readContents( "pages/", site.pages );
	log.info( site.posts.length + " posts and " + site.pages.length + " pages were read. A total of " + Object.keys( site.tags ).length + " tags were found" );
	
	// clear any previous output
	var destDir = Path.join( config.src.path, yamlConfig.destination );
	if( FS.existsSync( destDir ) && FS.statSync( destDir ).isDirectory )
	{
		log.info( "Clearing old destination dir " + destDir );
		RMRF.sync( destDir );
	}
}
run();
	
/************************************************************/

// creates the logger that we're going to use
function _createLog():void
{
	//  create our log
	log = Bunyan.createLogger({
		name:'JekyllJS',
		streams:[
			{
				level:config.log.level,
				stream:process.stdout
			}
		]
	});
	log.info( "JekyllJS starting up on", new Date() );
	log.debug( "Config", config );
}

// reads the tool config
function _readToolConfig():void
{
	config = new ConfigHelper();
	config.parse();
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

// creates our site object
function _createSite():void
{
	site = new Site();
	site.updateFromYAML( yamlConfig );
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
		
		// extract our tags
		_extractTags( content );
		
		ar.push( content );
	});
	
	ar.sort( _sortContent );
}

// extracts the tags for a post/pages
function _extractTags( content:Content ):void
{
	if( content.tags == null || content.tags.length == 0 )
		return;
		
	var len:number = content.tags.length;
	for( var i = 0; i < len; i++ )
	{
		var t:string = content.tags[i];
		if( t in site.tags )
		{
			site.tags[t].push( content );
			site.tags[t].sort( _sortContent );
		}
		else
			site.tags[t] = [content];
	}
}

// the function used for sorting an array of content objects
function _sortContent( a:Content, b:Content ):number
{
	return a.date.getTime() - b.date.getTime();
}