import Sql from './Sql';
import As from './As';
import Table from './Table';

class Column extends Sql {

    // name is the attribute name, or whatever you want to call it e.g. reviewCount
    private _name: string;
    private _sqlName: string;
    private _pk: boolean;
    private _table: Table;

    private _as: As;

    private _alias: Sql;

    constructor(sql: string) {
        super(sql);
    }

    render() {
        const sql = [this._sql];
        sql.push(this._as.render());
        return sql.join(' ');
    }

    get sql() {
        return this._sql;
    }

    get alias() {
        return this._alias;
    }

    get pk(): boolean {
        return this._pk;
    }

    set pk(value: boolean) {
        this._pk = value;
    }

    get table(): Table {
        return this._table;
    }

    set table(value: Table) {
        this._table = value;
    }

    getName() {
        return this._name;
    }

    name(name: string) {
        this._name = name;
        return this;
    }

    as(alias: As | string): Column {
        this._as = alias instanceof As ? alias : new As(alias);
        this._alias =  new Sql(this._as.sql);
        return this;
    }

    setPrimary(): Column {
        this.pk = true;
        return this;
    }

    isPrimary(): boolean {
        return this.pk;
    }

    belongsTo(table: Table): boolean {
        return this.table.name === table.name;
    }

}

export default Column;