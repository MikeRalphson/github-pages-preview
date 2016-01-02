
import RSVP		= require( 'es6-promise' );
import Liquid 	= require( 'liquid-node' );
var Promise		= RSVP.Promise;

class LiquidEndHighlight extends Liquid.Tag
{
	// public parse()
	// {
	// 	console.log( "PARSE!", arguments );
	// 	return Promise.resolve<void>();
	// }
	
	// public render()
	// {
	// 	console.log( "RENDER LiquidEndHighlight", arguments );
	// 	return "";
	// }
}

export = LiquidEndHighlight;