var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RSVP = require('es6-promise');
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
            var code = Liquid.Helpers.toFlatString(ar);
            return LiquidHighlight.highlighter.highlight(code, lh._lang);
        });
    };
    LiquidHighlight.highlighter = null;
    return LiquidHighlight;
})(Liquid.Block);
module.exports = LiquidHighlight;
