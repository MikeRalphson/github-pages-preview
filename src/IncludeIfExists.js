var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Liquid = require('liquid-node');
var IncludeIfExists = (function (_super) {
    __extends(IncludeIfExists, _super);
    function IncludeIfExists(template, tagname, markup, tokens) {
        _super.call(this, template, tagname, markup, tokens);
    }
    IncludeIfExists.prototype.render = function (context) {
        return _super.prototype.render.call(this, context).catch(function (err) {
            if (err != null && err.name === 'Liquid.FileSystemError' && err.message != null && err.message.indexOf('ENOENT') != -1)
                return '';
            throw err;
        });
    };
    return IncludeIfExists;
})(Liquid.Include);
module.exports = IncludeIfExists;
