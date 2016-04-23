
import Liquid = require( 'liquid-node' );

/**
 * Adding the {% include_if_exists %} tag to liquid syntax
 */
class IncludeIfExists extends Liquid.Include
{	
	/**
	 * Creates a new IncludeIfExists tag
	 * @param template The template for our content
	 * @param tagname The name of this tag (include_if_exists)
	 * @param markup Any additional markup included with the tag
	 * @param tokens Any tokens passed (not sure if used)
	 */
	constructor( template:any, tagname:string, markup:string, tokens:any )
	{
		super( template, tagname, markup, tokens );
	}
	
	/**
	 * Called when we want to render the contents of our tag
	 * @param context The context that we want to use when passing our data
	 */
	public render( context:any )
	{
		return super.render( context ).catch( function( err )
		{
			// catch if the file didn't exist, in which case, do nothing
			if( err != null && err.name === 'Liquid.FileSystemError' && err.message != null && err.message.indexOf( 'ENOENT' ) != -1 )
				return '';
				
			// it's something else, rethrow the rror
			throw err;
		});
	}
}

export = IncludeIfExists;