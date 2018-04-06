import Table from './Table';

interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    entries(): IterableIterator<[T, T]>;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    keys(): IterableIterator<T>;
    size: number;
    values(): IterableIterator<T>;
    [Symbol.iterator]():IterableIterator<T>;
}

interface SetConstructor {
    new <T>(): Set<T>;
    new <T>(iterable: Iterable<T>): Set<T>;
    prototype: Set<any>;
}

declare const Set: SetConstructor;

class ResponseParser {

    private _table: Table;
    private _byId = {};
    private _parsedIds = [];
    private _parsedIdsSet = new Set();
    private _includes = [];

    constructor(table: Table) {
        this.table = table;
    }


    get table(): Table {
        return this._table;
    }

    set table(value: Table) {
        this._table = value;
    }

    addInclude(responseParser: ResponseParser) {
        this._includes.push(responseParser);
    }

    parseRow(row, transientKey = 0) {

        const _pk = row[this.table.primaryColumn.key];

        const _transientKey = String(transientKey) + '_' + String(_pk);

        if (_pk === null) return null;

        // init pk object
        this._byId[_pk] = (this._byId[_pk]) ? this._byId[_pk] : {};

        this._parseIncludes(row, _pk, _transientKey);

        if (this._parsedIdsSet.has(_transientKey)) return; // already parsed

        return this._parseColumns(row, _pk, _transientKey);

    }

    _parseIncludes(row, pk, transientKey) {
        this._includes.forEach(orm => {

            // just create empty array so it's easier for client to render empty values...
            if (!this._byId[pk][orm.table.name]) this._byId[pk][orm.table.name] = [];

            const parsedRow = orm.parseRow(row, transientKey);
            if (parsedRow) {
                this._byId[pk][orm.table.name].push(parsedRow);
            }
        });
    }

    _parseColumns(row, pk, transientKey) {
        const parsedRow = {};
        this.table.columns.forEach(column => parsedRow[this._columnToKey(column)] = row[column.key]);
        this._byId[pk] = (<any>Object).assign({}, this._byId[pk], parsedRow);
        this._parsedIds.push(pk);
        this._parsedIdsSet.add(transientKey);
        return parsedRow;
    }

    _columnToKey(column) {
        return column.key.split('.')[1];
    }

}

export default ResponseParser;