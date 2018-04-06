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
var From_1 = require("./From");
var Select = /** @class */ (function (_super) {
    __extends(Select, _super);
    function Select() {
        var _this = _super.call(this) || this;
        _this._columns = [];
        _this._joinColumns = [];
        _this._joinColumns = [];
        return _this;
    }
    Select.prototype.render = function () {
        // if (!this._from) {
        //     throw new TypeError('Missing FROM clause in SELECT statement: e.g. QB().select(columns).from(table)');
        // }
        var ownColumns = this.columns.map(function (column) { return column.render(); });
        var joinColumns = this.joinColumns.map(function (column) { return column.alias.render(); });
        var columns = ownColumns.concat(joinColumns);
        var sql = ['SELECT '];
        sql.push(columns.join(', '));
        if (this._from) sql.push(this._from.render());
        return sql.join(' ');
    };
    Object.defineProperty(Select.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        set: function (value) {
            this._columns = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Select.prototype, "joinColumns", {
        get: function () {
            return this._joinColumns;
        },
        set: function (value) {
            this._joinColumns = value;
        },
        enumerable: true,
        configurable: true
    });
    Select.prototype.from = function (table) {
        if (table === void 0) { table = null; }
        table = table === null ? this.queryBuilder.table : table;
        var from = new From_1["default"](table);
        from.queryBuilder = this.queryBuilder;
        from.queryBuilder.table = table;
        this._from = from;
        return from.queryBuilder;
    };
    Select.prototype.addJoinColumn = function (column) {
        this._joinColumns.push(column);
        return this;
    };
    Select.prototype.allColumns = function () {
        return this._columns.concat(this._joinColumns);
    };
    return Select;
}(Sql_1["default"]));
exports["default"] = Select;
