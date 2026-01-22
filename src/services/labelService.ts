import axiosInstance from '../config/axios';
import type { PaginatedData } from '../types/Pagination';
import type { Label, RequestLabels } from '../types/Label';
import type { CreatableMultiSelectOption } from '../components/CreatableMultiSelect';
import type { MultiValue } from 'react-select';

const getAll = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<Label>> => {
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

  const response = await axiosInstance.get<PaginatedData<Label>>('/labels', {
    params: queryParams
  });

  const { data } = response;

  return data;
};

const mapLabelsToSelectOptions = (
  data: Label[]
): MultiValue<CreatableMultiSelectOption> => {
  return data.map((label) => ({
    value: label.name,
    label: label.name
  }));
};

const mapOptionsToRequestLabels = (
  options: MultiValue<CreatableMultiSelectOption>
): RequestLabels => {
  return options.map((option) => option.value);
};

export const labelService = {
  getAll,
  mapLabelsToSelectOptions,
  mapOptionsToRequestLabels
};
