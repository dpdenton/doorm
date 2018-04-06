import Sql from './Sql';

class As extends Sql {

    render() {
        const sql = ['AS'];
        sql.push(this._sql);
        return sql.join(' ');
    }

    get sql() {
        return this._sql;
    }
}

export default As;