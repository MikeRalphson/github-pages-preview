/**
 * Describes some of the basic config that we can have with _config.yml
 */
class YAMLConfig
{
	
	/************************************************************/
	
	/**
	 * The source directory
	 */
	public source:string = ".";
	
	/**
	 * The destination directory
	 */
	public destination:string = "./_site";
	
	/**
	 * Where to find the layouts
	 */
	public layouts_dir:string = "./_layouts";
	
	/**
	 * Where to find our includes
	 */
	public includes_dir:string = "./_includes";
	
	/**
	 * What files to always include
	 */
	public include:string[] = [".htaccess"];
	
	/**
	 * What files to exclude when generating the site
	 */
	public exclude:string[] = [];
	
	/**
	 * The encoding for our pages
	 */
	public encoding:string = "utf-8";
	
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
	
	/************************************************************/
	
	/**
	 * Fills our data from a generic Javascript object
	 */
	public fromObj( obj:Object ):void
	{
		for( var key in obj )
			this[key] = obj[key];
	}
	
}

export = YAMLConfig;