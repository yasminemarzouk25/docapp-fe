import axiosInstance from '../config/axios';
import type { PaginatedData } from '../types/Pagination';
import type { User, SyncResponse } from '../types/User';

const getAll = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<User>> => {
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

  const response = await axiosInstance.get<PaginatedData<User>>('/users', {
    params: queryParams
  });

  const { data } = response;

  return data;
};

const sync = async (): Promise<SyncResponse> => {
  const response = await axiosInstance.post<SyncResponse>('/users/sync');
  const { data } = response;

  return data;
};

const create = async (newUser: Partial<User>): Promise<User> => {
  const response = await axiosInstance.post<User>('/users/new', newUser);
  const { data } = response;

  return data;
};

const _delete = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

const getByRole = async (role: string): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>('/users/by-role', {
    params: { role }
  });

  const { data } = response;

  return data;
};

const uploadSignature = async (signerId: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('signerId', signerId);
  formData.append('signature', file);

  await axiosInstance.post<void>(`/users/signature`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const userService = {
  getAll,
  sync,
  create,
  _delete,
  getByRole,
  uploadSignature
};
