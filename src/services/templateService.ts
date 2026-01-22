import axiosInstance from '../config/axios';
import type { PaginatedData } from '../types/Pagination';
import {
  Tag,
  type DetectedPlaceholders,
  type Tags,
  type TemplatePlaceholder
} from '../types/Placeholder';
import type {
  Template,
  GroupedTemplates,
  TemplateSingle,
  Position
} from '../types/Template';
import { type TemplateUserField, UserFieldsArray } from '../types/UserField';

const getAll = async (
  paginate: boolean,
  page: number,
  limit: number | null
): Promise<PaginatedData<Template>> => {
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

  const response = await axiosInstance.get<PaginatedData<Template>>(
    '/templates',
    {
      params: queryParams
    }
  );

  const { data } = response;

  return data;
};

const getById = async (id: string): Promise<TemplateSingle> => {
  const response = await axiosInstance.get<TemplateSingle>(`/templates/${id}`);
  const { data } = response;

  return data;
};

const getFile = async (id: string): Promise<Buffer> => {
  const response = await axiosInstance.get(`/templates/getPdf/${id}`, {
    responseType: 'arraybuffer'
  });
  const { data } = response;

  return data;
};

const groupByLanguage = (templates: Template[]): GroupedTemplates => {
  return templates.reduce((acc, template) => {
    const languageName = template.language.name;
    acc[languageName] ||= [];
    acc[languageName].push(template);

    return acc;
  }, {} as GroupedTemplates);
};

const sortByLanguages = (
  groupedTemplates: GroupedTemplates
): GroupedTemplates => {
  const sortedGroupedTemplates = Object.entries(groupedTemplates).sort(
    ([, templatesA], [, templatesB]) => templatesB.length - templatesA.length
  );

  return Object.fromEntries(sortedGroupedTemplates);
};

const validate = async (fileName: File): Promise<DetectedPlaceholders> => {
  const formData = new FormData();
  formData.append('file', fileName);

  const response = await axiosInstance.post<DetectedPlaceholders>(
    '/templates/validate-file',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  const { data } = response;

  return data;
};

const create = async (formData: FormData): Promise<void> => {
  await axiosInstance.post<Template>('/templates/new', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

const { UserField } = Tag;

export const UserFieldsList: Tags = UserFieldsArray.map((field) => ({
  id: '',
  text: field,
  type: UserField
}));

const assignUserField = async (
  templateUserField: TemplateUserField
): Promise<void> => {
  await axiosInstance.patch('/templates/assignUserField', templateUserField);
};

const unAssignUserField = async (
  templateUserField: TemplateUserField
): Promise<void> => {
  await axiosInstance.patch('/templates/unassignUserField', templateUserField);
};

const assignPlaceholder = async (
  templatePlaceholder: TemplatePlaceholder
): Promise<void> => {
  await axiosInstance.patch(
    '/templates/assignPlaceholder',
    templatePlaceholder
  );
};

const unAssignPlaceholder = async (
  templatePlaceholder: TemplatePlaceholder
): Promise<void> => {
  await axiosInstance.patch(
    '/templates/unassignPlaceholder',
    templatePlaceholder
  );
};

const savePosition = async (
  templateId: string,
  position: Position
): Promise<void> => {
  await axiosInstance.post(`/templates/savePosition/${templateId}`, {
    x: position.x,
    y: position.y,
    page: position.page,
    height: position.height,
    width: position.width
  });
};

const getHrTemplates = async (): Promise<PaginatedData<Template>> => {
  const response = await axiosInstance.get<PaginatedData<Template>>(
    '/templates/hr',
    {
      params: { paginate: false }
    }
  );

  const { data } = response;

  return data;
};

const getFirstPageImage = async (id: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/templates/image/${id}`, {
    responseType: 'blob'
  });

  return response.data;
};

export const templateService = {
  getAll,
  getById,
  getFile,
  groupByLanguage,
  sortByLanguages,
  validate,
  create,
  assignUserField,
  unAssignUserField,
  assignPlaceholder,
  unAssignPlaceholder,
  savePosition,
  getFirstPageImage,
  getHrTemplates
};
