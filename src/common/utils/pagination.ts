export const paginateIt = (page: number, limit: number) => {
    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * perPage;

    return {
        currentPage,
        perPage,
        skip
    }
}