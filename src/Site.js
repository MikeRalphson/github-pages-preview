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
        this.meta = null;
        this.opengraph = null;
        this.github = {
            repository_name: 'github-pages-preview',
            repository_url: 'https://github.com/MikeRalphson/github-pages-preview',
            is_project_page: true,
            project_tagline: 'GitHub-Pages-Preview is a Node.js replacement for Jekyll sites, allowing you to build your site, as-is, without needing to install Ruby or Python',
            owner_url: 'https://github.com/MikeRalphson',
            owner_name: 'Mike Ralphson'
        };
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
