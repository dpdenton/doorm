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
var As_1 = require("./As");
var Column = /** @class */ (function (_super) {
    __extends(Column, _super);
    function Column(sql) {
        return _super.call(this, sql) || this;
    }
    Column.prototype.render = function () {
        var sql = [this._sql];
        sql.push(this._as.render());
        return sql.join(' ');
    };
    Object.defineProperty(Column.prototype, "sql", {
        get: function () {
            return this._sql;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "alias", {
        get: function () {
            return this._alias;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "pk", {
        get: function () {
            return this._pk;
        },
        set: function (value) {
            this._pk = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "table", {
        get: function () {
            return this._table;
        },
        set: function (value) {
            this._table = value;
        },
        enumerable: true,
        configurable: true
    });
    Column.prototype.getName = function () {
        return this._name;
    };
    Column.prototype.name = function (name) {
        this._name = name;
        return this;
    };
    Column.prototype.as = function (alias) {
        this._as = alias instanceof As_1["default"] ? alias : new As_1["default"](alias);
        this._alias = new Sql_1["default"](this._as.sql);
        return this;
    };
    Column.prototype.setPrimary = function () {
        this.pk = true;
        return this;
    };
    Column.prototype.isPrimary = function () {
        return this.pk;
    };
    Column.prototype.belongsTo = function (table) {
        return this.table.name === table.name;
    };
    return Column;
}(Sql_1["default"]));
exports["default"] = Column;
