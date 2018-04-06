"use strict";
exports.__esModule = true;
var Sql = require("./Sql");
var _types_1 = require("./@types");
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder(table) {
        if (table === void 0) { table = null; }
        this._actions = [];
        this._sqlItems = [];
        this._includes = [];
        this._queries = {};
        this._selectColumns = [];
        this._table = table;
    }
    QueryBuilder.prototype.render = function () {
        return this.actions.map(function (action) {
            if (action.payload._error) {
                throw action.payload._error;
            }
            return action.payload.render();
        }).join(' ');
    };
    QueryBuilder.prototype.select = function (columns) {
        var _this = this;
        if (columns === void 0) { columns = null; }
        columns = columns === null ? this._table.columns : columns;
        // associate this query builder with each column
        columns.forEach(function (column) { return column.queryBuilder = _this; });
        this._select = new Sql.Select();
        this._select.queryBuilder = this;
        this._selectColumns = this._selectColumns.concat(columns);
        this._select.columns = this._selectColumns;
        var action = new Sql.Action(_types_1.ActionType.SELECT);
        action.payload = this._select;
        this.addAction(action);
        return this;
    };
    QueryBuilder.prototype.join = function (queryBuilder) {
        var _this = this;
        // add columns from join
        queryBuilder._select.columns.forEach(function (c) { return _this._select.addJoinColumn(c); });
        queryBuilder._select.joinColumns.forEach(function (c) { return _this._select.addJoinColumn(c); });
        // create join query
        var join = new Sql.Join(this, queryBuilder);
        join.query = queryBuilder;
        join.queryBuilder = this;
        // create query action and append
        var action = new Sql.Action(_types_1.ActionType.JOIN);
        action.payload = join;
        this.addAction(action);
        // include queryBuilder
        this.includes.push(queryBuilder);
        return this;
    };
    QueryBuilder.prototype.as = function (alias) {
        if (alias === void 0) { alias = ''; }
        // get previous action and assert it's a join or from; otherwise throw an error
        var previousAction = this._getPreviousAction();
        if (previousAction.payload instanceof Sql.From || previousAction.payload instanceof Sql.Join) {
            previousAction.payload.as(alias);
            return this;
        }
        throw new TypeError('Can only alias a JOIN or FROM statement!');
    };
    QueryBuilder.prototype.on = function (condition) {
        if (condition === void 0) { condition = ''; }
        // get previous action and assert it's a join or from; otherwise throw an error
        var previousAction = this._getPreviousAction();
        if (previousAction.payload instanceof Sql.Join) {
            previousAction.payload.on(condition);
            return this;
        }
        throw new TypeError('Can only ON a JOIN statement!');
    };
    QueryBuilder.prototype.where = function (sql) {
        var action = new Sql.Action(_types_1.ActionType.WHERE);
        action.payload = sql;
        this.addAction(action);
        return this;
    };
    QueryBuilder.prototype.sql = function (query) {
        var sql = new Sql.Sql(query);
        var action = new Sql.Action(_types_1.ActionType.SQL);
        action.payload = sql;
        this.addAction(action);
        return this;
    };
    QueryBuilder.prototype.groupBy = function (column) {
        var action = new Sql.Action(_types_1.ActionType.GROUP);
        action.payload = column;
        this.addAction(action);
        return this;
    };
    QueryBuilder.prototype.include = function (queryBuilder) {
        queryBuilder._rootTable = this.table;
        this.includes.push(queryBuilder);
        var action = new Sql.Action(_types_1.ActionType.SQL);
        action.payload = queryBuilder;
        this.addAction(action);
    };
    QueryBuilder.prototype.hasColumn = function (c) {
        for (var i = 0; i < this._select.columns.length; i++) {
            var column = this._select.columns[i];
            if (c.getName() === column.getName()) {
                return true;
            }
        }
        return false;
    };
    QueryBuilder.prototype.getJoinColumn = function (foreignKey) {
        var columns = this._select.allColumns();
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (column.getName() === foreignKey) {
                return column;
            }
        }
    };
    /**
     /* DFS algorithm that returns the columns from each node to its parent node to link all columns*
     */
    QueryBuilder.prototype.generateSelectColumns = function () {
        // base case
        if (this.includes.length === 0) {
            return this._selectColumns;
        }
        for (var i = 0; i < this.includes.length; i++) {
            var queryBuilder = this.includes[i];
            this._selectColumns = this._selectColumns.concat(queryBuilder.generateSelectColumns());
        }
        return this._selectColumns;
    };
    QueryBuilder.prototype.save = function (name) {
        if (name === void 0) { name = 'default'; }
        this._queries[name] = {
            _actions: this._actions,
            _includes: this._includes
        };
        this._actions = [];
        this._includes = [];
    };
    QueryBuilder.prototype.get = function (name) {
        if (name === void 0) { name = 'default'; }
        var _a = this._queries[name], _actions = _a._actions, _includes = _a._includes;
        this._actions = _actions;
        this._includes = _includes;
        return this;
    };
    QueryBuilder.prototype._getPreviousAction = function () {
        return this.actions[this.actions.length - 1];
    };
    QueryBuilder.prototype.addSelectColumns = function (columns) {
        this._selectColumns.concat(columns);
        return this;
    };
    QueryBuilder.prototype.addSelectColumn = function (column) {
        this._selectColumns.push(column);
        return this;
    };
    Object.defineProperty(QueryBuilder.prototype, "actions", {
        get: function () {
            return this._actions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder.prototype, "includes", {
        get: function () {
            return this._includes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder.prototype, "sqlItems", {
        get: function () {
            return this._sqlItems;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder.prototype, "table", {
        get: function () {
            return this._table;
        },
        set: function (value) {
            this._table = value;
        },
        enumerable: true,
        configurable: true
    });
    QueryBuilder.prototype.addAction = function (action) {
        this._actions.push(action);
        return this;
    };
    return QueryBuilder;
}());
exports["default"] = QueryBuilder;
