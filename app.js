require('es6-promise').polyfill();
var Bunyan = require('bunyan');
var DateFormat = require('dateformat');
var FS = require('fs');
var HTTP = require('http');
var Liquid = require('liquid-node');
var Marked = require('marked');
var NodeStatic = require('node-static');
var Path = require('path');
var RMRF = require('rimraf');
var RSVP = require('es6-promise');
var YAML = require('js-yaml');
var ConfigHelper = require('./src/ConfigHelper');
var Content = require('./src/Content');
var IncludeIfExists = require('./src/IncludeIfExists');
var JekyllJSHighlight = require('./src/JekyllJSHighlight');
var LiquidHighlight = require('./src/LiquidHighlight');
var Site = require('./src/Site');
var YAMLConfig = require('./src/YAMLConfig');
var Promise = RSVP.Promise;
var highlighter = null;
var liquidEngine = null;
var config = null;
var log = null;
var yamlConfig = null;
var context = null;
var layouts = null;
var isServing = false;
var startTime = null;
function run() {
    startTime = new Date();
    _readToolConfig();
    _createLog();
    _readYAMLConfig();
    _createContext();
    _createJekyllJSHighlight();
    _createMarked();
    _createLiquidEngine();
    if (process.argv.length > 2 && process.argv[2] === "serve")
        isServing = true;
    if (isServing) {
        context.site.url = "http://localhost:" + config.server.port;
        log.debug("We're serving the site; changing the site url to " + context.site.url);
    }
    log.debug("Reading content");
    layouts = _readLayouts();
    _readContents("_posts", context.site.posts);
    _readContents("pages", context.site.pages);
    var numTags = Object.keys(context.site.tags).length;
    context.site.tags["size"] = numTags;
    log.info(Object.keys(layouts).length + " layouts, " + context.site.posts.length + " posts, and " + context.site.pages.length + " pages were read. A total of " + numTags + " tags were found");
    log.debug("Parsing liquid tags in our content");
    _convertPostsAndPages().then(function () {
        var destDir = Path.join(config.src.path, yamlConfig.destination);
        _rmrfDir(destDir);
        FS.mkdirSync(destDir);
        return destDir;
    }).then(function (destDir) {
        log.info("Saving site content");
        return _savePostsAndPages(destDir);
    }).then(function () {
        log.info("Saving other site files");
        return _copyAllOtherFiles(config.src.path, null);
    }).then(function () {
        var totalTimeMS = ((new Date()).getTime() - startTime.getTime());
        var totalTimeS = Math.floor(totalTimeMS / 1000);
        var msg = "JekyllJS build finished in";
        var mins = 0;
        if (totalTimeS >= 60) {
            mins = Math.floor(totalTimeS / 60);
            totalTimeS -= 60 * mins;
            msg += (mins == 1) ? " 1 min" : " " + mins + " mins";
        }
        if (totalTimeS > 0)
            msg += (totalTimeS == 1) ? " 1 second!" : " " + totalTimeS + " seconds!";
        else if (mins == 0)
            msg += " no time at all!";
        log.info(msg);
        if (isServing) {
            log.info("Starting local server");
            _createServer();
            return;
        }
        process.exit();
    }).catch(function (e) {
        log.error("Aborting build because an error occurred", e);
        process.exit();
        return;
    });
}
run();
function _createLog() {
    log = Bunyan.createLogger({
        name: 'JekyllJS',
        streams: [
            {
                level: config.log.level,
                stream: process.stdout
            }
        ]
    });
    log.info("JekyllJS starting up on", new Date());
    log.debug("Config", config);
}
function _readToolConfig() {
    config = new ConfigHelper();
    config.parse();
}
function _readYAMLConfig() {
    var path = Path.join(config.src.path, "_config.yml");
    log.debug("Reading yaml config from " + path);
    var yaml = {};
    if (FS.existsSync(path))
        yaml = YAML.load(FS.readFileSync(path, "utf-8"));
    else
        log.warn("The YAML config file (" + path + ") doesn't exist");
    yamlConfig = new YAMLConfig();
    yamlConfig.fromObj(yaml);
    log.debug("YAML config:", yamlConfig);
}
function _createContext() {
    context = { site: new Site(), page: null, content: null };
    context.site.meta = config.meta;
    context.site.updateFromYAML(yamlConfig);
}
function _createJekyllJSHighlight() {
    highlighter = new JekyllJSHighlight();
    highlighter.config = config.highlight;
}
function _createMarked() {
    var renderer = new Marked.Renderer();
    renderer.code = function (code, lang) {
        return highlighter.highlight(code, lang) + '\n';
    };
    Marked.setOptions({
        renderer: renderer
    });
}
function _createLiquidEngine() {
    liquidEngine = new Liquid.Engine();
    var escapeEntityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "¢": "&cent;",
        "£": "&pound;",
        "¥": "&yen;",
        "€": "&euro;",
        "©": "&copy;",
        "®": "&reg;"
    };
    var escapeREStr = "[";
    for (var char in escapeEntityMap)
        escapeREStr += char;
    escapeREStr += "]";
    var escapeRE = new RegExp(escapeREStr, "g");
    function escapeReplace(matchedEntity) {
        return escapeEntityMap[matchedEntity];
    }
    liquidEngine.registerFilters({
        "date_to_xmlschema": function (date) {
            var d = (typeof date === 'string') ? new Date(date) : date;
            return DateFormat(d, "isoDateTime");
        },
        "xml_escape": function (input) {
            return input.replace(escapeRE, escapeReplace);
        },
        "cgi_escape": function (input) {
            return encodeURIComponent(input).replace(/%20/g, "+");
        }
    });
    LiquidHighlight.highlighter = highlighter;
    liquidEngine.registerTag("highlight", LiquidHighlight);
    liquidEngine.registerTag("include_if_exists", IncludeIfExists);
    var includePath = Path.join(config.src.path, yamlConfig.includes_dir);
    var lfs = new Liquid.LocalFileSystem(includePath, "html");
    liquidEngine.registerFileSystem(lfs);
}
function _readLayouts() {
    var layouts = {};
    var path = Path.join(config.src.path, yamlConfig.layouts_dir);
    if (!FS.existsSync(path)) {
        log.warn("Can't read any layouts as the dir '" + path + "' doesn't exist");
        return layouts;
    }
    FS.readdirSync(path).forEach(function (filename) {
        if (!_isSupportedContentType(filename)) {
            log.info("Ignoring the file '" + filename + "' (" + path + ") in layouts as it's not a supported content type (HTML/Markdown)");
            return;
        }
        var contentsRaw = FS.readFileSync(Path.join(path, filename), yamlConfig.encoding);
        var layoutName = filename.substring(0, filename.lastIndexOf("."));
        layouts[layoutName] = contentsRaw;
    });
    return layouts;
}
function _readContents(dir, ar) {
    var path = Path.join(config.src.path, dir);
    if (!FS.existsSync(path)) {
        log.warn("The dir '" + path + "' doesn't exist");
        return;
    }
    FS.readdirSync(path).forEach(function (filename) {
        if (!_isSupportedContentType(filename)) {
            log.info("Ignoring the file '" + filename + "' (" + path + ") as it's not a supported content type (HTML/Markdown)");
            return;
        }
        var content = _readContent(path, filename);
        if (content != null) {
            _extractTags(content);
            ar.push(content);
        }
    });
    ar.sort(_sortContent);
}
function _readContent(path, filename) {
    var filePath = Path.join(path, filename);
    if (!FS.existsSync(filePath)) {
        log.warn("Can't read the content '" + filePath + "' as the file doesn't exist");
        return null;
    }
    var contentsRaw = FS.readFileSync(filePath, yamlConfig.encoding);
    var content = new Content(Path.relative(config.src.path, filePath));
    content.readFromFile(filename, contentsRaw);
    if (content.isMarkdown) {
        log.debug("Converting markdown file '" + content.filename + "'");
        content.content = Marked(content.content);
    }
    return content;
}
function _extractTags(content) {
    if (content.tags == null || content.tags.length == 0)
        return;
    var len = content.tags.length;
    for (var i = 0; i < len; i++) {
        var t = content.tags[i];
        if (t in context.site.tags) {
            context.site.tags[t].push(content);
            context.site.tags[t].sort(_sortContent);
        }
        else
            context.site.tags[t] = [content];
    }
}
function _convertPostsAndPages() {
    var sequence = Promise.resolve();
    context.site.posts.forEach(function (post) {
        sequence = sequence.then(function () {
            return _convertContent(post);
        });
    });
    context.site.pages.forEach(function (page) {
        sequence = sequence.then(function () {
            return _convertContent(page);
        });
    });
    return sequence;
}
function _convertContent(content) {
    context.page = content;
    context.content = content.content;
    return liquidEngine.parseAndRender(content.content, context).then(function (result) {
        log.debug("Finished parsing liquid in " + content.filename);
        content.content = result;
    }).catch(function (e) {
        log.error("Couldn't parse liquid in " + content.filename, e);
        throw e;
    });
}
function _rmrfDir(dir) {
    if (FS.existsSync(dir) && FS.statSync(dir).isDirectory) {
        log.debug("Clearing dir " + dir);
        RMRF.sync(dir);
    }
}
function _savePostsAndPages(destRoot) {
    var sequence = Promise.resolve();
    context.site.posts.forEach(function (post) {
        sequence = sequence.then(function () {
            _ensureDirs(post.url, destRoot);
            return _saveContent(post, post.path, Path.join(destRoot, post.url, "index.html"));
        });
    });
    context.site.pages.forEach(function (page) {
        sequence = sequence.then(function () {
            _ensureDirs(page.url, destRoot);
            return _saveContent(page, page.path, Path.join(destRoot, page.url, "index.html"));
        });
    });
    return sequence;
}
function _saveContent(content, path, destPath) {
    if (content == null)
        return Promise.reject(new Error("Can't save some content in path " + destPath + " as null was passed"));
    if (content.frontMatter != null) {
        var layout = (content.layout != null) ? layouts[content.layout] : null;
        if (layout != null) {
            context.page = content;
            context.content = content.content;
            return liquidEngine.parseAndRender(layout, context).then(function (result) {
                log.debug("Saving file " + content.url);
                FS.writeFileSync(destPath, result, yamlConfig.encoding);
            }).catch(function (e) {
                log.error("Couldn't save content " + content.url, e);
                throw e;
            });
        }
        else {
            return _convertContent(content).then(function () {
                log.debug("Saving file " + content.url);
                FS.writeFileSync(destPath, content.content, yamlConfig.encoding);
            }).catch(function (e) {
                log.error("Couldn't save content " + content.url, e);
                throw e;
            });
        }
    }
    else {
        log.debug("Saving file " + content.url);
        _copyFile(path, destPath);
        return Promise.resolve();
    }
}
function _copyAllOtherFiles(dir, sequence) {
    if (sequence == null)
        sequence = Promise.resolve();
    FS.readdirSync(dir).forEach(function (filename) {
        var path = Path.join(dir, filename);
        if (/^[_\.]/.test(filename)) {
            if (yamlConfig.include.indexOf(filename) == -1) {
                log.debug("Ignoring " + path + " as it's a hidden file, or a special directory");
                return;
            }
            log.debug("Including " + path + " as it's in our YAML include array");
        }
        if (yamlConfig.exclude.indexOf(filename) != -1) {
            log.debug("Ignoring " + Path.join(dir, filename) + " as it's in our YAML exclude array");
            return;
        }
        if (FS.statSync(path).isDirectory()) {
            if (filename == "pages")
                return;
            _copyAllOtherFiles(path, sequence);
        }
        else {
            var destRootDir = Path.join(config.src.path, yamlConfig.destination);
            var destDir = Path.join(destRootDir, Path.relative(config.src.path, dir));
            var destPath = Path.join(destDir, filename);
            _ensureDirs(Path.relative(destRootDir, destDir), destRootDir);
            var content = _readContent(dir, filename);
            if (content.url == "/index.html")
                content.url = "/";
            if (content.frontMatter != null)
                context.site.pages.push(content);
            sequence = sequence.then(function () {
                return _saveContent(content, path, destPath);
            });
        }
    });
    return sequence;
}
function _copyFile(inPath, outPath) {
    var buffer = new Buffer(65536);
    var pos = 0;
    var inFile = FS.openSync(inPath, "r");
    var outFile = FS.openSync(outPath, "w");
    do {
        var read = FS.readSync(inFile, buffer, 0, buffer.length, pos);
        FS.writeSync(outFile, buffer, 0, read, pos);
        pos += read;
    } while (read > 0);
    FS.closeSync(inFile);
    FS.closeSync(outFile);
}
function _ensureDirs(path, root) {
    var curr = root + Path.sep;
    var parts = (path.indexOf("/") != -1) ? path.split("/") : path.split(Path.sep);
    var len = parts.length;
    for (var i = 0; i < len; i++) {
        if (i == len - 1 && parts[i].indexOf(".") != -1)
            return;
        curr += parts[i] + Path.sep;
        curr = Path.normalize(curr);
        if (!FS.existsSync(curr))
            FS.mkdirSync(curr);
    }
}
function _sortContent(a, b) {
    return b.date.getTime() - a.date.getTime();
}
function _isSupportedContentType(filename) {
    var index = filename.lastIndexOf('.');
    if (index == -1)
        return false;
    var ext = filename.substring(index + 1);
    return (ext == 'html' || ext == 'htm' || ext == 'md' || ext == 'markdown');
}
function _createServer() {
    var serverDir = Path.join(config.src.path, yamlConfig.destination);
    var file = new NodeStatic.Server(serverDir, {
        cache: 0,
        gzip: true
    });
    if (config.src.fourOhFour != null) {
        var path404 = Path.join(serverDir, config.src.fourOhFour);
        var exists = FS.existsSync(path404);
        if (!exists) {
            log.error("The 404 path specified (" + path404 + ") doesn't exist");
            config.src.fourOhFour = null;
        }
        else if (FS.statSync(path404).isDirectory()) {
            if (config.src.fourOhFour.charAt(config.src.fourOhFour.length - 1) == "/")
                config.src.fourOhFour += "index.html";
            else
                config.src.fourOhFour += "/index.html";
        }
        if (config.src.fourOhFour != null && config.src.fourOhFour.charAt(0) != "/")
            config.src.fourOhFour = "/" + config.src.fourOhFour;
    }
    HTTP.createServer(function (request, response) {
        request.addListener('end', function () {
            file.serve(request, response, function (err, result) {
                if (err) {
                    log.error("There was an error getting " + request.url + " - " + err.message);
                    if (config.src.fourOhFour != null && (request.url.indexOf(".html") != -1 || request.url.charAt(request.url.length - 1) == "/") && err.status == 404)
                        file.serveFile(config.src.fourOhFour, 404, {}, request, response);
                    else {
                        response.writeHead(err.status, err.headers);
                        response.end();
                    }
                }
            });
        }).resume();
    }).listen(config.server.port);
    log.info("Local server started at " + context.site.url);
}
