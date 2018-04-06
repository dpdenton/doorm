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
var On = /** @class */ (function (_super) {
    __extends(On, _super);
    function On() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    On.prototype.render = function () {
        var sql = ['ON'];
        sql.push(this._sql);
        return sql.join(' ');
    };
    return On;
}(Sql_1["default"]));
exports["default"] = On;