import QueryBuilder from '../QueryBuilder';

class Sql {

    protected _sql: string;
    protected _queryBuilder: QueryBuilder;
    protected _error: Error;

    constructor(sql: string = '') {
        this._error = null;
        this._sql = sql;
    }

    render() {
        return this._sql;
    }

    public get queryBuilder(): QueryBuilder {
        return this._queryBuilder;
    }

    public set queryBuilder(value: QueryBuilder) {
        this._queryBuilder = value;
    }
}

export default Sql;