/// <reference path='../typings/tsd.d.ts' />
import YAML	= require( 'js-yaml' );

/**
 * Description of a page or a post
 */
class Content
{
	
	/************************************************************/
	
	/**
	 * The front matter for the content
	 */
	public frontMatter:FrontMatter = new FrontMatter();
	
	/**
	 * The main content for the post/page
	 */
	public content:string = null;
	
	/**
	 * The date of the post, as a Date object
	 */
	public date:Date = null;
	
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
	
	/************************************************************/
	
	/**
	 * Reads our content from file
	 */
	public readFromFile( filename:string, file:string ):void
	{		 
		// get the file contents
		var a:string[] = file.match( /(^---(?:\r\n|\n))([\s\S]+)((?:\r\n|\n)---(?:\r\n|\n))([\s\S]+)/ );
		if( a != null )
		{
			this.frontMatter.fromObj( YAML.load( a[2] ) );
			this.content = a[4].trim();
		}
		else
			this.content = file.trim();
			
		// hold our tags
		this.tags = this.frontMatter.tags;
			
		// set our date
		if( this.frontMatter.date != null )
			this.date = new Date( this.frontMatter.date );
			
		// create our filename object (get the date and name)
		a = filename.match( /^(\d{4})-(\d\d?)-(\d\d?)-(.+)(\.html)/ );
		if( a != null )
		{
			this.name = a[4];
			if( this.date == null )
				this.date = new Date( Number( a[1] ), Number( a[2] ) - 1, Number( a[3] ) );
		}
		else
			this.name = filename.substr( 0, -5 );
			
		// set our url
		if( this.frontMatter.permalink != null )
		{
			if( this.frontMatter.permalink.lastIndexOf( "/" ) != this.frontMatter.permalink.length - 1 )
				this.frontMatter.permalink += "/";
			this.url = this.frontMatter.permalink;
		}
		else
		{
			var year:number 	= this.date.getFullYear();
			var month:number 	= this.date.getMonth() + 1;
			var day:number		= this.date.getUTCDate();
			var yearStr:string	= year + "/";
			var monthStr:string	= ( month < 10 ) ? "0" + month + "/" : month + "/";
			var dayStr:string	= ( day < 10 ) ? "0" + day + "/" : day + "/";
			this.url 			= yearStr + monthStr + dayStr + this.name;
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
	public categories:string[] = []];
	
	/**
	 * The tags to associate with this page/post
	 */
	public tags:string[] = []];
	
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