
import Bunyan	= require( 'bunyan' );
import RSVP		= require( 'es6-promise' );
import Liquid 	= require( 'liquid-node' );
var Promise		= RSVP.Promise;

class LiquidHighlight extends Liquid.Block
{
	
	/************************************************************/

	public static log:Bunyan.Logger = null;
	
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
	 */
	public render()
	{
		var lh:LiquidHighlight = this;
		
		// get the content as a string, then highlight it
		// TODO: call highlight.js on this
		return super.render().then( function( ar:string[] ){
			var str:string = Liquid.Helpers.toFlatString( ar );
			return lh._lang + ": " + str.toUpperCase();
		});
	}
}

export = LiquidHighlight;