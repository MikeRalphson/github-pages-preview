
import RSVP					= require( 'es6-promise' );
import Liquid 				= require( 'liquid-node' );
import JekyllJSHighlight	= require( './JekyllJSHighlight' );
var Promise					= RSVP.Promise;

/**
 * Adding the {% highlight %} tag to liquid syntax
 */
class LiquidHighlight extends Liquid.Block
{
	
	/************************************************************/
	
	/**
	 * The object that will do our highlighting
	 */
	public static highlighter:JekyllJSHighlight = null;
	
	/************************************************************/
	
	private _lang = null; // the language that we're highlighting
	
	/************************************************************/
	
	/**
	 * Creates a new LiquidHighlight tag
	 * @param template The template for our content
	 * @param tagname The name of this tag (highlight)
	 * @param markup Any additional markup included with the tag (in this case, the lang that we're highlighting)
	 */
	constructor( template:any, tagname:string, markup:string )
	{
		super( template, tagname, markup );
		this._lang = ( markup != null ) ? markup.trim() : null;
	}
	
	/**
	 * Called when we want to render the contents of our tag
	 * @param context The context that we want to use when passing our data
	 */
	public render( context:any )
	{
		var lh:LiquidHighlight = this;
		
		// get the content as a string, then highlight it
		return super.render( context ).then( function( ar:string[] ){
			
			var code:string = Liquid.Helpers.toFlatString( ar );
			return LiquidHighlight.highlighter.highlight( code, lh._lang );
		});
	}
}

export = LiquidHighlight;