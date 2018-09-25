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
Object.defineProperty(exports, "__esModule", { value: true });
var options = {
    primaryKeyName: 'id',
    toForeignKeyFn: function (tableName, columnName) {
        return tableName + "Id";
    }
};
var BuildingBlock = /** @class */ (function () {
    function BuildingBlock(options) {
        this._blocks = [];
    }
    BuildingBlock.prototype.toString = function () {
        return this._toString();
    };
    BuildingBlock.prototype._sanitize = function (value) {
    };
    BuildingBlock.prototype._format = function (value) {
    };
    BuildingBlock.prototype._toString = function () {
        return this._blocks.map(function (block) { return block.toString(); }).join(' ');
    };
    return BuildingBlock;
}());
exports.BuildingBlock = BuildingBlock;
var StringBlock = /** @class */ (function (_super) {
    __extends(StringBlock, _super);
    function StringBlock(options) {
        return _super.call(this, options) || this;
    }
    StringBlock.prototype._toString = function () {
        return this._blocks.join(' ');
    };
    StringBlock.prototype.sql = function (sql) {
        this._blocks.push(sql);
        return this;
    };
    return StringBlock;
}(BuildingBlock));
exports.StringBlock = StringBlock;
var SelectBlock = /** @class */ (function (_super) {
    __extends(SelectBlock, _super);
    function SelectBlock(options) {
        var _this = _super.call(this, options) || this;
        var stringBlock = new StringBlock(options);
        stringBlock.sql('SELECT');
        _this._blocks.push(stringBlock);
        return _this;
    }
    SelectBlock.prototype._toString = function () {
        return this._blocks.map(function (block) { return block.toString(); });
    };
    return SelectBlock;
}(BuildingBlock));
exports.SelectBlock = SelectBlock;
var ColumnBlock = /** @class */ (function (_super) {
    __extends(ColumnBlock, _super);
    function ColumnBlock(options) {
        return _super.call(this, options) || this;
    }
    ColumnBlock.prototype.fields = function (columns) {
        columns.map(this.field.bind(this));
    };
    ColumnBlock.prototype.field = function (column, options) {
        if (options === void 0) { options = null; }
        var stringBlock = new StringBlock(options);
        stringBlock.sql(column);
        this._blocks.push(stringBlock);
        return this;
    };
    ColumnBlock.prototype.as = function (alias) {
        var aliasBlock = new AliasBlock(null);
        aliasBlock.as(alias);
        this._blocks.push(aliasBlock);
    };
    ColumnBlock.prototype._toString = function () {
        return _super.prototype._toString.call(this);
    };
    return ColumnBlock;
}(BuildingBlock));
exports.ColumnBlock = ColumnBlock;
var AliasBlock = /** @class */ (function (_super) {
    __extends(AliasBlock, _super);
    function AliasBlock(options) {
        var _this = _super.call(this, options) || this;
        var stringBlock = new StringBlock(null);
        stringBlock.sql('AS');
        _this._blocks.push(stringBlock);
        return _this;
    }
    AliasBlock.prototype.as = function (alias) {
        var stringBlock = new StringBlock(options);
        stringBlock.sql(alias);
        this._blocks.push(stringBlock);
        return this;
    };
    AliasBlock.prototype._toString = function () {
        return _super.prototype._toString.call(this);
    };
    return AliasBlock;
}(BuildingBlock));
exports.AliasBlock = AliasBlock;
var OnBlock = /** @class */ (function (_super) {
    __extends(OnBlock, _super);
    function OnBlock(options) {
        var _this = _super.call(this, options) || this;
        var stringBlock = new StringBlock(null);
        stringBlock.sql('ON');
        _this._blocks.push(stringBlock);
        return _this;
    }
    OnBlock.prototype.condition = function (condition) {
        var stringBlock = new StringBlock(options);
        stringBlock.sql(condition);
        this._blocks.push(stringBlock);
        return this;
    };
    OnBlock.prototype._toString = function () {
        return _super.prototype._toString.call(this);
    };
    return OnBlock;
}(BuildingBlock));
exports.OnBlock = OnBlock;
var TableBlock = /** @class */ (function (_super) {
    __extends(TableBlock, _super);
    function TableBlock(options) {
        var _this = _super.call(this, options) || this;
        var stringBlock = new StringBlock(null);
        stringBlock.sql('FROM');
        _this._blocks.push(stringBlock);
        return _this;
    }
    TableBlock.prototype.from = function (table) {
        var stringBlock = new StringBlock(options);
        stringBlock.sql(table);
        this._blocks.push(stringBlock);
        return this;
    };
    TableBlock.prototype.as = function (alias) {
        var aliasBlock = new AliasBlock(options).as(alias);
        this._blocks.push(aliasBlock);
        return this;
    };
    TableBlock.prototype._toString = function () {
        return _super.prototype._toString.call(this);
    };
    return TableBlock;
}(BuildingBlock));
exports.TableBlock = TableBlock;
var JoinBlock = /** @class */ (function (_super) {
    __extends(JoinBlock, _super);
    function JoinBlock(options, type) {
        if (type === void 0) { type = 'JOIN'; }
        var _this = _super.call(this, options) || this;
        var stringBlock = new StringBlock(null);
        stringBlock.sql(type);
        _this._blocks.push(stringBlock);
        return _this;
    }
    JoinBlock.prototype.join = function (query) {
        this._blocks.push(new StringBlock(null).sql('('));
        this._blocks.push(query);
        this._blocks.push(new StringBlock(null).sql(')'));
        return this;
    };
    JoinBlock.prototype.as = function (alias) {
        var aliasBlock = new AliasBlock(options).as(alias);
        this._blocks.push(aliasBlock);
        return this;
    };
    JoinBlock.prototype.on = function (condition) {
        var onBlock = new OnBlock(options);
        onBlock.condition(condition);
        this._blocks.push(onBlock);
        return this;
    };
    JoinBlock.prototype._toString = function () {
        return _super.prototype._toString.call(this);
    };
    return JoinBlock;
}(BuildingBlock));
exports.JoinBlock = JoinBlock;
/**
 * A Query is a BuildingBlock composed of other BuildingBlocks created through the classes public methods.
 * Queries can be composed of other queries.
 */
var Query = /** @class */ (function (_super) {
    __extends(Query, _super);
    function Query(options) {
        if (options === void 0) { options = {}; }
        return _super.call(this, options) || this;
    }
    Query.prototype._toString = function () {
        return _super.prototype._toString.call(this);
    };
    Query.prototype.getManager = function () {
        return this._queryManager;
    };
    return Query;
}(BuildingBlock));
exports.Query = Query;
var ColumnQuery = /** @class */ (function (_super) {
    __extends(ColumnQuery, _super);
    function ColumnQuery(options, queryManager) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this._queryManager = queryManager || new QueryManager(_this);
        return _this;
    }
    /**
     * Dynamically create blocks when string is generated to ensure the correct columns are included
     * in each query and they are aliased correctly.
     * @returns {string}
     * @private
     */
    ColumnQuery.prototype._toString = function () {
        this._pushBlocks(this.getManager().getColumns().filter(this._filterColumn.bind(this)).map(this._toBlock.bind(this)));
        return _super.prototype._toString.call(this);
    };
    ColumnQuery.prototype._filterColumn = function (column) {
        // if this is the root query (i.e doesn't have any parents) then we don't need to include
        // the foreign key columns. Something to include in options.
        var isRootAndForeignKey = this.getManager().getParents().length === 0 && column.isForeignKey;
        return !isRootAndForeignKey;
    };
    ColumnQuery.prototype._toBlock = function (column) {
        // if own column then sql AS alias
        if (this.getManager().isOwnColumn(column)) {
            var columnBlock = new ColumnBlock(null);
            columnBlock.field(column.getSql()).as(column.getAlias());
            return columnBlock;
        }
        else if (this.getManager().isJoinColumn(column)) {
            var columnBlock = new ColumnBlock(null);
            columnBlock.field(column.getAlias());
            return columnBlock;
        }
        else {
            throw new Error("Orphaned column found: " + column.name);
        }
    };
    ColumnQuery.prototype._pushBlocks = function (columnBlocks) {
        columnBlocks.forEach(this._pushBlock.bind(this));
    };
    ColumnQuery.prototype._pushBlock = function (columnBlock, index, array) {
        this._blocks.push(columnBlock);
        // add comma between each block except last
        if (array.length - 1 !== index) {
            var stringBlock = new StringBlock(null);
            stringBlock.sql(',');
            this._blocks.push(stringBlock);
        }
    };
    return ColumnQuery;
}(Query));
exports.ColumnQuery = ColumnQuery;
var SelectQuery = /** @class */ (function (_super) {
    __extends(SelectQuery, _super);
    function SelectQuery(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this._queryManager = new QueryManager(_this);
        // set SELECT statement at start
        var selectBlock = new SelectBlock(options);
        _this._blocks.push(selectBlock);
        return _this;
    }
    SelectQuery.prototype.columns = function (columns) {
        columns.forEach(this.getManager().addOwnColumn.bind(this.getManager()));
        var columnQuery = new ColumnQuery(null, this.getManager());
        this._blocks.push(columnQuery);
        return this;
    };
    SelectQuery.prototype.from = function (table) {
        // set blocks
        var tableBlock = new TableBlock(options);
        tableBlock.from(table.getSql());
        this._blocks.push(tableBlock);
        // update manager
        this.getManager().setTable(table);
        return this;
    };
    SelectQuery.prototype.join = function (query, condition, alias) {
        if (condition === void 0) { condition = null; }
        if (alias === void 0) { alias = null; }
        // add join columns to parent query
        query.getManager().getColumns().forEach(this.getManager().addJoinColumn.bind(this.getManager()));
        // get condition
        condition = condition || this.getManager().getJoinCondition(query);
        // give the child query some parents (and grandparents ...)
        var parents = this.getManager().getParents().concat(this.getManager().getQuery());
        query.getManager().inheritParents(parents);
        // user the child query's manager to get join alias, as it used that table's name / alias
        alias = alias || query.getManager().getJoinAlias();
        var joinBlock = new JoinBlock({});
        joinBlock.join(query).as(alias).on(condition);
        this._blocks.push(joinBlock);
        return this;
    };
    SelectQuery.prototype._toString = function () {
        return _super.prototype._toString.call(this);
    };
    return SelectQuery;
}(Query));
exports.SelectQuery = SelectQuery;
var RelationshipType;
(function (RelationshipType) {
    RelationshipType[RelationshipType["hasOne"] = 0] = "hasOne";
    RelationshipType[RelationshipType["hasMany"] = 1] = "hasMany";
})(RelationshipType || (RelationshipType = {}));
var QueryManager = /** @class */ (function () {
    function QueryManager(query, isRoot) {
        if (isRoot === void 0) { isRoot = true; }
        this._parents = [];
        this._query = query;
        this._table = null;
        this._columns = [];
        this._ownColumns = [];
        this._joinColumns = [];
        this._relations = [];
        this._isRoot = isRoot;
    }
    QueryManager.prototype.setTable = function (table) {
        this._table = table;
    };
    QueryManager.prototype.getTable = function () {
        return this._table;
    };
    QueryManager.prototype.addOwnColumn = function (column) {
        this._ownColumns.push(column);
        this._columns.push(column);
    };
    QueryManager.prototype.addJoinColumn = function (column) {
        this._joinColumns.push(column);
        this._columns.push(column);
    };
    QueryManager.prototype.inheritParents = function (parents) {
        var _this = this;
        parents.forEach(function (parent) {
            _this._parents.push(parent);
        });
    };
    QueryManager.prototype.getQuery = function () {
        return this._query;
    };
    QueryManager.prototype.getParents = function () {
        return this._parents;
    };
    QueryManager.prototype.getColumns = function () {
        return this._columns;
    };
    QueryManager.prototype.getOwnColumns = function () {
        return this._ownColumns;
    };
    QueryManager.prototype.getJoinColumns = function () {
        return this._joinColumns;
    };
    QueryManager.prototype.getRelations = function () {
        return this._relations;
    };
    QueryManager.prototype.isOwnColumn = function (column) {
        return this.getOwnColumns().some(function (c) { return c === column; });
    };
    QueryManager.prototype.isJoinColumn = function (column) {
        return this.getJoinColumns().some(function (c) { return c === column; });
    };
    QueryManager.prototype._getJoinCondition = function (relationship) {
        if (relationship.type === RelationshipType.hasMany) {
            /*

            If has many relation then this primary key will appear on the relation's table
            The foreign key is generated using a function defined in options

            e.g. User Table

            id, name, dob

            Task Table

            id, name, dealine, UserId

            JOIN ON User.id = Task.UserId
             */
            var leftCondition = this.getPrimaryColumn().getSql();
            var rightCondition = this._buildJoinCondition(relationship.query.getManager().getTable().getName(), this.getPrimaryColumn().toForeignKey());
            return leftCondition + " = " + rightCondition;
        }
        if (relationship.type === RelationshipType.hasOne) {
            /*

            If 'has one' then the relation's primary key will be a foreign key on this table.

            e.g. User Table

            id, name, dob, TaskId

            Task Table

            id, name, dealine

            JOIN ON Task.id = User.TaskId
             */
            var leftCondition = this._buildJoinCondition(relationship.query.getManager().getTable().getName(), relationship.query.getManager().getPrimaryColumn().getName());
            var rightCondition = this._buildJoinCondition(this.getTable().getName(), relationship.query.getManager().getPrimaryColumn().toForeignKey());
            return leftCondition + " = " + rightCondition;
        }
    };
    QueryManager.prototype.getJoinAlias = function () {
        // not sure about this - need to do some more research about aliasing joins...
        var joinAlias;
        if (!joinAlias) {
            joinAlias = this.getTable().getAlias();
        }
        if (!joinAlias) {
            joinAlias = this.getTable().getName();
        }
        return "\"" + joinAlias + "\"";
    };
    QueryManager.prototype.getJoinCondition = function (query) {
        var relationship = this._getRelationship(query);
        this._relations.push(relationship);
        return this._getJoinCondition.call(relationship.this, relationship);
    };
    QueryManager.prototype._getRelationship = function (query) {
        var relationship;
        if (this.hasMany(query)) {
            relationship = {
                this: this,
                query: query,
                type: RelationshipType.hasMany,
            };
        }
        if (relationship) {
            this._relations.push(relationship);
            return relationship;
        }
        if (query.getManager().hasMany(this._query)) {
            relationship = {
                this: this,
                query: query,
                type: RelationshipType.hasOne
            };
        }
        if (relationship) {
            this._relations.push(relationship);
            return relationship;
        }
        // look in child queries to see if relationship is in there
        var relations = this.getRelations();
        for (var i = 0; i < relations.length; i++) {
            var relationship_1 = relations[i].query.getManager()._getRelationship(query);
            if (relationship_1) {
                return relationship_1;
            }
        }
        throw Error('Cannot find relation!');
    };
    QueryManager.prototype.addRelationship = function (relationship) {
        this._relations.push(relationship);
        return this;
    };
    QueryManager.prototype.getPrimaryColumn = function () {
        return this.getTable().getPrimaryColumn();
    };
    QueryManager.prototype._buildColumnAlias = function (column) {
        return this._buildParentKey() + "." + column.name;
    };
    QueryManager.prototype._buildParentKey = function () {
        return this._parents.join('.');
    };
    /**
     * Determine if this query has many joined queries.
     * This is the case if the query table's primary key is a foreign key on the joined query.
     *
     * @param {Query} query
     * @returns {boolean}
     * @public
     */
    QueryManager.prototype.hasMany = function (relation) {
        var columns = relation.getManager().getOwnColumns();
        var foreignKeyName = this.getPrimaryColumn().toForeignKey();
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            console.log('Searching for join Columns: %', {
                column: column.getName(),
                foreignKeyName: foreignKeyName,
            });
            if (column.getName() === foreignKeyName) {
                column.setIsForeignKey(true);
                return true;
            }
        }
        return false;
    };
    QueryManager.prototype._buildJoinCondition = function (tableName, columnName) {
        return "\"" + tableName + "." + columnName + "\"";
    };
    return QueryManager;
}());
exports.QueryManager = QueryManager;
var DataItem = /** @class */ (function () {
    function DataItem(name) {
        this._name = name;
        this._transientKey = 'random';
    }
    DataItem.prototype.getName = function () {
        return this._name;
    };
    DataItem.prototype.as = function (alias) {
        this._alias = alias;
        return this;
    };
    DataItem.prototype.sql = function (sql) {
        this._sql = sql;
        return this;
    };
    DataItem.prototype.getSql = function () {
        return this._sql;
    };
    DataItem.prototype.getAlias = function () {
        return this._alias;
    };
    return DataItem;
}());
exports.DataItem = DataItem;
var DataTable = /** @class */ (function (_super) {
    __extends(DataTable, _super);
    function DataTable(name) {
        var _this = _super.call(this, name) || this;
        _this._dataColumns = [];
        return _this;
    }
    DataTable.prototype.addDataColumn = function (dataColumn) {
        dataColumn.setDataTable(this);
        this._dataColumns.push(dataColumn);
        if (dataColumn.isPrimary)
            this.setPrimaryColumn(dataColumn);
        return this;
    };
    DataTable.prototype.getDataColumns = function () {
        return this._dataColumns;
    };
    DataTable.prototype.getPrimaryColumn = function () {
        return this._primaryColumn;
    };
    DataTable.prototype.setPrimaryColumn = function (column) {
        this._primaryColumn = column;
    };
    return DataTable;
}(DataItem));
exports.DataTable = DataTable;
var DataColumn = /** @class */ (function (_super) {
    __extends(DataColumn, _super);
    function DataColumn(name) {
        var _this = _super.call(this, name) || this;
        _this.setIsPrimary(name === options.primaryKeyName);
        _this.setIsForeignKey(false);
        return _this;
    }
    Object.defineProperty(DataColumn.prototype, "isPrimary", {
        get: function () {
            return this._isPrimary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataColumn.prototype, "isForeignKey", {
        get: function () {
            return this._isForeignKey;
        },
        enumerable: true,
        configurable: true
    });
    DataColumn.prototype.setKey = function (key) {
        this._key = key;
    };
    DataColumn.prototype.setDataTable = function (dataTable) {
        this._dataTable = dataTable;
    };
    DataColumn.prototype.setIsPrimary = function (value) {
        this._isPrimary = value;
    };
    DataColumn.prototype.setIsForeignKey = function (value) {
        this._isForeignKey = value;
    };
    DataColumn.prototype.toForeignKey = function () {
        return options.toForeignKeyFn(this._dataTable.getName(), this.getName());
    };
    return DataColumn;
}(DataItem));
exports.DataColumn = DataColumn;
