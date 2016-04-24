/// <reference path='../typings/tsd.d.ts' />
import Config = require( "config" );

class ConfigHelper
{
	/************************************************************/
	
	private m_log:{ level:string }										= null;	// the config for our log
	private m_src:{ path:string, fourOhFour:string } 					= null; // the config for our src dir
	private m_meta:{ keywords:string, description:string }				= null; // the config for our meta data
	private m_highlight:{ parentClassName:string, shouldWrap:boolean }	= null; // the config for our highlight tags
	private m_server:{ port:number }									= null;	// the config for our serving port
	
	/************************************************************/
	
	/**
	 * The config for our log
	 */
	public get log():{ level:string } { return this.m_log; }
	
	/**
	 * The config for our src dir
	 */
	public get src():{ path:string, fourOhFour:string } { return this.m_src; }
	
	/**
	 * The config for our meta data
	 */
	public get meta():{ keywords:string, description:string } { return this.m_meta; }
	
	/**
	 * The config for our highlighter
	 */
	public get highlight():{ parentClassName:string, shouldWrap:boolean } { return this.m_highlight; }
	
	/**
	 * The config for our server
	 */
	public get server():{ port:number } { return this.m_server; }
	
	/************************************************************/
	
	/**
	 * Parses the config file, extracting all our data
	 */
	public parse():void
	{
		this._parseLogConfig();
		this._parseSrcConfig();
		this._parseMetaConfig();
		this._parseHighlightConfig();
		this._parseServerConfig();
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
		this.m_src = { path:"", fourOhFour:null };
		if( Config.has( "src.path" ) )
			this.m_src.path = Config.get<string>( "src.path" );
		if( Config.has( "src.404" ) )
			this.m_src.fourOhFour = Config.get<string>( "src.404" );
	}
	
	// parses our meta config
	private _parseMetaConfig():void
	{
		this.m_meta = { keywords:null, description:null };
		if( Config.has( "meta.keywords" ) )
			this.m_meta.keywords = Config.get<string>( "meta.keywords" );
		if( Config.has( "meta.description" ) )
			this.m_meta.description = Config.get<string>( "meta.description" );	
	}
	
	// parses our highlight config
	private _parseHighlightConfig():void
	{
		this.m_highlight = { parentClassName:"highlight", shouldWrap:true };
		if( Config.has( "highlight.parentClassName" ) )
			this.m_highlight.parentClassName = Config.get<string>( "highlight.parentClassName" );
		if( Config.has( "highlight.shouldWrap" ) )
		{
			this.m_highlight.shouldWrap = Config.get<boolean>( "highlight.shouldWrap" );
			this.m_highlight.shouldWrap = ( this.m_highlight.shouldWrap === true );
		}
	}
	
	// parses our server config
	private _parseServerConfig():void
	{
		this.m_server = { port:4000 };
		if( Config.has( "server.port" ) )
		{
			var port:number = Number( Config.get<number>( "server.port" ) );
			if( !isNaN( port ) )
				this.m_server.port = port;
		}
	}
	
}

export = ConfigHelper;