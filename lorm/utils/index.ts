import Table from '../Table';

export const replaceAll = (string: string, search: string, replacement: string) => {
    return string.split(search).join(replacement);
};

export const isParent = (a: Table, b: Table) => {

    a.columns.forEach(column => {
        if (column.name === b.foreignKey) {
            return true;
        }
    });

    return false;
};