import axiosInstance from '../config/axios';
import type { PaginatedData } from '../types/Pagination';
import type {
  CreateRequestResponse,
  RequestResponse,
  UpdateRequest,
  AssignApprover,
  ReviewRequestPayload,
  OcrCompareResult,
  AddRequestFormData,
  AddAdministrativeDocumentFormData
} from '../types/Request';
import type { Position } from '../types/Template';

const create = async (
  newRequest: AddRequestFormData
): Promise<CreateRequestResponse> => {
  const response = await axiosInstance.post<CreateRequestResponse>(
    '/requests/new',
    newRequest
  );
  const { data } = response;

  return data;
};

const createHrRequest = async (
  newRequest: AddAdministrativeDocumentFormData
): Promise<CreateRequestResponse> => {
  const response = await axiosInstance.post<CreateRequestResponse>(
    '/requests/newHrRequest',
    newRequest
  );
  const { data } = response;

  return data;
};

const me = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<RequestResponse>> => {
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

  const response = await axiosInstance.get<PaginatedData<RequestResponse>>(
    '/requests/me',
    {
      params: queryParams
    }
  );

  const { data } = response;

  return data;
};

const assigned = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<RequestResponse>> => {
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

  const response = await axiosInstance.get<PaginatedData<RequestResponse>>(
    '/requests/assigned',
    {
      params: queryParams
    }
  );

  const { data } = response;

  return data;
};

const toReview = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<RequestResponse>> => {
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

  const response = await axiosInstance.get<PaginatedData<RequestResponse>>(
    '/requests/toReview',
    {
      params: queryParams
    }
  );

  const { data } = response;

  return data;
};

const hrAdmin = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<RequestResponse>> => {
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

  const response = await axiosInstance.get<PaginatedData<RequestResponse>>(
    '/requests/hrAdmin',
    {
      params: queryParams
    }
  );

  const { data } = response;

  return data;
};

const update = async (
  id: string,
  requestBody: UpdateRequest
): Promise<void> => {
  await axiosInstance.put<Request>(`/requests/${id}`, requestBody);
};

const generate = async (id: string): Promise<void> => {
  await axiosInstance.post<void>(`/requests/generate/${id}`);
};

const assignApprover = async (
  id: string,
  requestBody: AssignApprover
): Promise<void> => {
  await axiosInstance.patch<Request>(
    `/requests/assignApprover/${id}`,
    requestBody
  );
};

const previewRequestFile = async (id: string): Promise<Blob> => {
  const response = await axiosInstance.get<Blob>(`/requests/preview/${id}`, {
    responseType: 'blob'
  });

  const { data } = response;
  const blob = new Blob([data], { type: 'application/pdf' });

  return blob;
};

const downloadPDF = async (id: string): Promise<Blob> => {
  const response = await axiosInstance.get<Blob>(`/requests/${id}/print`, {
    responseType: 'blob'
  });

  const { data } = response;
  const blob = new Blob([data], { type: 'application/pdf' });

  return blob;
};

const reviewRequest = async (payload: ReviewRequestPayload): Promise<void> => {
  await axiosInstance.post<void>('requests/review', payload);
};

const uploadSignedPdf = async (id: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  await axiosInstance.post<void>(`requests/uploadSignedPdf/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

const uploadDechargePdf = async (id: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  await axiosInstance.post<void>(`requests/uploadDechargePdf/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

const getOriginal = async (
  id: string
): Promise<{ blob: Blob; filename: string }> => {
  const response = await axiosInstance.request<Blob>({
    url: `/requests/original/${id}`,
    method: 'GET',
    responseType: 'blob'
  });

  // Extract filename from Content-Disposition header if present
  let filename: string = `${id}.pdf`; // Default filename
  const disposition = response.headers['content-disposition'];

  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  const { data } = response;
  const blob = new Blob([data], { type: 'application/pdf' });

  return { blob, filename };
};

const ocrCompare = async (
  id: string,
  files: File[]
): Promise<OcrCompareResult[]> => {
  const formData = new FormData();
  files.forEach((file, _index) => {
    formData.append('images', file, file.name);
  });
  const response = await axiosInstance.post<OcrCompareResult[]>(
    `/requests/ocr-compare/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
};

const getSummary = async (id: string): Promise<string> => {
  const response = await axiosInstance.get<{
    data: string;
  }>(`/requests/summary/${id}`);

  return response.data.data;
};

const savePosition = async (id: string, position: Position): Promise<void> => {
  await axiosInstance.post(`/requests/savePosition/${id}`, {
    x: position.x,
    y: position.y,
    page: position.page,
    height: position.height,
    width: position.width
  });
};

export const requestService = {
  create,
  createHrRequest,
  me,
  assigned,
  toReview,
  hrAdmin,
  update,
  generate,
  assignApprover,
  previewRequestFile,
  downloadPDF,
  reviewRequest,
  uploadSignedPdf,
  getOriginal,
  ocrCompare,
  getSummary,
  savePosition,
  uploadDechargePdf
};
