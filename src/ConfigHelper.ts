/// <reference path='../typings/tsd.d.ts' />
import Config = require( "config" );

class ConfigHelper
{
	/************************************************************/
	
	private m_src:{ path:string } = null; // the config for our src dir
	
	/************************************************************/
	
	/**
	 * The config for our src dir
	 */
	public get src():{ path:string } { return this.m_src; }
	
	/************************************************************/
	
	/**
	 * Parses the config file, extracting all our data
	 */
	public parse():void
	{
		this._parseSrcConfig();
	}
	
	/************************************************************/
	
	// parses our src dir config
	private _parseSrcConfig():void
	{
		this.m_src = { path:"" };
		if( Config.has( "src.path" ) )
			this.m_src.path = Config.get<string>( "src.path" );
	}
	
}

export = ConfigHelper;