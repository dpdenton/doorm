import As from './As';
import On from './On';
import Sql from './Sql';
import QueryBuilder from '../QueryBuilder';

class Join extends Sql {

    private _on: On;
    private _as: As;
    private _query: QueryBuilder;

    constructor(queryBuilder: QueryBuilder, child: QueryBuilder) {
        super(child.render());

        this._query = child;
        this._queryBuilder = queryBuilder;

        // set defaults;
        this._as = new As(`"${child.table.name}"`);
        this._on = new On(this._getJoinCondition());

        // attach refs
        this._as.queryBuilder = queryBuilder;
        this._on.queryBuilder = queryBuilder;
    }

    render() {

        const sql = ['JOIN'];
        sql.push(`(${this._sql})`);
        sql.push(this._as.render());
        sql.push(this._on.render());
        return sql.join(' ');
    }

    as(alias: As | string = ''): QueryBuilder {

        this._as = typeof alias === 'string' ? new As(alias): alias;
        return this.queryBuilder;
    }

    on(condition: On | string = ''): QueryBuilder {

        // if on condition provided, then don't need to worry in join not found automatically
        this._error = null;
        this._on = typeof condition === 'string' ? new On(condition): condition;
        return this.queryBuilder;
    }

    private _getJoinCondition(): string {

        // always use the alias, unless column is in table above
        let joinColumn, joinCondition;

        if (!joinColumn) {
            joinColumn = this.queryBuilder.getJoinColumn(this._query.table.foreignKey);

            if (joinColumn) {
                // join column exists in 'above' table so don't alias join column;

                let c1;

                // column belongs to this query builder then DON'T alias
                if (this._queryBuilder.hasColumn(joinColumn)) {
                    c1 = joinColumn.sql;
                } else {
                    c1 = joinColumn.alias.render();
                }

                const c2 = this._query.table.primaryColumn.alias.render();
                joinCondition = `${c1} = ${c2}`;
            }
        }
        if (!joinColumn) {
            joinColumn = this._query.getJoinColumn(this.queryBuilder.table.foreignKey);
            if (joinColumn) {
                const c1 = joinColumn.alias.render();
                const c2 = this.queryBuilder.table.primaryColumn.sql; // always sql the querybuilder col
                joinCondition = `${c1} = ${c2}`;
            }
        }

        if (!joinColumn) {
            this._error = new Error('Unable to establish relationship!');
            //throw new Error('Unable to establish relationship!');
        }

        return joinCondition;
    }

    set query(value: QueryBuilder) {
        this._query = value;
    }

}

export default Join;
