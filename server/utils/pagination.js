/**
 * Normalizes page/limit query params into safe numbers and returns
 * everything a Mongoose .find() list query needs (skip/limit) plus
 * the shape used to build the response's pagination block.
 */
const getPagination = (query, defaultLimit = 10, maxLimit = 50) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
        maxLimit
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const buildPaginationMeta = (page, limit, total) => ({
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
});

export default getPagination;