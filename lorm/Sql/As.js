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
var Sql_1 = require("./Sql");
var As = /** @class */ (function (_super) {
    __extends(As, _super);
    function As() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    As.prototype.render = function () {
        var sql = ['AS'];
        sql.push(this._sql);
        return sql.join(' ');
    };
    Object.defineProperty(As.prototype, "sql", {
        get: function () {
            return this._sql;
        },
        enumerable: true,
        configurable: true
    });
    return As;
}(Sql_1["default"]));
exports["default"] = As;
