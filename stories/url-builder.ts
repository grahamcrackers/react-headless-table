interface SearchParams {
    skip?: number;
    limit?: number;
    sort?: string[];
}

const urlBuilder = (base: string, params: SearchParams) => {
    const url = new URL(base);
    const { sort } = params;

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    return url.href;
};
