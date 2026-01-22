import axiosInstance from '../config/axios';
import type { Language } from '../types/Language';
import type { PaginatedData } from '../types/Pagination';

const getAll = async (
  paginate: boolean,
  page: number | null,
  limit: number | null
): Promise<PaginatedData<Language>> => {
  const queryParams: {
    paginate: boolean;
    limit?: number;
    offset?: number;
  } = {
    paginate
  };

  if (paginate && page && limit) {
    const offset = (page - 1) * Number(limit);
    queryParams.limit = Number(limit);
    queryParams.offset = Number(offset);
  }

  const response = await axiosInstance.get<PaginatedData<Language>>(
    '/languages',
    {
      params: queryParams
    }
  );

  const { data } = response;

  return data;
};

const create = async (code: string, name: string): Promise<Language> => {
  const response = await axiosInstance.post<Language>('/languages/new', {
    code: code.toLowerCase(),
    name
  });
  const { data } = response;

  return data;
};

const _delete = async (code: string): Promise<void> => {
  await axiosInstance.delete(`/languages/${code}`);
};

export const languageService = {
  getAll,
  create,
  _delete
};
