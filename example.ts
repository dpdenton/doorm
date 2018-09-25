// PLACES DATA MODEL

import {DataColumn, DataTable, SelectQuery} from './main';

const placePK = new DataColumn('id').sql(`"Places"."id"`).as(`"Places.id"`);
const nameColumn = new DataColumn('name').sql(`"Places"."name"`).as(`"Places.name"`);
const placeRateableIdColumn = new DataColumn('RateableId').sql(`"Places"."RateableId"`).as(`"Places.RateableId"`);

const placeTable = new DataTable('Places').sql(`"Places"`)
    .addDataColumn(placePK)
    .addDataColumn(nameColumn)
    .addDataColumn(placeRateableIdColumn);

// REVIEW COUNT TABLE

const reviewId = new DataColumn('id').sql(`"Reviews"."id"`).as(`"Reviews.id"`);
const reviewRateableId = new DataColumn('RateableId')
    .sql(`"Reviews"."RateableId"`)
    .as(`"Reviews.RateableId"`);
const reviewCount = new DataColumn('thumbUpCount')
    .sql(`CAST(COUNT(CASE WHEN "Reviews"."thumbUp" THEN 1 END) AS int4)`)
    .as(`"Reviews.thumbUpCount"`);

const reviewCountTable = new DataTable('Reviews').sql(`"Reviews"`);

reviewCountTable
    .addDataColumn(reviewId)
    .addDataColumn(reviewRateableId)
    .addDataColumn(reviewCount);

// RATEABLES TABLE

const rateablePK = new DataColumn('id').sql(`"Rateables"."id"`).as(`"Rateables.id"`);
const rateableCategoryId = new DataColumn('CategoryId').sql(`"Rateables"."CategoryId"`).as(`"Rateables.CategoryId"`);

const rateablesTable = new DataTable('Rateables').sql(`"Rateables"`);

rateablesTable
    .addDataColumn(rateablePK)
    .addDataColumn(rateableCategoryId);

// CATEGORIES TABLE

const categoryPK = new DataColumn('id').sql(`"Categories"."id"`).as(`"Categories.id"`);
const categoryName = new DataColumn('name').sql(`"Categories"."name"`).as(`"Categories.name"`);
const categoryIcon = new DataColumn('icon').sql(`"Categories"."icon"`).as(`"Categories.icon"`);

const categoryTable = new DataTable('Categories').sql(`"Categories"`);

categoryTable
    .addDataColumn(categoryPK)
    .addDataColumn(categoryIcon)
    .addDataColumn(categoryName);

// REVIEW IMAGES DATA TABLE

const reviewImagePK = new DataColumn('id').sql(`"ReviewImages"."id"`).as(`"ReviewImages.id"`);
const reviewImageUri = new DataColumn('uri').sql(`"ReviewImages"."uri"`).as(`"ReviewImages.uri"`);
const reviewImageReviewId = new DataColumn('ReviewId').sql(`"ReviewImages"."ReviewId"`).as(`"ReviewImages.ReviewId"`);

const reviewImageTable = new DataTable('ReviewImages').sql(`"ReviewImages"`);

reviewImageTable
    .addDataColumn(reviewImagePK)
    .addDataColumn(reviewImageUri)
    .addDataColumn(reviewImageReviewId);

// SELECT QUERIES

const categorySelect = new SelectQuery();

categorySelect
    .columns(categoryTable.getDataColumns())
    .from(categoryTable);

const rateablesSelect = new SelectQuery();

const reviewCountSelect = new SelectQuery();

reviewCountSelect
    .columns(reviewCountTable.getDataColumns())
    .from(reviewCountTable);

const reviewImagesSelect = new SelectQuery();

reviewImagesSelect
    .columns(reviewImageTable.getDataColumns())
    .from(reviewImageTable);

const placeSelect = new SelectQuery();

placeSelect
    .columns(placeTable.getDataColumns())
    .from(placeTable)
    .join(rateablesSelect)
    .join(categorySelect)
    .join(reviewCountSelect, `${placeRateableIdColumn.getSql()} = ${reviewRateableId.getSql()}`)
    .join(reviewImagesSelect, `${reviewId.getSql()} = ${reviewImageReviewId.getSql()}`)
    .toString();