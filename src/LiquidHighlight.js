var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RSVP = require('es6-promise');
var HLJS = require('highlight.js');
var Liquid = require('liquid-node');
var Promise = RSVP.Promise;
var LiquidHighlight = (function (_super) {
    __extends(LiquidHighlight, _super);
    function LiquidHighlight(template, tagname, markup) {
        _super.call(this, template, tagname, markup);
        this._lang = null;
        this._lang = (markup != null) ? markup.trim() : null;
    }
    LiquidHighlight.prototype.render = function (context) {
        var lh = this;
        return _super.prototype.render.call(this, context).then(function (ar) {
            var str = Liquid.Helpers.toFlatString(ar);
            var cn = LiquidHighlight.highlightConfig.parentClassName;
            var sw = LiquidHighlight.highlightConfig.shouldWrap;
            var clazz = (lh._lang == "as3") ? "actionscript" : lh._lang;
            if (clazz != null) {
                str = HLJS.highlight(clazz, str, true).value;
                clazz = "language-" + clazz;
            }
            else
                clazz = "nohighlight";
            var codeClazz = clazz + ((!sw) ? " " + cn : "");
            var html = (sw) ? "<div class=\"" + cn + "\">" : "";
            html += "<pre><code class=\"" + codeClazz + "\">" + str + "</code></pre>";
            if (sw)
                html += "</div>";
            return html;
        });
    };
    LiquidHighlight.highlightConfig = null;
    return LiquidHighlight;
})(Liquid.Block);
module.exports = LiquidHighlight;
