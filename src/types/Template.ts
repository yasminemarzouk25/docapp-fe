import type { Language } from './Language';

export type TemplateForm = {
  name: string;
  language: string;
  ref: number;
  employeeRequestable: boolean;
};

export type Template = {
  /** A comma-separated list of detected placeholders within the template. */
  detectedPlaceholders: string;
  /**
   * File Name.
   * @minLength 8
   * @maxLength 100
   */
  fileName: string;
  /** A unique identifier for the template. */
  id: string;
  /** Indicates if the template is deletable. */
  isDeletable: boolean;
  language: Language;
  /**
   * Template name.
   * @minLength 6
   * @maxLength 100
   */
  name: string;
  /**
   * Template reference.
   * @minimum 1
   */
  ref: number;
  /** The content of the template. */
  templateContent: string;
};

export type GroupedTemplates = Record<string, Template[]>;

export type FilledPlaceholder = {
  placeholder: string;
  value: string;
};

export type FutureTemplate = {
  id: string;
  name: string;
  fileName: string;
  language: Language;
  ref: number;
  templateContent: string;
  detectedPlaceholders: string;
  isDeletable: boolean;
  filledPlaceholders: FilledPlaceholder[];
};

type RelatedPlaceholders = {
  /** Name of the detected placeholder. */
  detectedPlaceholder: string;
  /** Unique identifier of the placeholder. */
  placeholderId: string;
  /** Name of the placeholder. */
  placeholderName: string;
};

type RelatedUserField = {
  /** Unique identifier of the user field. */
  id: string;
  /** Name of the detected placeholder. */
  detectedPlaceholder: string;
  /** Name of the user field. */
  userFieldName: string;
};

/**
 * Single response of Template entity.
 */
export type TemplateSingle = {
  /** A comma-separated list of detected placeholders within the template. */
  detectedPlaceholders: string;
  /**
   * File Name.
   * @minLength 8
   * @maxLength 100
   */
  fileName: string;
  /** A unique identifier for the template. */
  id: string;
  /** Indicates if the template is deletable. */
  isDeletable: boolean;
  language: Language;
  /**
   * Template name.
   * @minLength 6
   * @maxLength 100
   */
  name: string;
  /**
   * Template reference.
   * @minimum 1
   */
  ref: number;
  /** List of related placeholders. */
  relatedPlaceholders: RelatedPlaceholders[];
  /** List of related user fields. */
  relatedUserFields: RelatedUserField[];
  /** The content of the template. */
  templateContent: string;
  /** Indicate whether all detected placeholders are filled. */
  isFilled: boolean;
};

export type Position = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};
