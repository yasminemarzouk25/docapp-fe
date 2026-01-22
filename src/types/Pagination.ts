export type PaginationMetadata = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  limit: number | null;
  offset: number | null;
};

export type PaginatedData<T> = {
  data: T[];
} & PaginationMetadata;
