import As from './As';
import Sql from './Sql';
import Table from './Table';

class From extends Sql {

    private _as: As;

    constructor(table: Table) {
        // set default alias
        super(table.render());
        this._as = new As(table.render());
    }

    render(): string {
        const sql = ['FROM'];
        sql.push(this._sql);
        // sql.push(this._as.render());
        return sql.join(' ');
    }

    as(alias: As | string = '') {

        this._as = typeof alias === 'string' ? new As(alias) : alias;
        this._as.queryBuilder = this.queryBuilder;
        return this.queryBuilder;
    }
}

export default From;