
import RSVP		= require( 'es6-promise' );
import HLJS		= require( 'highlight.js' );
import Liquid 	= require( 'liquid-node' );
var Promise		= RSVP.Promise;

class LiquidHighlight extends Liquid.Block
{
	
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
			
			var str:string = Liquid.Helpers.toFlatString( ar );
			
			// if we don't have a language, don't do anything
			if( lh._lang == null )
				return "<pre><code class=\"nohighlight\">" + str + "</code></pre>";
				
			// get the language class
			var clazz:string = ( lh._lang == "as3" ) ? "actionscript" : lh._lang; // special case as highlight.js uses "actionscript/as" instead of "as3"
			
			// highlight our code and wrap it in <pre><code> tags
			str = HLJS.highlight( clazz, str, true ).value;
			return "<pre><code class=\"language-" + clazz + "\">" + str + "</code></pre>";
		});
	}
}

export = LiquidHighlight;