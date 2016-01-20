
import RSVP		= require( 'es6-promise' );
import HLJS		= require( 'highlight.js' );
import Liquid 	= require( 'liquid-node' );
var Promise		= RSVP.Promise;

class LiquidHighlight extends Liquid.Block
{
	
	/************************************************************/
	
	/**
	 * Our config for the highlight tag
	 */
	public static highlightConfig:{ parentClassName:string, shouldWrap:boolean } = null;
	
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
			
			// NOTE: we're wrapping the resulting code in a div with a "highlight" class, as that
			// seems to match the behaviour of the jekyll pygments parser
			
			// get our config
			var cn:string 	= LiquidHighlight.highlightConfig.parentClassName;
			var sw:boolean	= LiquidHighlight.highlightConfig.shouldWrap;
				
			// get the language class
			var clazz:string = ( lh._lang == "as3" ) ? "actionscript" : lh._lang; // special case as highlight.js uses "actionscript/as" instead of "as3"
			
			// highlight our code and wrap it in <pre><code> tags
			// clazz is null if lh._lang is null
			if( clazz != null )
			{
				str 	= HLJS.highlight( clazz, str, true ).value;
				clazz 	= "language-" + clazz;
			}
			else
				clazz = "nohighlight";
				
			// get our code tag class
			// if we're not wrapping, then the parent classname gets applied to the <code> tag
			var codeClazz = clazz + ( ( !sw ) ? " " + cn : "" );
				
			// create our html (wrap it in a div if necessary)
			var html 	= ( sw ) ? "<div class=\"" + cn + "\">" : "";
			html 		+= "<pre><code class=\"" + codeClazz + "\">" + str + "</code></pre>";
			if( sw )
				html += "</div>";
			return html;
		});
	}
}

export = LiquidHighlight;