export interface SearchResponse {
    items:  Item[];
    page:   number;
    limit:  number;
    totalItems: number;
    totalPages: number;
    tookMs: number;
    cached: boolean;
}

export interface Item {
    _id:          string;
    sku:          string;
    brand:        string;
    category:     string;
    description:  string;
    price:        number;
    product_type: string;
    title:        string;
    score:        number;
    currency:     string;
    stock:        number;
    rating:       number;
    created_at:   string;
}
