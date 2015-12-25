/// <reference path='../typings/tsd.d.ts' />
import Config = require( "config" );

class ConfigHelper
{
	/************************************************************/
	
	private m_src:{ path:string }	= null; // the config for our src dir
	private m_dest:{ path:string }	= null; // the config for our dest dir
	
	/************************************************************/
	
	/**
	 * The config for our src dir
	 */
	public get src():{ path:string } { return this.m_src; }
	
	/**
	 * The config for our dest dir
	 */
	public get dest():{ path:string } { return this.m_dest; }
	
	/************************************************************/
	
	/**
	 * Parses the config file, extracting all our data
	 */
	public parse():void
	{
		this._parseSrcConfig();
		this._parseDestConfig();
	}
	
	/************************************************************/
	
	// parses our src dir config
	private _parseSrcConfig():void
	{
		this.m_src = { path:"" };
		if( Config.has( "src.path" ) )
			this.m_src.path = Config.get<string>( "src.path" );
	}
	
	// parses our dest dir config
	private _parseDestConfig():void
	{
		this.m_dest = { path:"" };
		if( Config.has( "dest.path" ) )
			this.m_dest.path = Config.get<string>( "dest.path" );
	}
	
}

export = ConfigHelper;