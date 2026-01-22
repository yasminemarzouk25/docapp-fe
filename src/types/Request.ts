import type { BackendStep } from './Workflow';

export enum SignatureType {
  _HANDWRITTEN = 'HANDWRITTEN',
  _DIGITAL = 'DIGITAL',
  _NONE = ''
}

export interface AddRequestFormData {
  summary: string;
  createdFor: string;
  department: string;
  description: string;
  hrHandler: string;
  priority: number | null;
  templateId: string;
  signatureType: SignatureType;
  includeQrCode: boolean;
}

export interface AddAdministrativeDocumentFormData {
  summary: string;
  createdFor: string;
  department: string;
  priority: number | null;
  templateId: string;
  includeQrCode: boolean;
}

export enum Department {
  _GENERAL = '01',
  _HR = '02',
  _TECH = '03',
  _QUALITY = '04',
  _DEVELOPMENT = '05'
}

export type CreateRequestResponse = {
  id: string;
  createdBy: string;
  createdFor: string;
  documentApprover: string | null;
  hrHandler: string;
  templateId: string;
  status: string;
  description: string;
  priority: number;
  department: string;
  requestDate: string;
  includeQrCode: boolean;
  summary: string;
  workflowStep: number;
};

type Person = {
  id: string;
  name: string;
};

export enum Status {
  _PENDING = 'Pending',
  _APPROVED = 'Approved',
  _REJECTED = 'Rejected'
}

export type RequestResponse = {
  /** The user who created the request. */
  createdBy: Person;
  /** The user for whom the request was created. */
  createdFor: Person;
  /** The department of the request. */
  department: Department;
  /** Detailed description of the request. */
  description: string;
  /**
   * The user who will approve the document.
   * @nullable
   */
  documentApprover: Person | null;
  /** The HR handler responsible for the request. */
  hrHandler: Person;
  /** A unique identifier for the request. */
  id: string;
  /** Priority level of the request. */
  priority: PriorityLevel;
  /** The date the request was made. */
  requestDate: string;
  /** Indicates if a QR code is included in the request. */
  includeQrCode: boolean;
  /** Status of the request. */
  status: Status;
  /** Summary of the request. */
  summary: string;
  /** The template used in the request. */
  template: {
    /** A unique identifier for the template. */
    id: string;
    /** The name of the template. */
    name: string;
  };
  /** The current step in the workflow. */
  workflowStep: BackendStep;

  /** Whether the request has been downloaded or not */
  isDownloaded: boolean;
  /** Whether the signed PDF has been uploaded or not */
  isUploaded: boolean;
  /** Signature type of the request */
  signatureType: SignatureType;
  /** Whether the request has a signaturePosition or not */
  hasSignature: boolean;
  /** Whether the request can be requested by an employee */
  employeeRequestable?: boolean;
};

export enum PriorityLevel {
  _Lowest = 1,
  _Low,
  _Medium,
  _High,
  _Highest,
  _Urgent
}

export const priorityLabels: { [_key in PriorityLevel]: string } = {
  [PriorityLevel._Lowest]: 'Lowest',
  [PriorityLevel._Low]: 'Low',
  [PriorityLevel._Medium]: 'Medium',
  [PriorityLevel._High]: 'High',
  [PriorityLevel._Highest]: 'Highest',
  [PriorityLevel._Urgent]: 'Urgent'
};

export type UpdateRequest = {
  documentApprover?: string;
  hrHandler: string;
  includeQrCode: boolean;
  status: string;
  templateId: string;
  signatureType: SignatureType;
};

export type AssignApprover = {
  documentApprover: string;
};

export type ReviewRequestPayload = {
  requestId: string;
  action: 'Approve' | 'Reject';
};

export type OcrCompareResult = {
  index: number;
  input: string;
  original: string;
};
