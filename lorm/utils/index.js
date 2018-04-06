"use strict";
exports.__esModule = true;
exports.replaceAll = function (string, search, replacement) {
    return string.split(search).join(replacement);
};
exports.isParent = function (a, b) {
    a.columns.forEach(function (column) {
        if (column.name === b.foreignKey) {
            return true;
        }
    });
    return false;
};
