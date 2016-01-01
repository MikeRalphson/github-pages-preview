/// <reference path='typings/tsd.d.ts' />
import Bunyan		= require( 'bunyan' );
import FS			= require( 'fs' );
import Liquid		= require( 'liquid-node' );
import Path			= require( 'path' );
import RMRF			= require( 'rimraf' );
import YAML			= require( 'js-yaml' );
import ConfigHelper	= require( './src/ConfigHelper' );
import Content		= require( './src/Content' );
import Site			= require( './src/Site' );
import YAMLConfig	= require( './src/YAMLConfig' );
	
/************************************************************/

// declare our vars
var liquidEngine:Liquid.Engine			= new Liquid.Engine();
var config:ConfigHelper					= null;
var log:Bunyan.Logger 					= null;
var yamlConfig:YAMLConfig				= null;
var siteObj:{ site:Site }				= null;
var layouts:{ [name:string]:string }	= null;
	
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
	
	log.debug( "Reading content" );
	try 
	{
		layouts = _readLayouts();
		_readContents( "_posts", siteObj.site.posts );
		_readContents( "pages", siteObj.site.pages );
	} 
	catch ( e ) 
	{
		log.error( "Couldn't read content", e );
		process.exit();
		return;
	}
	log.info( Object.keys( layouts ).length + " layouts, " + siteObj.site.posts.length + " posts, and " + siteObj.site.pages.length + " pages were read. A total of " + Object.keys( siteObj.site.tags ).length + " tags were found" );
	
	// clear any previous output
	var destDir = Path.join( config.src.path, yamlConfig.destination );
	if( FS.existsSync( destDir ) && FS.statSync( destDir ).isDirectory )
	{
		log.debug( "Clearing old destination dir " + destDir );
		RMRF.sync( destDir );
	}
	
	// save our pages/posts
	log.debug( "Saving site content" );
	_saveContents( siteObj.site.posts, destDir );
	_saveContents( siteObj.site.pages, destDir );
	
	// copy the rest of the stuff
	log.debug( "Saving other site files" );
	_copyAllOtherFiles( config.src.path );
	
	// finished
	log.info( "JekyllJS build finished!" );
	// process.exit();
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
	siteObj = { site:new Site() };
	siteObj.site.updateFromYAML( yamlConfig );
}

// reads the layouts
function _readLayouts():{ [name:string]:string }
{
	var layouts:{ [name:string]:string } = {};
	
	// read the dir
	var path = Path.join( config.src.path, yamlConfig.layouts_dir );
	FS.readdirSync( path ).forEach( function( filename:string ){
		
		// make sure it's a html file
		if( filename.lastIndexOf( ".html" ) !== ( filename.length - 5 ) )
		{
			log.info( "Ignoring the file '" + filename + "' (" + path + ") in layouts as it's not a HTML file" );
			return;
		}
		
		var contentsRaw:string 	= FS.readFileSync( Path.join( path, filename ), yamlConfig.encoding );
		layouts[filename]		= contentsRaw;
	});
	
	return layouts;
}

// reads the contents of a folder
function _readContents( dir:string, ar:Content[] ):void
{
	var path = Path.join( config.src.path, dir );
	FS.readdirSync( path ).forEach( function( filename:string ){
		
		// make sure it's a html file
		if( filename.lastIndexOf( ".html" ) !== ( filename.length - 5 ) )
		{
			log.info( "Ignoring the file '" + filename + "' (" + path + ") as it's not a HTML file" );
			return;
		}
		
		// create our content object
		var content:Content = _readContent( path, filename );
		
		// extract our tags
		_extractTags( content );
		
		ar.push( content );
	});
	
	ar.sort( _sortContent );
}

// reads a single file, returning a Content object
function _readContent( path:string, filename:string ):Content
{
	var contentsRaw:string 	= FS.readFileSync( Path.join( path, filename ), yamlConfig.encoding );
	var content:Content 	= new Content();
	content.readFromFile( filename, contentsRaw );
	return content;
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
		if( t in siteObj.site.tags )
		{
			siteObj.site.tags[t].push( content );
			siteObj.site.tags[t].sort( _sortContent );
		}
		else
			siteObj.site.tags[t] = [content];
	}
}

// goes through and saves all our content
function _saveContents( contents:Content[], root:string ):void
{
	var len:number = contents.length;
	for( var i:number = 0; i < len; i++ )
	{
		var content:Content = contents[i];
		_ensureDirs( content.url, root );
	}
}

// copies all the other files necessary
function _copyAllOtherFiles( dir:string ):void
{
	FS.readdirSync( dir ).forEach( function( filename:string ){
		
		// get the full path
		var path:string = Path.join( dir, filename );
		
		// ignore hidden files, or files beginning with "_"
		if( /^[_\.]/.test( filename ) )
		{
			// but only if they're not in the config.yml include
			if( yamlConfig.include.indexOf( filename ) == -1 )
			{
				log.debug( "Ignoring " + path + " as it's a hidden file, or a special directory" );
				return;
			}
			log.debug( "Including " + path + " as it's in our YAML include array" );
		}
		
		// if it's in our exclude array, ignore it
		if( yamlConfig.exclude.indexOf( filename ) != -1 )
		{
			log.debug( "Ignoring " + Path.join( dir, filename ) + " as it's in our YAML exclude array" );
			return;
		}
		
		// if it's a directory, recurse
		if( FS.statSync( path ).isDirectory() )
		{
			if( filename == "pages" )
				return; // ignore the pages dir, as we're already treating it
			_copyAllOtherFiles( path );
		}
		else
		{
			// make sure the directories for the file exists
			var destRootDir:string	= Path.join( config.src.path, yamlConfig.destination );
			var destDir:string		= Path.join( destRootDir, Path.relative( config.src.path, dir ) );
			var destPath:string 	= Path.join( destDir, filename );
			_ensureDirs( Path.relative( destRootDir, destDir ), destRootDir );
			
			// read the file
			var content:Content = _readContent( dir, filename );
			if( content.frontMatter )
			{
				// TODO: deal with liquid
				// NOTE: need to register filters (xml_escape etc)
				// NOTE: doesn't seem to handle includes? BlankFileSystem
				// NOTE: as this uses promises, we also need to wrap the call so we don't kill the process too early
				liquidEngine.parseAndRender( content.content, siteObj ).then( function ( result ){
					
					log.info( "In then for " + filename)
				}).catch( function( c ){
					log.error( "Catch for " + filename, c );
				})
			}
			else
				_copyFile( path, destPath );
		}
	});	
}

// copies a file from one path to another
function _copyFile( inPath:string, outPath:string ):void
{
	var buffer:Buffer 	= new Buffer( 65536 ); // short max size
	var pos:number		= 0;
	var inFile:number	= FS.openSync( inPath, "r" );
	var outFile:number	= FS.openSync( outPath, "w" );
	do
	{
		var read:number = FS.readSync( inFile, buffer, 0, buffer.length, pos );
		FS.writeSync( outFile, buffer, 0, read, pos );
		pos += read;
	}
	while( read > 0 );
	FS.closeSync( inFile );
	FS.closeSync( outFile );
}

// makes sure that all the directories for a particular path exist
function _ensureDirs( path:string, root:string ):void
{
	var curr:string		= root + Path.sep;
	var parts:string[] 	= ( path.indexOf( "/" ) != -1 ) ? path.split( "/" ) : path.split( Path.sep ); // as path might be a url, we check for forward slashes
	var len:number		= parts.length;
	for( var i = 0; i < len; i++ )
	{
		curr 	+= parts[i] + Path.sep;
		curr	= Path.normalize( curr );
		if( !FS.existsSync( curr ) )
			FS.mkdirSync( curr );
	}
}

// the function used for sorting an array of content objects
function _sortContent( a:Content, b:Content ):number
{
	return a.date.getTime() - b.date.getTime();
}