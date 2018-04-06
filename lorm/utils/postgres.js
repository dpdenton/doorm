"use strict";
exports.__esModule = true;
var pg = require("pg");
var Table_1 = require("../Sql/Table");
var Column_1 = require("../Sql/Column");
exports.columnToSql = function (tableName, columnName) {
    return "\"" + tableName + "\".\"" + columnName + "\"";
};
exports.columnToAlias = function (tableName, columnName) {
    return "\"" + tableName + "." + columnName + "\"";
};
exports.createTable = function (_a) {
    var tableName = _a.tableName, pk = _a.pk, include = _a.include;
    var client = new pg.Client({
        user: 'dpd',
        database: 'hubbite',
        host: 'localhost'
    });
    return client.connect().then(function () {
        return client.query("select column_name from INFORMATION_SCHEMA.COLUMNS where table_name = '" + tableName + "'");
    }).then(function (res) {
        var table = new Table_1["default"](tableName, pk);
        include.push(pk);
        var filterFn = function (row) { return include.indexOf(row.column_name) !== -1; };
        res.rows.filter(filterFn).forEach(function (row) {
            var sql = exports.columnToSql(tableName, row.column_name);
            var alias = exports.columnToAlias(tableName, row.column_name);
            var column = new Column_1["default"](sql).as(alias).name(row.column_name);
            if (column.getName() === pk)
                column.setPrimary();
            table.addColumn(column);
        });
        table.save();
        client.end();
        return table;
    })["catch"](function (err) {
        client.end();
        return err;
    });
};
