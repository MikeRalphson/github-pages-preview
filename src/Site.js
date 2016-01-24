var Site = (function () {
    function Site() {
        this.title = null;
        this.email = null;
        this.description = null;
        this.baseurl = "";
        this.url = null;
        this.posts = [];
        this.pages = [];
        this.tags = {};
    }
    Site.prototype.updateFromYAML = function (yaml) {
        for (var key in yaml) {
            if (key in this)
                this[key] = yaml[key];
        }
    };
    return Site;
})();
module.exports = Site;
