var HLJS = require('highlight.js');
var JekyllJSHighlight = (function () {
    function JekyllJSHighlight() {
        this.config = null;
    }
    JekyllJSHighlight.prototype.highlight = function (code, lang) {
        var cn = this.config.parentClassName;
        var sw = this.config.shouldWrap;
        var clazz = (lang == "as3") ? "actionscript" : lang;
        if (clazz != null) {
            code = HLJS.highlight(clazz, code, true).value;
            clazz = "language-" + clazz;
        }
        else {
            code = HLJS.highlightAuto(code).value;
            clazz = "";
        }
        var codeClazz = clazz;
        if (!sw)
            codeClazz = (codeClazz.length > 0) ? codeClazz + " " + cn : cn;
        var html = (sw) ? "<div class=\"" + cn + "\">" : "";
        html += "<pre><code class=\"" + codeClazz + "\">" + code + "</code></pre>";
        if (sw)
            html += "</div>";
        return html;
    };
    return JekyllJSHighlight;
})();
module.exports = JekyllJSHighlight;
