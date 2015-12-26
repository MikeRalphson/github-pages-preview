/// <reference path='../typings/tsd.d.ts' />
import Config = require( "config" );

class ConfigHelper
{
	/************************************************************/
	
	private m_log:{ level:string }	= null;	// the config for our log
	private m_src:{ path:string } 	= null; // the config for our src dir
	
	/************************************************************/
	
	/**
	 * The config for our log
	 */
	public get log():{ level:string } { return this.m_log; }
	
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
		this._parseLogConfig();
		this._parseSrcConfig();
	}
	
	/************************************************************/
	
	// parses our log config
	private _parseLogConfig():void
	{
		this.m_log = { level:"debug" };
		if( Config.has( "log.level" ) )
			this.m_log.level = Config.get<string>( "log.level" );
		
		// make sure our level is valid
		if( !this._isValidLogLevel( this.m_log.level ) )
			this.m_log.level = "debug";
	}
	
	// returns if a string is a valid log level or not
	private _isValidLogLevel( level:string ):boolean
	{
		return ( level === "trace" ||
				 level === "debug" ||
				 level === "info" ||
				 level === "warn" ||
				 level === "error" ||
				 level === "fatal" );
	}
	
	// parses our src dir config
	private _parseSrcConfig():void
	{
		this.m_src = { path:"" };
		if( Config.has( "src.path" ) )
			this.m_src.path = Config.get<string>( "src.path" );
	}
	
}

export = ConfigHelper;