
import Bunyan	= require( 'bunyan' );
import RSVP		= require( 'es6-promise' );
import Liquid 	= require( 'liquid-node' );
var Promise		= RSVP.Promise;

class LiquidHighlight extends Liquid.Tag
{
	public static log:Bunyan.Logger = null;
	
	public parse()
	{
		LiquidHighlight.log.info( "PARSE!", arguments );
		return Promise.resolve<void>();
	}
	
	public render()
	{
		LiquidHighlight.log.info( "RENDER", arguments );
		return "";
	}
}

export = LiquidHighlight;