var YAML = require('js-yaml');
var Content = (function () {
    function Content(filePath) {
        this.path = null;
        this.ext = null;
        this.frontMatter = null;
        this.layout = null;
        this.title = null;
        this.content = null;
        this.date = null;
        this.filename = null;
        this.name = null;
        this.url = null;
        this.permalink = null;
        this.published = true;
        this.category = null;
        this.categories = [];
        this.tags = [];
        this.hasComments = false;
        this.hasFiles = false;
        this.sitemap = null;
        this.path = filePath.replace(/\\\\?/g, "/");
    }
    Object.defineProperty(Content.prototype, "isMarkdown", {
        get: function () { return (this.ext === 'md' || this.ext === 'markdown'); },
        enumerable: true,
        configurable: true
    });
    Content.prototype.readFromFile = function (filename, file) {
        var a = file.match(/(^---(?:\r\n|\n))([\s\S]+)((?:\r\n|\n)---(?:\r\n|\n))([\s\S]+)/);
        if (a != null) {
            this.content = a[4].trim();
            this.frontMatter = new FrontMatter();
            this.frontMatter.fromObj(YAML.load(a[2]));
        }
        else
            this.content = file.trim();
        if (this.frontMatter != null) {
            for (var key in this.frontMatter)
                this[key] = this.frontMatter[key];
            if (this.frontMatter.date != null)
                this.date = new Date(this.frontMatter.date);
            if (this.permalink != null) {
                if (this.permalink.lastIndexOf("/") != this.permalink.length - 1)
                    this.permalink += "/";
                this.url = this.permalink;
            }
        }
        this.filename = filename;
        a = this.filename.match(/^(\d{4})-(\d\d?)-(\d\d?)-([^\.]+)\.(.+)/);
        if (a != null) {
            this.name = a[4];
            this.ext = a[5];
            if (this.date == null)
                this.date = new Date(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
            if (this.title == null) {
                this.title = this.name.replace("-", " ");
                this.title = this.title.substr(0, 1).toUpperCase() + this.title.substr(1);
            }
        }
        else {
            this.name = this.filename.substr(0, this.filename.lastIndexOf("."));
            this.ext = this.filename.substr(this.filename.lastIndexOf(".") + 1);
        }
        if (this.url == null && this.date != null) {
            var year = this.date.getFullYear();
            var month = this.date.getMonth() + 1;
            var day = this.date.getUTCDate();
            var yearStr = year + "/";
            var monthStr = (month < 10) ? "0" + month + "/" : month + "/";
            var dayStr = (day < 10) ? "0" + day + "/" : day + "/";
            this.url = yearStr + monthStr + dayStr + this.name;
        }
        else {
            if (this.date == null)
                this.date = new Date();
            if (this.url == null)
                this.url = "/" + filename;
        }
    };
    return Content;
})();
var FrontMatter = (function () {
    function FrontMatter() {
        this.layout = null;
        this.permalink = null;
        this.title = null;
        this.published = true;
        this.category = null;
        this.categories = [];
        this.tags = [];
        this.date = null;
        this.hasComments = false;
        this.hasFiles = false;
        this.sitemap = null;
    }
    FrontMatter.prototype.fromObj = function (obj) {
        for (var key in obj)
            this[key] = obj[key];
    };
    return FrontMatter;
})();
module.exports = Content;
