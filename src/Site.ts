/// <reference path='../typings/tsd.d.ts' />
import Content 		= require( './Content' );
import YAMLConfig	= require( './YAMLConfig' );

/**
 * Class describing the site object, which is passed to the posts/pages when they're being
 * generated
 */
class Site
{
	
	/************************************************************/	
	
	/**
	 * The default site title
	 */
	public title:string = null;
	
	/**
	 * The email of the author of the site
	 */
	public email:string = null;
	
	/**
	 * The default description for the site
	 */
	public description:string = null;
	
	/**
	 * The baseurl for the site. Useful if we're under a sub-domain
	 */
	public baseurl:string = "";
	
	/**
	 * The URL for the site
	 */
	public url:string = null;
	
	/**
	 * All the posts for the site
	 */
	public posts:Content[] = [];
	
	/**
	 * All the pages for the site
	 */
	public pages:Content[] = [];
	
	/**
	 * All the tags for the site
	 */
	public tags:{ [tag:string]:Content[]|number } = {}; // the number one is for the size property
	
	/**
	 * The site's default meta data
	 */
	public meta:{ keywords:string, description:string } = null;
	
	/**
	 * The site's default opengraph data
	 */
	public opengraph:{ "fb:admins":string, "og:type":string, "og:image":string } = null;
	
	/************************************************************/
	
	/**
	 * Updates our Site vars from the YAML config
	 * @param yaml The YAMLConfig object
	 */
	public updateFromYAML( yaml:YAMLConfig ):void
	{
		for( var key in yaml )
		{
			if( key in this )
				this[key] = yaml[key];
		}
	}
	
}

export = Site;