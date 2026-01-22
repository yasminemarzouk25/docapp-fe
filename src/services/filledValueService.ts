import axiosInstance from '../config/axios';
import type { FilledValue, SaveFilledValueBody } from '../types/FilledValue';

const getByRequestId = async (id: string): Promise<FilledValue> => {
  const response = await axiosInstance.get<FilledValue>(
    `/filledValues/request/${id}`
  );
  const { data } = response;

  return data;
};

const save = async (
  filledValue: string,
  requestId: string,
  placeholderId: string | null,
  userFieldId: string | null
): Promise<void> => {
  const payload: SaveFilledValueBody = {
    filledValue,
    requestId
  };
  if (placeholderId) {
    payload.placeholderId = placeholderId;
  } else if (userFieldId) {
    payload.userFieldId = userFieldId;
  }

  await axiosInstance.post('/filledValues/save', payload);
};

export const filledValueService = {
  getByRequestId,
  save
};
