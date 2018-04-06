"use strict";
exports.__esModule = true;
var Sql = /** @class */ (function () {
    function Sql(sql) {
        if (sql === void 0) { sql = ''; }
        this._error = null;
        this._sql = sql;
    }
    Sql.prototype.render = function () {
        return this._sql;
    };
    Object.defineProperty(Sql.prototype, "queryBuilder", {
        get: function () {
            return this._queryBuilder;
        },
        set: function (value) {
            this._queryBuilder = value;
        },
        enumerable: true,
        configurable: true
    });
    return Sql;
}());
exports["default"] = Sql;
