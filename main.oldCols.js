"use strict";
exports.__esModule = true;
var QueryAction_1 = require("./lorm/QueryAction");
var QueryBuilder_1 = require("./lorm/QueryBuilder");
/*** CATEGORY QUERY MODEL ***/
// define Table / Columns; These will typically be generated by a dialect-specific utility tool;
////const columnId = new Column(`"Categories"."id"`, true).as(`"Categories.id"`);
// const columnId = new Column()
//     .name('id')
//     .sql(`"Categories"."id"`)
//     .as(`"Categories.id"`)
//     .setPrimary();
//
// const columnName = new Column()
//     .name('name')
//     .sql(`"Categories"."name"`)
//     .as(`"Categories.name"`);
//
// const categoryTable = new Table('Categories')
//     .addColumn(columnId)
//     .addColumn(columnName)
//     .save();
//
// // use the QueryBuilder to actually build the query based on the Table
// const categoryQB = new QueryBuilder();
//
// categoryQB
//     .select(categoryTable.columns).from(categoryTable);
// console.log(categoryQB);
// build the actual query
/*** RATEABLE QUERY MODEL ***/
// // define Table / Columns; These will typically be generated by a dialect-specific utility tool;
// const rateableColumnId = new Column()
//     .name('id')
//     .sql(`"Rateables"."id"`)
//     .as(`"Rateables.id"`)
//     .setPrimary();
//
// const rateableColumnName = new Column()
//     .name('name')
//     .sql(`"Rateables"."name"`)
//     .as(`"Rateables.name"`);
//
// const rateableColumnCategoryId = new Column()
//     .name('CategoryId')
//     .sql(`"Rateables"."CategoryId"`)
//     .as(`"Rateables.CategoryId"`);
//
// const rateableTable = new Table('Rateables')
//     .addColumn(rateableColumnId)
//     .addColumn(rateableColumnName)
//     .addColumn(rateableColumnCategoryId)
//     .save();
//
// // use the QueryBuilder to actually build the query based on the Table
// const rateableQueryBuilder = new QueryBuilder();
//
// rateableQueryBuilder
//     .select(rateableTable.columns).from(rateableTable).as()
//     .join(categoryQB).on().as();
//
// console.log(rateableQueryBuilder.render());
/*** AGGREGATE JOIN ***/
// const reviewTable = new Table('Reviews');
//
// const reviewId = new Column('id')
//     .sql(`"Reviews"."id"`)
//     .as(`"Reviews.id"`).setPrimary();
//
// const reviewName = new Column('title')
//     .sql(`"Reviews"."title"`)
//     .as(`"Reviews.title"`);
//
// reviewTable
//     .addColumn(reviewId)
//     .addColumn(reviewName)
//     .save();
// const reviewThanksTable = new Table('ReviewThanks');
//
// const reviewThanksReviewId = new Column('ReviewId')
//     .sql(`"ReviewThanks"."ReviewId"`)
//     .as(`"ReviewThanks.ReviewId"`);
//
// const reviewThanksThankCount = new Column('count')
//     .sql(`COALESCE(CAST(COUNT("ReviewId") AS int4), 0)`)
//     .as(`"ReviewThanks.count"`);
//
// reviewThanksTable
//     .addColumn(reviewThanksReviewId)
//     .addColumn(reviewThanksThankCount)
//     .save();
//
// const reviewThanksQueryBuilder = new PostgresQueryBuilder(reviewThanksTable)
//     .select().from()
//     .groupBy(reviewThanksReviewId);
/*** N:M JOIN ***/
var reviewTable = new QueryAction_1.Table('Reviews');
var reviewId = new QueryAction_1.Column("\"Reviews\".\"id\"")
    .name('id')
    .as("\"Reviews.id\"").setPrimary();
var reviewName = new QueryAction_1.Column("\"Reviews\".\"title\"")
    .name('title')
    .as("\"Reviews.title\"");
reviewTable
    .addColumn(reviewId)
    .addColumn(reviewName)
    .save();
var reviewTagsTable = new QueryAction_1.Table('ReviewTags');
var reviewTagsReviewId = new QueryAction_1.Column("\"ReviewTags\".\"ReviewId\"")
    .as("\"ReviewTags.ReviewId\"")
    .name('ReviewId');
var reviewTagsTagId = new QueryAction_1.Column()
    .name('TagId')
    .sql("\"ReviewTags\".\"TagId\"")
    .as("\"ReviewTags.TagId\"");
reviewTagsTable
    .addColumn(reviewTagsReviewId)
    .addColumn(reviewTagsTagId)
    .save();
var tagTable = new QueryAction_1.Table('Tags');
var tagTableId = new QueryAction_1.Column()
    .name('id')
    .sql("\"Tags\".\"id\"")
    .as("\"Tags.id\"")
    .setPrimary();
var tagTableText = new QueryAction_1.Column()
    .name('text')
    .sql("\"Tags\".\"text\"")
    .as("\"Tags.text\"");
tagTable
    .addColumn(tagTableId)
    .addColumn(tagTableText)
    .save();
var reviewTableQB = new QueryBuilder_1["default"]();
var tagTableQB = new QueryBuilder_1["default"]();
var reviewTagTableQB = new QueryBuilder_1["default"]();
tagTableQB
    .select(tagTable.columns).from(tagTable);
reviewTagTableQB
    .select(reviewTagsTable.columns).from(reviewTagsTable);
reviewTableQB
    .select(reviewTable.columns).from(reviewTable)
    .join(reviewTagTableQB)
    .join(tagTableQB);
console.log(reviewTableQB.render());
// const commentTable = new Table('ReviewComments');
//
// const commentCountCol = new Column('count')
//     .sql(`"ReviewComments"."count"`)
//     .as(`"ReviewComments.count"`);
//
// const commentReviewIdCol = new Column('ReviewId')
//     .sql(`"ReviewComments"."ReviewId"`)
//     .as(`"ReviewComments.ReviewId"`);
//
// commentTable
//     .addColumn(commentReviewIdCol)
//     .addColumn(commentCountCol)
//     .save();
//
// const commentQB = new PostgresQueryBuilder(commentTable);
//
// commentQB
//     .select()
//     .from()
//     .groupBy(commentReviewIdCol);
//     // .save('commentCountQB');
//
// reviewTableQB
//     .select().from().as()
//     .join(reviewTagTableQB).as().on()
//     .join(tagTableQB).as().on()
//     .join(commentQB).as().on();
//
// reviewTableQB.generateSelectColumns();
//
// console.log(reviewTableQB.toSql());
// sql.push(`
//             LEFT JOIN LATERAL (
//                 SELECT COALESCE(CAST(COUNT("id") AS int4), 0) AS "commentCount" FROM "ReviewComments"
//                 WHERE "ReviewComments"."ReviewId" = "Reviews"."id"
//             ) AS "CommentCount" ON true
//         `);
// console.log(reviewTableQB._selectColumns); 