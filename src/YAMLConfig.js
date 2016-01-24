var YAMLConfig = (function () {
    function YAMLConfig() {
        this.source = ".";
        this.destination = "./_site";
        this.layouts_dir = "./_layouts";
        this.includes_dir = "./_includes";
        this.include = [".htaccess"];
        this.exclude = [];
        this.encoding = "utf-8";
        this.title = null;
        this.email = null;
        this.description = null;
        this.baseurl = "";
        this.url = null;
    }
    YAMLConfig.prototype.fromObj = function (obj) {
        for (var key in obj)
            this[key] = obj[key];
    };
    return YAMLConfig;
})();
module.exports = YAMLConfig;
