"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var As_1 = require("./As");
var Sql_1 = require("./Sql");
var From = /** @class */ (function (_super) {
    __extends(From, _super);
    function From(table) {
        var _this = 
        // set default alias
        _super.call(this, table.render()) || this;
        _this._as = new As_1["default"](table.render());
        return _this;
    }
    From.prototype.render = function () {
        var sql = ['FROM'];
        sql.push(this._sql);
        // sql.push(this._as.render());
        return sql.join(' ');
    };
    From.prototype.as = function (alias) {
        if (alias === void 0) { alias = ''; }
        this._as = typeof alias === 'string' ? new As_1["default"](alias) : alias;
        this._as.queryBuilder = this.queryBuilder;
        return this.queryBuilder;
    };
    return From;
}(Sql_1["default"]));
exports["default"] = From;
