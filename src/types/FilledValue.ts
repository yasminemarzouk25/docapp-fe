export type FilledValueSingleItemsItem = {
  /** The detected placeholder within the template */
  detectedPlaceholder: string;
  /** The value of the detected placeholder */
  value: string;
};

export type FilledValueSingleCreatedFor = {
  /** The full name of the user */
  fullname: string;
  /** The unique identifier of the user */
  id: string;
};

export type FilledValue = {
  /** List of detected placeholders and their values */
  items: FilledValueSingleItemsItem[];
  /** The unique identifier of the template */
  templateId: string;
  createdFor: FilledValueSingleCreatedFor;
  /** The date the request was created */
  requestDate: string;
};

export type SaveFilledValueBody = {
  /** FilledValue of the content of the input field */
  filledValue: string;
  /** PlaceholderId of the placeholder */
  placeholderId?: string;
  /** RequestId of the document */
  requestId: string;
  /** UserField id */
  userFieldId?: string;
};
