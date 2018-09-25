
const options = {
    primaryKeyName: 'id',
    toForeignKeyFn: (tableName, columnName) => {
        return `${tableName}Id`;
    }
};


export abstract class BuildingBlock {

    protected _options: any;
    protected _blocks: BuildingBlock[];

    constructor(options) {
        this._blocks = [];
    }

    public toString() {
        return this._toString();
    }

    protected _sanitize(value: any) {

    }

    protected _format(value: any) {

    }

    protected _toString() {
        return this._blocks.map(block => block.toString()).join(' ');
    }


}

export class StringBlock extends BuildingBlock {

    constructor(options) {
        super(options);
    }

    protected _toString() {
        return this._blocks.join(' ');
    }

    public sql(sql) {
        this._blocks.push(sql);
        return this;
    }

}

export class SelectBlock extends BuildingBlock {

    constructor(options) {
        super(options);
        const stringBlock = new StringBlock(options);
        stringBlock.sql('SELECT');
        this._blocks.push(stringBlock);
    }

    protected _toString() {
        return this._blocks.map(block => block.toString());
    }
}

export class ColumnBlock extends BuildingBlock {


    constructor(options) {
        super(options);
    }

    fields(columns) {
        columns.map(this.field.bind(this));
    }

    field(column, options = null) {

        const stringBlock = new StringBlock(options);
        stringBlock.sql(column);
        this._blocks.push(stringBlock);
        return this;
    }

    as(alias: string) {
        const aliasBlock = new AliasBlock(null);
        aliasBlock.as(alias);
        this._blocks.push(aliasBlock);
    }

    protected _toString() {
        return super._toString();
    }

}

export class AliasBlock extends BuildingBlock {


    constructor(options) {
        super(options);
        const stringBlock = new StringBlock(null);
        stringBlock.sql('AS');
        this._blocks.push(stringBlock);
    }

    as(alias) {
        const stringBlock = new StringBlock(options);
        stringBlock.sql(alias);
        this._blocks.push(stringBlock);
        return this;
    }

    protected _toString() {
        return super._toString();
    }
}

export class OnBlock extends BuildingBlock {


    constructor(options) {
        super(options);
        const stringBlock = new StringBlock(null);
        stringBlock.sql('ON');
        this._blocks.push(stringBlock);
    }

    condition(condition) {
        const stringBlock = new StringBlock(options);
        stringBlock.sql(condition);
        this._blocks.push(stringBlock);
        return this;
    }

    protected _toString() {
        return super._toString();
    }
}

export class TableBlock extends BuildingBlock {

    constructor(options) {
        super(options);
        const stringBlock = new StringBlock(null);
        stringBlock.sql('FROM');
        this._blocks.push(stringBlock);
    }

    from(table) {
        const stringBlock = new StringBlock(options);
        stringBlock.sql(table);
        this._blocks.push(stringBlock);
        return this;
    }

    as(alias) {
        const aliasBlock = new AliasBlock(options).as(alias);
        this._blocks.push(aliasBlock);
        return this;
    }

    protected _toString() {
        return super._toString();
    }
}

export class JoinBlock extends BuildingBlock {

    constructor(options, type = 'JOIN') {
        super(options);
        const stringBlock = new StringBlock(null);
        stringBlock.sql(type);
        this._blocks.push(stringBlock);
    }

    public join(query: Query) {
        this._blocks.push(new StringBlock(null).sql('('));
        this._blocks.push(query);
        this._blocks.push(new StringBlock(null).sql(')'));
        return this;
    }

    public as(alias: string) {
        const aliasBlock = new AliasBlock(options).as(alias);
        this._blocks.push(aliasBlock);
        return this;
    }

    public on(condition: string) {
        const onBlock = new OnBlock(options);
        onBlock.condition(condition);
        this._blocks.push(onBlock);
        return this;
    }

    protected _toString() {
        return super._toString();
    }
}

/**
 * A Query is a BuildingBlock composed of other BuildingBlocks created through the classes public methods.
 * Queries can be composed of other queries.
 */
export class Query extends BuildingBlock {

    protected name: string;
    protected _queryManager: QueryManager;

    constructor(options = {}) {
        super(options);
    }


    protected _toString() {
        return super._toString();

    }

    getManager() {
        return this._queryManager;
    }
}


export class ColumnQuery extends Query {

    constructor(options = {}, queryManager) {
        super(options);
        this._queryManager = queryManager || new QueryManager(this);
    }

    /**
     * Dynamically create blocks when string is generated to ensure the correct columns are included
     * in each query and they are aliased correctly.
     * @returns {string}
     * @private
     */
    protected _toString() {

        this._pushBlocks(this.getManager().getColumns().filter(this._filterColumn.bind(this)).map(this._toBlock.bind(this)));
        return super._toString();
    }

    private _filterColumn(column) {

        // if this is the root query (i.e doesn't have any parents) then we don't need to include
        // the foreign key columns. Something to include in options.
        const isRootAndForeignKey = this.getManager().getParents().length === 0 && column.isForeignKey;
        return !isRootAndForeignKey;
    }

    private _toBlock(column): ColumnBlock {

        // if own column then sql AS alias
        if (this.getManager().isOwnColumn(column)) {

            const columnBlock = new ColumnBlock(null);
            columnBlock.field(column.getSql()).as(column.getAlias());
            return columnBlock;
        }

        // else check a join column and only alias
        else if (this.getManager().isJoinColumn(column)) {

            const columnBlock = new ColumnBlock(null);
            columnBlock.field(column.getAlias());
            return columnBlock;
        }

        else {
            throw new Error(`Orphaned column found: ${column.name}`);
        }
    }

    private _pushBlocks(columnBlocks: ColumnBlock[]) {
        columnBlocks.forEach(this._pushBlock.bind(this));
    }

    private _pushBlock(columnBlock: ColumnBlock, index, array) {

        this._blocks.push(columnBlock);

        // add comma between each block except last
        if (array.length - 1 !== index) {
            const stringBlock = new StringBlock(null);
            stringBlock.sql(',');
            this._blocks.push(stringBlock);
        }
    }
}


export class SelectQuery extends Query {

    constructor(options = {}) {
        super(options);
        this._queryManager = new QueryManager(this);

        // set SELECT statement at start
        const selectBlock = new SelectBlock(options);
        this._blocks.push(selectBlock);
    }

    columns(columns: DataColumn[]) {

        columns.forEach(this.getManager().addOwnColumn.bind(this.getManager()));
        const columnQuery = new ColumnQuery(null, this.getManager());
        this._blocks.push(columnQuery);

        return this;
    }

    from(table: DataTable) {

        // set blocks
        const tableBlock = new TableBlock(options);
        tableBlock.from(table.getSql());
        this._blocks.push(tableBlock);

        // update manager
        this.getManager().setTable(table);

        return this;
    }

    join(query: Query, condition = null, alias = null) {

        // add join columns to parent query
        query.getManager().getColumns().forEach(this.getManager().addJoinColumn.bind(this.getManager()));

        // get condition
        condition = condition || this.getManager().getJoinCondition(query);

        // give the child query some parents (and grandparents ...)
        const parents = this.getManager().getParents().concat(this.getManager().getQuery());
        query.getManager().inheritParents(parents);

        // user the child query's manager to get join alias, as it used that table's name / alias
        alias = alias || query.getManager().getJoinAlias();

        const joinBlock = new JoinBlock({});
        joinBlock.join(query).as(alias).on(condition);
        this._blocks.push(joinBlock);

        return this;
    }

    protected _toString() {
        return super._toString();
    }
}

enum RelationshipType {
    hasOne,
    hasMany,
}

interface Relationship {
    this: Query,
    query: Query,
    type: RelationshipType
}

export class QueryManager {

    /**
     * An list of all queries this query has joined to
     */
    private _parents: Query[];

    /**
     * The query associated with the manager
     */
    private _query: Query;

    /**
     * List of relations joined to query;
     */
    private _relations: Relationship[];

    /**
     * The table from which the query is selecting
     */
    private _table: DataTable;

    /**
     * A list of all the columns in query
     */
    private _columns: DataColumn[];

    /**
     * A list of the queries own columns i.e. all columns excluding joined columns
     */
    private _ownColumns: DataColumn[];

    /**
     * A list of the column joined to this query
     */
    private _joinColumns: DataColumn[];

    private _isRoot: boolean;

    constructor(query, isRoot = true) {
        this._parents = [];
        this._query = query;
        this._table = null;
        this._columns = [];
        this._ownColumns = [];
        this._joinColumns = [];
        this._relations = [];
        this._isRoot = isRoot;
    }

    public setTable(table: DataTable) {
        this._table = table;
    }

    public getTable(): DataTable {
        return this._table;
    }

    public addOwnColumn(column) {
        this._ownColumns.push(column);
        this._columns.push(column);
    }

    public addJoinColumn(column) {
        this._joinColumns.push(column);
        this._columns.push(column);
    }

    public inheritParents(parents: Query[]) {
        parents.forEach(parent => {
            this._parents.push(parent);
        });
    }

    public getQuery() {
        return this._query;
    }

    public getParents() {
        return this._parents;
    }

    public getColumns() {
        return this._columns;
    }

    public getOwnColumns() {
        return this._ownColumns;
    }

    public getJoinColumns() {
        return this._joinColumns;
    }

    public getRelations(): Relationship[] {
        return this._relations;
    }

    public isOwnColumn(column: DataColumn): boolean {
        return this.getOwnColumns().some(c => c === column);
    }

    public isJoinColumn(column: DataColumn): boolean {
        return this.getJoinColumns().some(c => c === column);
    }

    public _getJoinCondition(relationship: Relationship) {

        if (relationship.type === RelationshipType.hasMany) {

            /*

            If has many relation then this primary key will appear on the relation's table
            The foreign key is generated using a function defined in options

            e.g. User Table

            id, name, dob

            Task Table

            id, name, dealine, UserId

            JOIN ON User.id = Task.UserId
             */

            const leftCondition = this.getPrimaryColumn().getSql();

            const rightCondition = this._buildJoinCondition(
                relationship.query.getManager().getTable().getName(),
                this.getPrimaryColumn().toForeignKey(),
            );
            return `${leftCondition} = ${rightCondition}`;
        }

        if (relationship.type === RelationshipType.hasOne) {

            /*

            If 'has one' then the relation's primary key will be a foreign key on this table.

            e.g. User Table

            id, name, dob, TaskId

            Task Table

            id, name, dealine

            JOIN ON Task.id = User.TaskId
             */

            const leftCondition = this._buildJoinCondition(
                relationship.query.getManager().getTable().getName(),
                relationship.query.getManager().getPrimaryColumn().getName()
            );

            const rightCondition = this._buildJoinCondition(
                this.getTable().getName(),
                relationship.query.getManager().getPrimaryColumn().toForeignKey(),
            );
            return `${leftCondition} = ${rightCondition}`;
        }
    }


    public getJoinAlias() {

        // not sure about this - need to do some more research about aliasing joins...
        let joinAlias;

        if (!joinAlias) {
            joinAlias = this.getTable().getAlias();
        }

        if (!joinAlias) {
            joinAlias = this.getTable().getName();
        }

        return `"${joinAlias}"`;
    }

    public getJoinCondition(query: Query): string {

        const relationship = this._getRelationship(query);
        this._relations.push(relationship);
        return this._getJoinCondition.call(relationship.this, relationship);
    }

    private _getRelationship(query: Query): Relationship {

        let relationship;

        if (this.hasMany(query)) {
            relationship = {
                this: this,
                query: query,
                type: RelationshipType.hasMany,
            };
        }

        if (relationship) {
            this._relations.push(relationship);
            return relationship;
        }

        if (query.getManager().hasMany(this._query)) {
            relationship = {
                this: this,
                query: query,
                type: RelationshipType.hasOne
            };
        }

        if (relationship) {
            this._relations.push(relationship);
            return relationship;
        }

        // look in child queries to see if relationship is in there
        const relations = this.getRelations();
        for (let i = 0; i < relations.length; i++) {
            const relationship = relations[i].query.getManager()._getRelationship(query);
            if (relationship) {
                return relationship;
            }
        }
        throw Error('Cannot find relation!');
    }

    public addRelationship(relationship: Relationship): QueryManager {
        this._relations.push(relationship);
        return this;
    }

    public getPrimaryColumn() {
        return this.getTable().getPrimaryColumn();
    }

    private _buildColumnAlias(column) {
        return `${this._buildParentKey()}.${column.name}`;
    }

    private _buildParentKey() {
        return this._parents.join('.');
    }

    /**
     * Determine if this query has many joined queries.
     * This is the case if the query table's primary key is a foreign key on the joined query.
     *
     * @param {Query} query
     * @returns {boolean}
     * @public
     */
    public hasMany(relation: Query): boolean {

        const columns = relation.getManager().getOwnColumns();

        const foreignKeyName = this.getPrimaryColumn().toForeignKey();
        for (let i = 0; i < columns.length; i++) {

            const column = columns[i];

            console.log('Searching for join Columns: %', {
                column: column.getName(),
                foreignKeyName,
            });

            if (column.getName() === foreignKeyName) {
                column.setIsForeignKey(true);
                return true;
            }
        }
        return false;
    }

    private _buildJoinCondition(tableName: string, columnName: string) {
        return `"${tableName}.${columnName}"`;
    }
}


export class DataItem {

    protected _transientKey: string;
    protected _key: string;
    protected _sql: string;
    protected _name: string;
    protected _alias: string;

    constructor(name) {
        this._name = name;
        this._transientKey = 'random';
    }

    public getName() {
        return this._name;
    }

    public as(alias: string) {
        this._alias = alias;
        return this;
    }

    public sql(sql: string) {
        this._sql = sql;
        return this;
    }

    public getSql(): string {
        return this._sql;
    }

    public getAlias(): string {
        return this._alias;
    }
}

export class DataTable extends DataItem {

    private _primaryColumn: DataColumn;
    private _dataColumns: DataColumn[];

    constructor(name) {
        super(name);

        this._dataColumns = [];
    }

    public addDataColumn(dataColumn: DataColumn) {
        dataColumn.setDataTable(this);
        this._dataColumns.push(dataColumn);
        if (dataColumn.isPrimary) this.setPrimaryColumn(dataColumn);
        return this;
    }

    public getDataColumns() {
        return this._dataColumns;
    }

    public getPrimaryColumn() {
        return this._primaryColumn;
    }

    public setPrimaryColumn(column: DataColumn) {
        this._primaryColumn = column;
    }
}


export class DataColumn extends DataItem {

    private _isPrimary: boolean;
    private _isForeignKey: boolean;
    private _dataTable: DataTable;

    constructor(name) {
        super(name);
        this.setIsPrimary(name === options.primaryKeyName);
        this.setIsForeignKey(false);
    }

    get isPrimary(): boolean {
        return this._isPrimary;
    }

    get isForeignKey(): boolean {
        return this._isForeignKey;
    }

    public setKey(key: string) {
        this._key = key;
    }

    public setDataTable(dataTable: DataTable) {
        this._dataTable = dataTable;
    }

    public setIsPrimary(value: boolean) {
        this._isPrimary = value;
    }

    public setIsForeignKey(value: boolean) {
        this._isForeignKey = value;
    }

    public toForeignKey() {
        return options.toForeignKeyFn(this._dataTable.getName(), this.getName());
    }
}











