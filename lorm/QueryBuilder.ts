import * as Sql from './Sql';

import {ActionType} from './@types';
import {Query} from 'pg';

class QueryBuilder {

    public _sql: string;

    private _table: Sql.Table;
    protected _dialect: string;
    protected _actions: Sql.Action[] = [];
    protected _sqlItems: string[] = [];
    protected _includes: QueryBuilder[] = [];
    protected _rootTable: Sql.Table;
    protected _queries: {
        [k: string]: {
            _actions: Sql.Action[],
            _includes: QueryBuilder[],
        }
    } = {};
    protected _select: Sql.Select;
    protected _selectColumns: Sql.Column[] = [];

    constructor(table: Sql.Table = null) {
        this._table = table;
    }

    render() {
        return this.actions.map(action => {
            if (action.payload._error) {
                throw action.payload._error;
            }
            return action.payload.render()
        }).join(' ');
    }

    select(columns: Sql.Column[] = null): QueryBuilder {

        columns = columns === null ? this._table.columns : columns;

        // associate this query builder with each column
        columns.forEach(column => column.queryBuilder = this);

        this._select = new Sql.Select();
        this._select.queryBuilder = this;

        this._selectColumns = this._selectColumns.concat(columns);
        this._select.columns = this._selectColumns;

        const action = new Sql.Action(ActionType.SELECT);
        action.payload = this._select;
        this.addAction(action);

        return this;
    }

    join(queryBuilder: QueryBuilder): QueryBuilder {

        // add columns from join
        queryBuilder._select.columns.forEach((c) => this._select.addJoinColumn(c));
        queryBuilder._select.joinColumns.forEach((c) => this._select.addJoinColumn(c));

        // create join query
        const join = new Sql.Join(this, queryBuilder);
        join.query = queryBuilder;
        join.queryBuilder = this;

        // create query action and append
        const action = new Sql.Action(ActionType.JOIN);
        action.payload = join;
        this.addAction(action);

        // include queryBuilder
        this.includes.push(queryBuilder);

        return this;
    }

    as(alias: Sql.As | string = ''): QueryBuilder {

        // get previous action and assert it's a join or from; otherwise throw an error
        const previousAction = this._getPreviousAction();

        if (previousAction.payload instanceof Sql.From || previousAction.payload instanceof Sql.Join) {
            previousAction.payload.as(alias);
            return this;
        }

        throw new TypeError('Can only alias a JOIN or FROM statement!');
    }

    on(condition: Sql.On | string = ''): QueryBuilder {

        // get previous action and assert it's a join or from; otherwise throw an error
        const previousAction = this._getPreviousAction();

        if (previousAction.payload instanceof Sql.Join) {
            previousAction.payload.on(condition);
            return this;
        }

        throw new TypeError('Can only ON a JOIN statement!');
    }

    where(sql: string) {
        const action = new Sql.Action(ActionType.WHERE);
        action.payload = sql;
        this.addAction(action);
        return this;
    }

    sql(query: string) {

        const sql = new Sql.Sql(query);

        const action = new Sql.Action(ActionType.SQL);
        action.payload = sql;
        this.addAction(action);
        return this;
    }

    groupBy(column: Sql.Column) {
        const action = new Sql.Action(ActionType.GROUP);
        action.payload = column;
        this.addAction(action);
        return this;
    }

    include(queryBuilder: QueryBuilder) {
        queryBuilder._rootTable = this.table;
        this.includes.push(queryBuilder);
        const action = new Sql.Action(ActionType.SQL);
        action.payload = queryBuilder;
        this.addAction(action);
    }

    hasColumn(c: Sql.Column): boolean {
        for (let i = 0; i < this._select.columns.length; i++) {
            const column = this._select.columns[i];
            if (c.getName() === column.getName()) {
                return true;
            }
        }
        return false;
    }

    getJoinColumn(foreignKey: string): Sql.Column {
        const columns = this._select.allColumns();
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            if (column.getName() === foreignKey) {
                return column;
            }
        }
    }

    /**
     /* DFS algorithm that returns the columns from each node to its parent node to link all columns*
     */
    generateSelectColumns(): Sql.Column[] {

        // base case
        if (this.includes.length === 0) {
            return this._selectColumns;
        }

        for (let i = 0; i < this.includes.length; i++) {
            const queryBuilder: QueryBuilder = this.includes[i];
            this._selectColumns = this._selectColumns.concat(queryBuilder.generateSelectColumns());
        }

        return this._selectColumns;
    }

    save(name: string = 'default'): void {

        this._queries[name] = {
            _actions: this._actions,
            _includes: this._includes,
        };
        this._actions = [];
        this._includes = [];
    }

    get(name: string = 'default'): QueryBuilder {
        const {_actions, _includes} = this._queries[name];
        this._actions = _actions;
        this._includes = _includes;
        return this;
    }

    protected _getPreviousAction(): Sql.Action {
        return this.actions[this.actions.length - 1];
    }

    protected addSelectColumns(columns: Sql.Column[]) {
        this._selectColumns.concat(columns);
        return this;
    }

    protected addSelectColumn(column: Sql.Column) {
        this._selectColumns.push(column);
        return this;
    }

    protected get actions(): Sql.Action[] {
        return this._actions;
    }

    protected get includes(): QueryBuilder[] {
        return this._includes;
    }

    protected get sqlItems(): string[] {
        return this._sqlItems;
    }

    public get table(): Sql.Table {
        return this._table;
    }

    public set table(value: Sql.Table) {
        this._table = value;
    }

    public addAction(action: Sql.Action): QueryBuilder {
        this._actions.push(action);
        return this;
    }

}

export default QueryBuilder;