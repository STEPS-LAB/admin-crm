export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface Pagination<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}
