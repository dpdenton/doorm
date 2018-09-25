"use strict";
// PLACES DATA MODEL
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("./main");
var placePK = new main_1.DataColumn('id').sql("\"Places\".\"id\"").as("\"Places.id\"");
var nameColumn = new main_1.DataColumn('name').sql("\"Places\".\"name\"").as("\"Places.name\"");
var placeRateableIdColumn = new main_1.DataColumn('RateableId').sql("\"Places\".\"RateableId\"").as("\"Places.RateableId\"");
var placeTable = new main_1.DataTable('Places').sql("\"Places\"")
    .addDataColumn(placePK)
    .addDataColumn(nameColumn)
    .addDataColumn(placeRateableIdColumn);
// REVIEW COUNT TABLE
var reviewId = new main_1.DataColumn('id').sql("\"Reviews\".\"id\"").as("\"Reviews.id\"");
var reviewRateableId = new main_1.DataColumn('RateableId')
    .sql("\"Reviews\".\"RateableId\"")
    .as("\"Reviews.RateableId\"");
var reviewCount = new main_1.DataColumn('thumbUpCount')
    .sql("CAST(COUNT(CASE WHEN \"Reviews\".\"thumbUp\" THEN 1 END) AS int4)")
    .as("\"Reviews.thumbUpCount\"");
var reviewCountTable = new main_1.DataTable('Reviews').sql("\"Reviews\"");
reviewCountTable
    .addDataColumn(reviewId)
    .addDataColumn(reviewRateableId)
    .addDataColumn(reviewCount);
// RATEABLES TABLE
var rateablePK = new main_1.DataColumn('id').sql("\"Rateables\".\"id\"").as("\"Rateables.id\"");
var rateableCategoryId = new main_1.DataColumn('CategoryId').sql("\"Rateables\".\"CategoryId\"").as("\"Rateables.CategoryId\"");
var rateablesTable = new main_1.DataTable('Rateables').sql("\"Rateables\"");
rateablesTable
    .addDataColumn(rateablePK)
    .addDataColumn(rateableCategoryId);
// CATEGORIES TABLE
var categoryPK = new main_1.DataColumn('id').sql("\"Categories\".\"id\"").as("\"Categories.id\"");
var categoryName = new main_1.DataColumn('name').sql("\"Categories\".\"name\"").as("\"Categories.name\"");
var categoryIcon = new main_1.DataColumn('icon').sql("\"Categories\".\"icon\"").as("\"Categories.icon\"");
var categoryTable = new main_1.DataTable('Categories').sql("\"Categories\"");
categoryTable
    .addDataColumn(categoryPK)
    .addDataColumn(categoryIcon)
    .addDataColumn(categoryName);
// REVIEW IMAGES DATA TABLE
var reviewImagePK = new main_1.DataColumn('id').sql("\"ReviewImages\".\"id\"").as("\"ReviewImages.id\"");
var reviewImageUri = new main_1.DataColumn('uri').sql("\"ReviewImages\".\"uri\"").as("\"ReviewImages.uri\"");
var reviewImageReviewId = new main_1.DataColumn('ReviewId').sql("\"ReviewImages\".\"ReviewId\"").as("\"ReviewImages.ReviewId\"");
var reviewImageTable = new main_1.DataTable('ReviewImages').sql("\"ReviewImages\"");
reviewImageTable
    .addDataColumn(reviewImagePK)
    .addDataColumn(reviewImageUri)
    .addDataColumn(reviewImageReviewId);
// SELECT QUERIES
var categorySelect = new main_1.SelectQuery();
categorySelect
    .columns(categoryTable.getDataColumns())
    .from(categoryTable);
var rateablesSelect = new main_1.SelectQuery();
var reviewCountSelect = new main_1.SelectQuery();
reviewCountSelect
    .columns(reviewCountTable.getDataColumns())
    .from(reviewCountTable);
var reviewImagesSelect = new main_1.SelectQuery();
reviewImagesSelect
    .columns(reviewImageTable.getDataColumns())
    .from(reviewImageTable);
var placeSelect = new main_1.SelectQuery();
placeSelect
    .columns(placeTable.getDataColumns())
    .from(placeTable)
    .join(rateablesSelect)
    .join(categorySelect)
    .join(reviewCountSelect, placeRateableIdColumn.getSql() + " = " + reviewRateableId.getSql())
    .join(reviewImagesSelect, reviewId.getSql() + " = " + reviewImageReviewId.getSql())
    .toString();
