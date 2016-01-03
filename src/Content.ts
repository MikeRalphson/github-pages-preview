/// <reference path='../typings/tsd.d.ts' />
import Path	= require( 'path' );
import YAML	= require( 'js-yaml' );

/**
 * Description of a page or a post
 */
class Content
{
	
	/************************************************************/
	
	/**
	 * The original path for this content
	 */
	public filePath:string = null;
	
	/**
	 * The front matter for the content
	 */
	public frontMatter:FrontMatter = null;
	
	/**
	 * The title for the content
	 */
	public title:string = null;
	
	/**
	 * The main content for the post/page
	 */
	public content:string = null;
	
	/**
	 * The date of the post, as a Date object
	 */
	public date:Date = null;
	
	/**
	 * The filename for this content
	 */
	public filename:string = null;
	
	/**
	 * The name of the post, taken from the filename
	 */
	public name:string = null;
	
	/**
	 * The URL for this post
	 */
	public url:string = null;
	
	/**
	 * The tag for this post
	 */
	public tags:string[] = [];
	
	/**
	 * Does the page have any special instructions for when we're generating the sitemap?
	 */
	public sitemap:{ lastmod:string, priority:number, changefreq:string } = null;
	
	/************************************************************/
	
	/**
	 * Creates a new Content object
	 * @param filePath The path of the content
	 */
	constructor( filePath:string )
	{
		this.filePath = filePath;
	}
	
	/**
	 * Reads our content from file
	 */
	public readFromFile( filename:string, file:string ):void
	{		 
		// get the file contents
		var a:string[] = file.match( /(^---(?:\r\n|\n))([\s\S]+)((?:\r\n|\n)---(?:\r\n|\n))([\s\S]+)/ );
		if( a != null )
		{
			this.content 		= a[4].trim();
			this.frontMatter	= new FrontMatter();
			this.frontMatter.fromObj( YAML.load( a[2] ) );
		}
		else
			this.content = file.trim();
			
		// update our vars from our front matter, if we have some
		if( this.frontMatter != null )
		{
			// copy our title
			this.title = this.frontMatter.title;
			
			// copy our tags
			this.tags = this.frontMatter.tags;
			
			// copy our sitemap
			this.sitemap = this.frontMatter.sitemap;
			
			// set our date
			if( this.frontMatter.date != null )
				this.date = new Date( this.frontMatter.date );
			
			// set our url
			if( this.frontMatter.permalink != null )
			{
				if( this.frontMatter.permalink.lastIndexOf( "/" ) != this.frontMatter.permalink.length - 1 )
					this.frontMatter.permalink += "/";
				this.url = this.frontMatter.permalink;
			}
		}
			
		// create our filename object (get the date and name)
		this.filename	= filename;
		a 				= this.filename.match( /^(\d{4})-(\d\d?)-(\d\d?)-([^\.]+)/ );
		if( a != null )
		{
			this.name = a[4];
			if( this.date == null )
				this.date = new Date( Number( a[1] ), Number( a[2] ) - 1, Number( a[3] ) );
				
			// set our title if we don't have it
			if( this.title == null )
			{
				this.title = this.name.replace( "-", " " );
				this.title = this.title.substr( 0, 1 ).toUpperCase() + this.title.substr( 1 ); // capitalise
			}
		}
		else
			this.name = this.filename.substr( 0, this.filename.lastIndexOf( "." ) );
			
		// set our url if we need to
		if( this.url == null && this.date != null )
		{
			var year:number 	= this.date.getFullYear();
			var month:number 	= this.date.getMonth() + 1;
			var day:number		= this.date.getUTCDate();
			var yearStr:string	= year + "/";
			var monthStr:string	= ( month < 10 ) ? "0" + month + "/" : month + "/";
			var dayStr:string	= ( day < 10 ) ? "0" + day + "/" : day + "/";
			this.url 			= yearStr + monthStr + dayStr + this.name;
		}
		else
		{
			if( this.date == null )
				this.date = new Date();
			if( this.url == null )
				this.url = "/" + filename;
		}
	}
	
}

/**
 * Describes the front matter for a page/post
 */
class FrontMatter
{
	
	/************************************************************/
	
	/**
	 * The layout to use for this page/post
	 */
	public layout:string = null;
	
	/**
	 * The permalink to use (default is /year/month/day/title.html)
	 */
	public permalink:string = null;
	
	/**
	 * The title for the content
	 */
	public title:string = null;
	
	/**
	 * Is this post/page published?
	 */
	public published:boolean = true;
	
	/**
	 * The category to set this page/post to
	 */
	public category:string = null;
	
	/**
	 * If we want to assign multiple categories to the page/post
	 */
	public categories:string[] = [];
	
	/**
	 * The tags to associate with this page/post
	 */
	public tags:string[] = [];
	
	/**
	 * The date that will override the date from the name of the post
	 */
	public date:string = null;
	
	/**
	 * Does this page/post have any comments? (found in _includes)
	 */
	public hasComments:boolean = false;
	
	/**
	 * Does this page/post have any associated files? (found in _includess)
	 */
	public hasFiles:boolean = false;
	
	/**
	 * Does the page have any special instructions for when we're generating the sitemap?
	 */
	public sitemap:{ lastmod:string, priority:number, changefreq:string } = null;
	
	/************************************************************/
	
	/**
	 * Fills our data from a generic Object
	 */
	public fromObj( obj:Object ):void
	{
		for( var key in obj )
			this[key] = obj[key];
	}
	
}

export = Content;