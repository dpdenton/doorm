import * as pg from 'pg';


import Table from '../Sql/Table';
import Column from '../Sql/Column';

export const columnToSql = (tableName: string, columnName: string): string => {

    return `"${tableName}"."${columnName}"`;
};

export const columnToAlias = (tableName: string, columnName: string): string => {

    return `"${tableName}.${columnName}"`;
};

export const createTable = ({tableName, pk, include}: { tableName: string, pk: string, include: string[] }): Promise<Table> => {

    const client = new pg.Client({
        user: 'dpd',
        database: 'hubbite',
        host: 'localhost',
    });

    return client.connect().then(() => {
        return client.query(`select column_name from INFORMATION_SCHEMA.COLUMNS where table_name = '${tableName}'`);
    }).then(res => {

        const table = new Table(tableName, pk);

        include.push(pk);
        const filterFn = row => include.indexOf(row.column_name) !== -1;

        res.rows.filter(filterFn).forEach(row => {
            const sql = columnToSql(tableName, row.column_name);
            const alias = columnToAlias(tableName, row.column_name);
            const column = new Column(sql).as(alias).name(row.column_name);
            if (column.getName() === pk) column.setPrimary();
            table.addColumn(column);
        });

        table.save();

        client.end();
        return table;

    }).catch(err => {
        client.end();
        return err;
    });
};

