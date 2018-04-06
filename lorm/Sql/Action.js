"use strict";
exports.__esModule = true;
var QueryAction = /** @class */ (function () {
    function QueryAction(type) {
        this._type = type;
    }
    Object.defineProperty(QueryAction.prototype, "payload", {
        get: function () {
            return this._payload;
        },
        set: function (value) {
            this._payload = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryAction.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (value) {
            this._type = value;
        },
        enumerable: true,
        configurable: true
    });
    return QueryAction;
}());
exports["default"] = QueryAction;
