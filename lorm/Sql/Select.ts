import Sql from './Sql';
import From from './From';
import Table from './Table';
import Column from './Column';
import QueryBuilder from '../QueryBuilder';

class Select extends Sql {

    private _from: From;
    private _columns: Column[] = [];
    private _joinColumns: Column[] = [];

    constructor() {
        super();
        this._joinColumns = [];
    }

    render() {

        // if (!this._from) {
        //     throw new TypeError('Missing FROM clause in SELECT statement: e.g. QB().select(columns).from(table)');
        // }

        const ownColumns = this.columns.map(column => column.render());
        const joinColumns = this.joinColumns.map(column => column.alias.render());
        const columns = ownColumns.concat(joinColumns);

        const sql = ['SELECT '];
        sql.push(columns.join(', '));
        sql.push(this._from.render());
        return sql.join(' ');
    }

    get columns(): Column[] {
        return this._columns;
    }

    set columns(value: Column[]) {
        this._columns = value;
    }

    get joinColumns(): Column[] {
        return this._joinColumns;
    }

    set joinColumns(value: Column[]) {
        this._joinColumns = value;
    }

    from(table: Table = null): QueryBuilder {

        table = table === null ? this.queryBuilder.table : table;

        const from = new From(table);
        from.queryBuilder = this.queryBuilder;
        from.queryBuilder.table = table;

        this._from = from;

        return from.queryBuilder;

    }

    addJoinColumn(column: Column) {
        this._joinColumns.push(column);
        return this;
    }

    allColumns(): Column[] {
        return this._columns.concat(this._joinColumns);
    }
}

export default Select;