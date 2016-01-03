/// <reference path='typings/tsd.d.ts' />
require('es6-promise').polyfill(); // auto-polyfill entire Node environment for Promise

import Bunyan			= require( 'bunyan' );
import DateFormat		= require( 'dateformat' );
import FS				= require( 'fs' );
import Liquid			= require( 'liquid-node' );
import Path				= require( 'path' );
import RMRF				= require( 'rimraf' );
import RSVP				= require( 'es6-promise' );
import YAML				= require( 'js-yaml' );
import ConfigHelper		= require( './src/ConfigHelper' );
import Content			= require( './src/Content' );
import LiquidHighlight	= require( './src/LiquidHighlight' );
import Site				= require( './src/Site' );
import YAMLConfig		= require( './src/YAMLConfig' );
var Promise				= RSVP.Promise;
	
/************************************************************/

// declare our vars
var liquidEngine:Liquid.Engine			= null;
var config:ConfigHelper					= null;
var log:Bunyan.Logger 					= null;
var yamlConfig:YAMLConfig				= null;
var siteObj:{ site:Site }				= null;
var layouts:{ [name:string]:string }	= null;
var numContentToConvert:number			= 0;
	
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
	_createLiquidEngine();
	
	// load our pages etc
	log.debug( "Reading content" );
	layouts = _readLayouts();
	_readContents( "_posts", siteObj.site.posts );
	_readContents( "pages", siteObj.site.pages );
	log.info( Object.keys( layouts ).length + " layouts, " + siteObj.site.posts.length + " posts, and " + siteObj.site.pages.length + " pages were read. A total of " + Object.keys( siteObj.site.tags ).length + " tags were found" );
	
	// convert our content
	log.debug( "Parsing liquid tags in our content" );
	_convertContents().then( function(){ // technically this returns a Content object, but we don't care
	
		// if numContentToConvert isn't 0, then some of our files didn't convert
		if( numContentToConvert > 0 )
		{
			log.error( numContentToConvert + " file(s) didn't properly parse - aborting" );
			process.exit();
			return;
		}
		
		// clear any previous output
		var destDir = Path.join( config.src.path, yamlConfig.destination );
		_rmrfDir( destDir );
		
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
	}).catch( function( e ){
		log.error( "Error in run:" + typeof( e ), e)
	})
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
	var yaml = {};
	if( FS.existsSync( path ) )
		yaml = YAML.load( FS.readFileSync( path, "utf-8" ) );
	else
		log.warn( "The YAML config file (" + path + ") doesn't exist" );
	
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

// creates our liquid engine, which will parse our liquid tags
function _createLiquidEngine():void
{
	liquidEngine = new Liquid.Engine();
	
	// create our entity map and escape function for escaping html/xml
	// NOTE: while this isn't exactly the best XML escape (it ignores ' and /),
	// it seems to match the jekyll xml_escape
	var escapeEntityMap:{ [char:string]:string } = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		// "'": "&#39;",
		// "/": "&#x2F;",
		"¢": "&cent;",
		"£": "&pound;",
		"¥": "&yen;",
		"€": "&euro;",
		"©": "&copy;",
		"®": "&reg;"
	}
	
	// create our regex
	var escapeREStr = "[";
	for( var char in escapeEntityMap )
		escapeREStr += char;
	escapeREStr += "]";
	var escapeRE:RegExp = new RegExp( escapeREStr, "g" );
	
	// create our escape function
	function escapeReplace( matchedEntity:string )
	{
		return escapeEntityMap[matchedEntity];
	}
	
	// add in any custom filters
	liquidEngine.registerFilters({
		
		// converts a date to an XML schema date string
		"date_to_xmlschema": function( date:string|Date ):string {
			var d:Date = ( typeof date === 'string' ) ? new Date( date ) : date;
			return DateFormat( d, "isoDateTime" );
		},
		
		// escapes HTML chars so they can be used in XML
		"xml_escape": function( input:string ):string {			
			return input.replace( escapeRE, escapeReplace );
		}
	});
	
	LiquidHighlight.log = log;
	
	// add in our custom tag for the highlight
	liquidEngine.registerTag( "highlight", LiquidHighlight );
	
	// add a filesystem so we can include files
	var includePath:string 			= Path.join( config.src.path, yamlConfig.includes_dir );
	var lfs:Liquid.LocalFileSystem	= new Liquid.LocalFileSystem( includePath, "html" );
	liquidEngine.registerFileSystem( lfs );
}

// reads the layouts
function _readLayouts():{ [name:string]:string }
{
	var layouts:{ [name:string]:string } = {};
	
	// make sure the dir exists
	var path = Path.join( config.src.path, yamlConfig.layouts_dir );
	if( !FS.existsSync( path ) )
	{
		log.warn( "Can't read any layouts as the dir '" + path + "' doesn't exist" );
		return layouts;
	}
	
	// read the dir
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
	// make sure our path exists before doing anything
	var path = Path.join( config.src.path, dir );
	if( !FS.existsSync( path ) )
	{
		log.warn( "The dir '" + path + "' doesn't exist" );
		return;
	}
	
	// parse the dir
	FS.readdirSync( path ).forEach( function( filename:string ){
		
		// make sure it's a html file
		if( filename.lastIndexOf( ".html" ) !== ( filename.length - 5 ) )
		{
			log.info( "Ignoring the file '" + filename + "' (" + path + ") as it's not a HTML file" );
			return;
		}
		
		// create our content object
		var content:Content = _readContent( path, filename );
		if( content != null )
		{
			// extract our tags and add it
			_extractTags( content );
			ar.push( content );
		}
	});
	
	ar.sort( _sortContent );
}

// reads a single file, returning a Content object
function _readContent( path:string, filename:string ):Content
{
	// make sure our path exists
	var filePath = Path.join( path, filename );
	if( !FS.existsSync( filePath ) )
	{
		log.warn( "Can't read the content '" + filePath + "' as the file doesn't exist" );
		return null;
	}
	
	// read the file
	var contentsRaw:string 	= FS.readFileSync( filePath, yamlConfig.encoding );
	var content:Content 	= new Content( filePath );
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

// converts our content, using the liquid tags
function _convertContents():Promise<Content>
{
	// as this uses promises, we need to chain the whole thing
	var sequence = Promise.resolve<Content>();
	
	// store the number of files we need to convert
	numContentToConvert = siteObj.site.posts.length + siteObj.site.pages.length;
	
	// go through all our posts
	siteObj.site.posts.forEach( function( post:Content ){
		
		// add them to the sequence
		sequence = sequence.then( function() {
			return _convertContent( post );
		});
	});
	
	// add in all our pages
	siteObj.site.pages.forEach( function( page:Content ){
		
		// add them to the sequence
		sequence = sequence.then( function(){
			return _convertContent( page );
		});
	});
	
	// return the promise, which will fulfill when all files are converted
	return sequence;
}

// converts a single content, returning a Promise
function _convertContent( content:Content ):Promise<Content>
{
	return liquidEngine.parseAndRender( content.content, siteObj ).then( function( result ){
		
		// save the converted result back to the content (as it can be used later if it's included anywhere)
		log.debug( "Finished parsing liquid in " + content.filename );
		numContentToConvert--; // only necessary when we're converting the pages/posts
		content.content = result;
		return content;
	}).catch( function( e ){
		log.error( "Couldn't parse liquid in " + content.filename, e );
	})
}

// clears a directory and everything in it
function _rmrfDir( dir:string ):void
{
	if( FS.existsSync( dir ) && FS.statSync( dir ).isDirectory )
	{
		log.debug( "Clearing dir " + dir );
		RMRF.sync( dir );
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

// saves some content with possible frontmatter layout (assumes directories have been created)
function _saveContent( content:Content, path:string, destPath:string ):void
{
	// failsafe
	if( content == null )
	{
		log.error( "Can't save some content in path " + destPath + " as null was passed" );
		return;
	}
	
	// check if we have front matter, as we'll probably have to convert something
	if( content.frontMatter != null )
	{
		// check if we have a layout
		var layout:string = ( content.frontMatter.layout != null ) ? layouts[content.frontMatter.layout] : null;
		if( layout != null )
		{
			log.info( "Converting layout" );
		}
		else
		{
			// we don't have a layout, so just parse the file and save it
			_convertContent( content ).then( function( c:Content ){
				FS.writeFileSync( destPath, c.content, yamlConfig.encoding );
			});
		}
	}
	else
		_copyFile( path, destPath ); // just copy the file
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
			_saveContent( content, path, destPath );
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