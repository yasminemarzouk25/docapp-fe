import { useState } from 'react';
import type { PaginationMetadata } from '../types/Pagination';

const defaultRowsPerPage = 10;
export const initialPaginationMeta: PaginationMetadata = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  hasNextPage: false,
  hasPrevPage: false,
  nextPage: null,
  prevPage: null,
  limit: defaultRowsPerPage,
  offset: 0
};

const usePagination = (rowsPerPage: number) => {
  const [paginationMetadata, setPaginationMetadata] =
    useState<PaginationMetadata>({
      ...initialPaginationMeta,
      limit: rowsPerPage
    });

  const updatePagination = (newState: Partial<PaginationMetadata>) => {
    setPaginationMetadata((prevState) => ({
      ...prevState,
      ...newState
    }));
  };

  return {
    paginationMetadata,
    setPaginationMetaData: updatePagination
  };
};

export default usePagination;
