"use strict";
exports.__esModule = true;
var ResponseParser = /** @class */ (function () {
    function ResponseParser(table) {
        this._byId = {};
        this._parsedIds = [];
        this._parsedIdsSet = new Set();
        this._includes = [];
        this.table = table;
    }
    Object.defineProperty(ResponseParser.prototype, "table", {
        get: function () {
            return this._table;
        },
        set: function (value) {
            this._table = value;
        },
        enumerable: true,
        configurable: true
    });
    ResponseParser.prototype.addInclude = function (responseParser) {
        this._includes.push(responseParser);
    };
    ResponseParser.prototype.parseRow = function (row, transientKey) {
        if (transientKey === void 0) { transientKey = 0; }
        var _pk = row[this.table.primaryColumn.key];
        var _transientKey = String(transientKey) + '_' + String(_pk);
        if (_pk === null)
            return null;
        // init pk object
        this._byId[_pk] = (this._byId[_pk]) ? this._byId[_pk] : {};
        this._parseIncludes(row, _pk, _transientKey);
        if (this._parsedIdsSet.has(_transientKey))
            return; // already parsed
        return this._parseColumns(row, _pk, _transientKey);
    };
    ResponseParser.prototype._parseIncludes = function (row, pk, transientKey) {
        var _this = this;
        this._includes.forEach(function (orm) {
            // just create empty array so it's easier for client to render empty values...
            if (!_this._byId[pk][orm.table.name])
                _this._byId[pk][orm.table.name] = [];
            var parsedRow = orm.parseRow(row, transientKey);
            if (parsedRow) {
                _this._byId[pk][orm.table.name].push(parsedRow);
            }
        });
    };
    ResponseParser.prototype._parseColumns = function (row, pk, transientKey) {
        var _this = this;
        var parsedRow = {};
        this.table.columns.forEach(function (column) { return parsedRow[_this._columnToKey(column)] = row[column.key]; });
        this._byId[pk] = Object.assign({}, this._byId[pk], parsedRow);
        this._parsedIds.push(pk);
        this._parsedIdsSet.add(transientKey);
        return parsedRow;
    };
    ResponseParser.prototype._columnToKey = function (column) {
        return column.key.split('.')[1];
    };
    return ResponseParser;
}());
exports["default"] = ResponseParser;
