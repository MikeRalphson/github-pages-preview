var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RSVP = require('es6-promise');
var Liquid = require('liquid-node');
var Promise = RSVP.Promise;
var SEO = (function (_super) {
    __extends(SEO, _super);
    function SEO(template, tagname, markup) {
        _super.call(this, template, tagname, markup);
        this._lang = null;
        this._lang = (markup != null) ? markup.trim() : null;
    }
    SEO.prototype.render = function (context) {
        var seo = this;
        return _super.prototype.render.call(this, context).then(function (ar) {
            seo.ended = true;
            return '';
        });
    };
    return SEO;
})(Liquid.Block);
module.exports = SEO;
