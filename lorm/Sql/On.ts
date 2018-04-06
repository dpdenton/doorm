import Sql from './Sql';
class On extends Sql {

    render() {
        const sql = ['ON'];
        sql.push(this._sql);
        return sql.join(' ');
    }
}

export default On;