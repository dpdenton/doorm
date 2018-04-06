const sql = [];

        sql.push(`
            SELECT ${Review.orm.columns} FROM "Reviews"
        `);

        // need to inner join parent relation table here to get limit working correctly.
        sql.push(`
            INNER JOIN (
                SELECT * FROM "Reviews"

                LEFT JOIN (
                    SELECT "Follows"."UserId", "Follows"."FollowingId" FROM "Follows"
                ) AS "Follows" ON "Follows"."FollowingId" = "Reviews"."UserId"

                LEFT JOIN LATERAL (
                 SELECT EXISTS(
                        SELECT "ReviewId" FROM "ReviewThanks"
                        WHERE "UserId" = :sessionUserId AND "ReviewId" = "Reviews"."id"
                     ) AS "isThanked"
                ) AS "ReviewIsThanked" ON true

                LEFT JOIN LATERAL (
                     SELECT EXISTS(
                        SELECT "ReviewId" FROM "ReviewBookmarks"
                        WHERE "UserId" = :sessionUserId AND "ReviewId" = "Reviews"."id"
                     ) AS "isBookmarked"
                ) AS "ReviewIsBookmark" ON true

                LEFT JOIN LATERAL (
                    SELECT
                        ${Review.rateableRelation.columns}
                    FROM "Rateables"
                    WHERE "Rateables"."id" = "Reviews"."RateableId"
                ) AS "Places" ON true

                LEFT JOIN LATERAL (
                    SELECT ${Review.userRelation.columns} FROM "Users"
                    WHERE "Users"."id" = "Reviews"."UserId"
                ) AS "Users" ON true

                LEFT JOIN LATERAL (
                    SELECT COALESCE(array_agg("text"), '{}') AS "ReviewTags", array_to_string(array_agg("text"), ' ' ,'') AS "ReviewTagTextSearch"
                    FROM "ReviewTags"
                    LEFT JOIN "Tags" ON "Tags"."id" = "ReviewTags"."TagId"
                    WHERE "ReviewId" = "Reviews"."id"
		        ) AS "ReviewTags" ON true

                ${filters.where}

                ORDER BY "createdAt" DESC OFFSET ${filters.offset} LIMIT ${filters.limit}
            ) AS "ParentRelation" ON "ParentRelation"."id" = "Reviews"."id"
        `);

        // total number of review thanks
        sql.push(`
            LEFT JOIN (
                SELECT "ReviewId", COALESCE(CAST(COUNT("ReviewId") AS int4), 0) AS "thankCount" FROM "ReviewThanks"
                GROUP BY "ReviewId"
            ) AS "TotalThankCount" ON "TotalThankCount"."ReviewId" = "Reviews"."id"
        `);

        // Comment count
        sql.push(`
            LEFT JOIN LATERAL (
                SELECT COALESCE(CAST(COUNT("id") AS int4), 0) AS "commentCount" FROM "ReviewComments"
                WHERE "ReviewComments"."ReviewId" = "Reviews"."id"
            ) AS "CommentCount" ON true
        `);

        //  Review Images relation
        sql.push(`
            LEFT JOIN LATERAL (
                SELECT ${Review.reviewImageRelation.columns} FROM "ReviewImages"
                WHERE "ReviewImages"."ReviewId" = "Reviews"."id"
                ORDER BY "ReviewImages"."createdAt" ASC
            ) AS "PlaceReviewImages" ON true
        `);

        // Comment relation
        sql.push(`
            LEFT JOIN LATERAL (
                SELECT ${Review.commentRelation.columns} FROM "ReviewComments"
                LEFT JOIN "Users" ON "Users"."id" = "ReviewComments"."UserId"
                WHERE "ReviewComments"."ReviewId" = "Reviews"."id"
                ORDER BY "ReviewComments"."createdAt" DESC LIMIT ${filters.commentsLimit ? filters.commentsLimit : null}
            ) AS "ReviewComments" ON true
        `);

        // categories relation
        sql.push(`
            LEFT JOIN "Rateables" ON "Reviews"."RateableId" = "Rateables"."id"
            LEFT JOIN (
                SELECT ${Review.categoryRelation.columns} FROM "Categories"
            ) AS "Categories" ON "Categories.id" = "Rateables"."CategoryId"
        `);

        // wrap select so where clause can access all columns
        sql.unshift(`SELECT * FROM (`);

        sql.push(`
                ORDER BY "Reviews"."createdAt" DESC
            ) AS "ReviewWrapper"
        `);

        return sql.join("");