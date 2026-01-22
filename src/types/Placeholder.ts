export const Tag = {
  Placeholder: 'placeholder',
  UserField: 'userfield'
} as const;

export type TagType = (typeof Tag)[keyof typeof Tag];

export type AppTag = {
  id: string;
  text: string;
  type: TagType;
};
export type Tags = AppTag[];

export type DashedPlaceholder = {
  name: string;
  target: AppTag | null;
};

/**
 * Single response of Placeholder entity
 */
export type Placeholder = {
  /** A unique uuid that identifies the placeholder */
  id: string;
  /** Placeholder name */
  name: string;
  /** A list of labels related to the placeholder */
  labels: string[];
  /** Indicates if the placeholder is deletable */
  isDeletable: boolean;
};

export type DetectedPlaceholders = string[];

export type TemplatePlaceholder = {
  templateId: string;
  placeholderId: string;
  detectedPlaceholder: string;
};
