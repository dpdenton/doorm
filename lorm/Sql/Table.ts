import * as pluralize from 'pluralize';

import As from './As';
import Sql from './Sql';
import Column from './Column';

class Table extends Sql {

    private _as: As;
    private _pk: string;
    private _name: string;
    private _columns: Column[] = [];
    private _primaryColumn: Column;
    private _foreignKey: string;
    private _tables: { [k: string]: Column[] } = {};

    public byName: any = [];

    constructor(name: string, pk='id') {
        super(`"${name}"`);
        this._as = new As(`"${name}"`);
        this.pk = pk;
        this.name = name;
    }

    as(alias: As | string) {
        this._as = typeof alias === 'string' ? new As(alias) : alias;
        return this;
    }

    render() {
        const sql =[this._sql];
        sql.push(this._as.render());
        return sql.join(' ');
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get pk(): string {
        return this._pk;
    }

    set pk(value: string) {
        this._pk = value;
    }

    getColumn(name: string): Column {
        for (let i=0; i < this._columns.length; i++) {
            const column = this._columns[i];
            if (column.getName() === name) return column;
        }
        return null;
    }

    get columns(): Column[] {
        return this._columns;
    }

    set columns(value: Column[]) {
        this._columns = value;
    }

    get primaryColumn(): Column {
        return this._primaryColumn;
    }

    set primaryColumn(value: Column) {
        this._primaryColumn = value;
    }

    get foreignKey(): string {
        return this._foreignKey;
    }

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

    save(name: string = 'default'): Table {
        if (this.primaryColumn) {
            const pkName = this.primaryColumn.getName();
            this._foreignKey = pluralize.singular(this.name) + pkName.charAt(0).toUpperCase() + pkName.slice(1);
        }
        return this;
        //this.columns = [];
        //this._tables[name] = this.columns;
    }

    get(name: string): Table {
        this.columns = this._tables[name];
        return this;
    }

    addColumn(column: Column): Table {
        if (column.isPrimary()) this.primaryColumn = column;
        column.table = this;
        this.columns.push(column);
        this.byName[column.getName()] = column;
        return this;
    }

    toString(): string {
        return this.name;
    }
}

export default Table;