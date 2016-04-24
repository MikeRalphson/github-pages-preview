var Config = require("config");
var ConfigHelper = (function () {
    function ConfigHelper() {
        this.m_log = null;
        this.m_src = null;
        this.m_meta = null;
        this.m_opengraph = null;
        this.m_highlight = null;
        this.m_server = null;
    }
    Object.defineProperty(ConfigHelper.prototype, "log", {
        get: function () { return this.m_log; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigHelper.prototype, "src", {
        get: function () { return this.m_src; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigHelper.prototype, "meta", {
        get: function () { return this.m_meta; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigHelper.prototype, "opengraph", {
        get: function () { return this.m_opengraph; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigHelper.prototype, "highlight", {
        get: function () { return this.m_highlight; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigHelper.prototype, "server", {
        get: function () { return this.m_server; },
        enumerable: true,
        configurable: true
    });
    ConfigHelper.prototype.parse = function () {
        this._parseLogConfig();
        this._parseSrcConfig();
        this._parseMetaConfig();
        this._parseOpenGraphConfig();
        this._parseHighlightConfig();
        this._parseServerConfig();
    };
    ConfigHelper.prototype._parseLogConfig = function () {
        this.m_log = { level: "debug" };
        if (Config.has("log.level"))
            this.m_log.level = Config.get("log.level");
        if (!this._isValidLogLevel(this.m_log.level))
            this.m_log.level = "debug";
    };
    ConfigHelper.prototype._isValidLogLevel = function (level) {
        return (level === "trace" ||
            level === "debug" ||
            level === "info" ||
            level === "warn" ||
            level === "error" ||
            level === "fatal");
    };
    ConfigHelper.prototype._parseSrcConfig = function () {
        this.m_src = { path: "", fourOhFour: null };
        if (Config.has("src.path"))
            this.m_src.path = Config.get("src.path");
        if (Config.has("src.404"))
            this.m_src.fourOhFour = Config.get("src.404");
    };
    ConfigHelper.prototype._parseMetaConfig = function () {
        this.m_meta = { keywords: null, description: null };
        if (Config.has("meta.keywords"))
            this.m_meta.keywords = Config.get("meta.keywords");
        if (Config.has("meta.description"))
            this.m_meta.description = Config.get("meta.description");
    };
    ConfigHelper.prototype._parseOpenGraphConfig = function () {
        this.m_opengraph = { fbAdmin: null, type: null, image: null };
        if (Config.has("opengraph.fb:admins"))
            this.m_opengraph.fbAdmin = Config.get("opengraph.fb:admins");
        if (Config.has("opengraph.og:type"))
            this.m_opengraph.type = Config.get("opengraph.og:type");
        if (Config.has("opengraph.og:image"))
            this.m_opengraph.image = Config.get("opengraph.og:image");
    };
    ConfigHelper.prototype._parseHighlightConfig = function () {
        this.m_highlight = { parentClassName: "highlight", shouldWrap: true };
        if (Config.has("highlight.parentClassName"))
            this.m_highlight.parentClassName = Config.get("highlight.parentClassName");
        if (Config.has("highlight.shouldWrap")) {
            this.m_highlight.shouldWrap = Config.get("highlight.shouldWrap");
            this.m_highlight.shouldWrap = (this.m_highlight.shouldWrap === true);
        }
    };
    ConfigHelper.prototype._parseServerConfig = function () {
        this.m_server = { port: 4000 };
        if (Config.has("server.port")) {
            var port = Number(Config.get("server.port"));
            if (!isNaN(port))
                this.m_server.port = port;
        }
    };
    return ConfigHelper;
})();
module.exports = ConfigHelper;
