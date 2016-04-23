import HLJS = require( 'highlight.js' );

/**
 * Description of a page or a post
 */
class JekyllJSHighlight
{
	
	/************************************************************/
	
	/**
	 * The config for our highlighting
	 */
	public config:{ parentClassName:string, shouldWrap:boolean } = null;
	
	/************************************************************/
	
	/**
	 * Runs our code through highlight.js
	 * @param code The code string that we want to highlight
	 * @param lang The lang that this is for. If not set, then auto is used
	 * @return The highlighted string
	 */
	public highlight( code:string, lang:string ):string
	{
		// NOTE: we're wrapping the resulting code in a div with a "highlight" class, as that
		// seems to match the behaviour of the jekyll pygments parser
			
		// get our config
		var cn:string 	= this.config.parentClassName;
		var sw:boolean	= this.config.shouldWrap;
			
		// get the language class
		var clazz:string = ( lang == "as3" ) ? "actionscript" : lang; // special case as highlight.js uses "actionscript/as" instead of "as3"
		
		// highlight our code and wrap it in <pre><code> tags
		// clazz is null if lh._lang is null
		if( clazz != null )
		{
			code 	= HLJS.highlight( clazz, code, true ).value;
			clazz 	= "language-" + clazz;
		}
		else
		{
			code 	= HLJS.highlightAuto( code ).value;
			clazz	= "";
		}
			
		// get our code tag class
		// if we're not wrapping, then the parent classname gets applied to the <code> tag
		var codeClazz = clazz;
		if( !sw ) // if we're not wrapping
			codeClazz = ( codeClazz.length > 0 ) ? codeClazz + " " + cn : cn;
			
		// create our html (wrap it in a div if necessary)
		var html 	= ( sw ) ? "<div class=\"" + cn + "\">" : "";
		html 		+= "<pre><code class=\"" + codeClazz + "\">" + code + "</code></pre>";
		if( sw )
			html += "</div>";
		return html;
	}
	
}

export = JekyllJSHighlight;