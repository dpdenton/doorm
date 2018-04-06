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
var pluralize = require("pluralize");
var As_1 = require("./As");
var Sql_1 = require("./Sql");
var Table = /** @class */ (function (_super) {
    __extends(Table, _super);
    function Table(name, pk) {
        if (pk === void 0) { pk = 'id'; }
        var _this = _super.call(this, "\"" + name + "\"") || this;
        _this._columns = [];
        _this._tables = {};
        _this.byName = [];
        _this._as = new As_1["default"]("\"" + name + "\"");
        _this.pk = pk;
        _this.name = name;
        return _this;
    }
    Table.prototype.as = function (alias) {
        this._as = typeof alias === 'string' ? new As_1["default"](alias) : alias;
        return this;
    };
    Table.prototype.render = function () {
        var sql = [this._sql];
        sql.push(this._as.render());
        return sql.join(' ');
    };
    Object.defineProperty(Table.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "pk", {
        get: function () {
            return this._pk;
        },
        set: function (value) {
            this._pk = value;
        },
        enumerable: true,
        configurable: true
    });
    Table.prototype.getColumn = function (name) {
        for (var i = 0; i < this._columns.length; i++) {
            var column = this._columns[i];
            if (column.getName() === name)
                return column;
        }
        return null;
    };
    Object.defineProperty(Table.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        set: function (value) {
            this._columns = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "primaryColumn", {
        get: function () {
            return this._primaryColumn;
        },
        set: function (value) {
            this._primaryColumn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "foreignKey", {
        get: function () {
            return this._foreignKey;
        },
        enumerable: true,
        configurable: true
    });
    // isParentOf(child: Table): boolean {
    //     let isParent = false;
    //     child.columns.forEach(column => {
    //         if (column.name === this.foreignKey) isParent = true;
    //     });
    //     return isParent;
    // }
    //
    // getJoinColumn(child: Table): boolean {
    //     let joinColumn;
    //     child.columns.forEach(column => {
    //         if (column.name === this.foreignKey) joinColumn = column;
    //     });
    //     return joinColumn;
    // }
    Table.prototype.save = function (name) {
        if (name === void 0) { name = 'default'; }
        if (this.primaryColumn) {
            var pkName = this.primaryColumn.getName();
            this._foreignKey = pluralize.singular(this.name) + pkName.charAt(0).toUpperCase() + pkName.slice(1);
        }
        return this;
        //this.columns = [];
        //this._tables[name] = this.columns;
    };
    Table.prototype.get = function (name) {
        this.columns = this._tables[name];
        return this;
    };
    Table.prototype.addColumn = function (column) {
        if (column.isPrimary())
            this.primaryColumn = column;
        column.table = this;
        this.columns.push(column);
        this.byName[column.getName()] = column;
        return this;
    };
    Table.prototype.toString = function () {
        return this.name;
    };
    return Table;
}(Sql_1["default"]));
exports["default"] = Table;
