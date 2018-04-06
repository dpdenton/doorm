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
var On_1 = require("./On");
var Sql_1 = require("./Sql");
var Join = /** @class */ (function (_super) {
    __extends(Join, _super);
    function Join(queryBuilder, child) {
        var _this = _super.call(this, child.render()) || this;
        _this._query = child;
        _this._queryBuilder = queryBuilder;
        // set defaults;
        _this._as = new As_1["default"]("\"" + child.table.name + "\"");
        _this._on = new On_1["default"](_this._getJoinCondition());
        // attach refs
        _this._as.queryBuilder = queryBuilder;
        _this._on.queryBuilder = queryBuilder;
        return _this;
    }
    Join.prototype.render = function () {
        var sql = ['JOIN'];
        sql.push("(" + this._sql + ")");
        sql.push(this._as.render());
        sql.push(this._on.render());
        return sql.join(' ');
    };
    Join.prototype.as = function (alias) {
        if (alias === void 0) { alias = ''; }
        this._as = typeof alias === 'string' ? new As_1["default"](alias) : alias;
        return this.queryBuilder;
    };
    Join.prototype.on = function (condition) {
        if (condition === void 0) { condition = ''; }
        // if on condition provided, then don't need to worry in join not found automatically
        this._error = null;
        this._on = typeof condition === 'string' ? new On_1["default"](condition) : condition;
        return this.queryBuilder;
    };
    Join.prototype._getJoinCondition = function () {
        // always use the alias, unless column is in table above
        var joinColumn, joinCondition;
        if (!joinColumn) {
            joinColumn = this.queryBuilder.getJoinColumn(this._query.table.foreignKey);
            if (joinColumn) {
                // join column exists in 'above' table so don't alias join column;
                var c1 = void 0;
                // column belongs to this query builder then DON'T alias
                if (this._queryBuilder.hasColumn(joinColumn)) {
                    c1 = joinColumn.sql;
                }
                else {
                    c1 = joinColumn.alias.render();
                }
                var c2 = this._query.table.primaryColumn.alias.render();
                joinCondition = c1 + " = " + c2;
            }
        }
        if (!joinColumn) {
            joinColumn = this._query.getJoinColumn(this.queryBuilder.table.foreignKey);
            if (joinColumn) {
                var c1 = joinColumn.alias.render();
                var c2 = this.queryBuilder.table.primaryColumn.sql; // always sql the querybuilder col
                joinCondition = c1 + " = " + c2;
            }
        }
        if (!joinColumn) {
            this._error = new Error('Unable to establish relationship!');
            //throw new Error('Unable to establish relationship!');
        }
        return joinCondition;
    };
    Object.defineProperty(Join.prototype, "query", {
        set: function (value) {
            this._query = value;
        },
        enumerable: true,
        configurable: true
    });
    return Join;
}(Sql_1["default"]));
exports["default"] = Join;
