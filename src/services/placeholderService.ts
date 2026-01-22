import axiosInstance from '../config/axios';
import type { PaginatedData } from '../types/Pagination';
import type { Placeholder } from '../types/Placeholder';

const getAll = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<Placeholder>> => {
  const queryParams: {
    paginate: boolean;
    limit?: number;
    offset?: number;
  } = {
    paginate
  };

  if (paginate) {
    const offset = (page - 1) * Number(limit);
    queryParams.limit = Number(limit);
    queryParams.offset = Number(offset);
  }

  const response = await axiosInstance.get<PaginatedData<Placeholder>>(
    '/placeholders',
    {
      params: queryParams
    }
  );
  const { data } = response;

  return data;
};

const create = async (name: string, labels: string[]): Promise<Placeholder> => {
  const response = await axiosInstance.post<Placeholder>('/placeholders/new', {
    name,
    labels
  });
  const { data } = response;

  return data;
};

const getById = async (id: string): Promise<Placeholder> => {
  const response = await axiosInstance.get<Placeholder>(`/placeholders/${id}`);
  const { data } = response;

  return data;
};

const getByLabels = async (labels: string[]): Promise<Placeholder[]> => {
  const response = await axiosInstance.post<Placeholder[]>(
    '/placeholders/by-labels',
    {
      labels
    }
  );
  const { data } = response;

  return data;
};

const update = async (
  id: string,
  name: string,
  labels: string[]
): Promise<Placeholder> => {
  const response = await axiosInstance.put<Placeholder>(`/placeholders/${id}`, {
    name,
    labels
  });
  const { data } = response;

  return data;
};

const _delete = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/placeholders/${id}`);
};

export const placeholderService = {
  getAll,
  create,
  getById,
  update,
  getByLabels,
  _delete
};
