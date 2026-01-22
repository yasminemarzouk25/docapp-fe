import en from './en.json';
import ar from './ar.json';
import fr from './fr.json';
import ja from './ja.json';

type FormsKeys = {
  email: {
    required: string;
    invalid: string;
  };
  addPlaceholder: {
    name: {
      required: string;
      minLength: string;
      maxLength: string;
    };
  };
  editPlaceholder: {
    name: {
      required: string;
      minLength: string;
      maxLength: string;
    };
  };
  addRequest: {
    summary: {
      required: string;
      minLength: string;
      maxLength: string;
    };
    description: {
      required: string;
      minLength: string;
      maxLength: string;
    };
    hrHandler: {
      required: string;
    };
    department: {
      required: string;
      invalid: string;
    };
    priority: {
      required: string;
      min: string;
      max: string;
    };
    templateId: {
      required: string;
    };
    signatureType: {
      required: string;
      invalid: string;
    };
  };
  languageManagement: {
    code: {
      required: string;
      pattern: string;
    };
    name: {
      required: string;
      minLength: string;
      maxLength: string;
    };
  };
};

type LoginKeys = {
  loginToAccount: string;
  accessRestricted: string;
  signInWithMicrosoft: string;
  havingIssues: string;
  contactSupport: string;
  unexpectedError: string;
};

type NavbarKeys = {
  logout: string;
  requests: string;
  documents: string;
  users: string;
  signers: string;
};

type SidebarKeys = {
  home: string;
  myRequests: string;
  assignedRequests: string;
  reviewRequests: string;
  configureTemplates: string;
  addTemplate: string;
  administrativeDocuments: string;
  placeholders: string;
  languages: string;
  users: string;
  signers: string;
};

type AddUserKeys = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  mobile: string;
  birthday: string;
  companyName: string;
  jobTitle: string;
  department: string;
  country: string;
  state: string;
  streetAddress: string;
  postalCode: string;
  buttons: {
    save: string;
    update: string;
    cancel: string;
  };
  sections: {
    personalInformation: string;
    professionalDetails: string;
    additionalInformation: string;
  };
  pageTitle: string;
  successMessage: string;
};

type AddTemplateKeys = {
  templateName: string;
  language: string;
  selectLanguage: string;
  templateRefNumber: string;
  uploadFile: string;
  dragDrop: string;
  pageTitle: string;
  uploadContent: string;
  addTemplateConstraints: string;
  detectedPlaceholders: string;
  fileIsValid: string;
  addedSuccessfully: string;
  employeeRequestable: string;
  employeeRequestableTooltip: string;
  buttons: {
    save: string;
    validate: string;
    reset: string;
  };
};

type WorkflowProgress = {
  created: string;
  generated: string;
  inReview: string;
  signed: string;
  scanned: string;
  collected: string;
};

type addRequest = {
  requestTitle: string;
  editRequestBtn: string;
  department: string;
  departmentPlaceholder: string;
  priority: string;
  priorityPlaceholder: string;
  successMessage: string;
  confirmSend: string;
  confirmSendTitle: string;
  priorityOptions: {
    urgent: string;
    highest: string;
    high: string;
    medium: string;
    low: string;
    lowest: string;
  };
  buttons: {
    send: string;
    cancel: string;
  };
  departments: {
    general: string;
    hr: string;
    tech: string;
    quality: string;
    development: string;
  };
  invalidForm: string;
};

type RequestModal = {
  summary: string;
  description: string;
  priority: string;
  typeDocument: string;
  hrHandler: string;
  createdFor: string;
  status: {
    pending: string;
    approved: string;
    rejected: string;
  };
  signatureType: string;
  handSignature: string;
  digitalSignature: string;
  cancelBtn: string;
  saveBtn: string;
};

type EditRequest = {
  requestDetails: string;
  modalTitle: string;
  documentApprover: string;
  createdBy: string;
  status: string;
  includeQrCode: string;
  selectApproverPlaceholder: string;
  confirmUpdateTitle: string;
  confirmUpdateMessage: string;
  successMessage: string;
};

type AssignRequest = {
  modalTitle: string;
  documentApprover: string;
  assignBtn: string;
  cancelBtn: string;
  successMessage: string;
  assignModalBtn: string;
  confirmAssignTitle: string;
  confirmAssignMessage: string;
};

type UploadSignedPdf = {
  loading: string;
  modalTitle: string;
  uploadFile: string;
  uploadBtn: string;
  cancelBtn: string;
  uploadModalBtn: string;
  successMessage: string;
  confirmUploadTitle: string;
  confirmUploadMessage: string;
  uploadFileError: string;
};

type UploadDechargePdf = {
  loading: string;
  modalTitle: string;
  uploadFile: string;
  uploadBtn: string;
  cancelBtn: string;
  uploadModalBtn: string;
  successMessage: string;
  confirmUploadTitle: string;
  confirmUploadMessage: string;
  uploadFileError: string;
};

type UsersList = {
  pageTitle: string;
  actions: string;
  status: string;
  employeeId: string;
  mobile: string;
  department: string;
  email: string;
  fullName: string;
  syncButton: string;
  loading: string;
  404: string;
  deleteSuccess: string;
  enabled: string;
  disabled: string;
  addButton: string;
};

type SignersPage = {
  fullName: string;
  signature: string;
  noSignature: string;
  pageTitle: string;
  actions: string;
  name: string;
  404: string;
  uploadSignature: string;
};

type SignatureModal = {
  title: string;
  description: string;
  uploadBtn: string;
  cancelBtn: string;
  loading: string;
  successMessage: string;
  uploadFileError: string;
  confirmUploadTitle: string;
  confirmUploadMessage: string;
};

type Pagination = {
  nextPage: string;
  prevPage: string;
};

type RequestList = {
  document: string;
  createdBy: string;
  createdFor: string;
  status: string;
  documentApprover: string;
  priority: string;
  noDataFound: string;
  workflowPlaceholder: string;
  tabs: {
    myRequests: string;
    myAssignedRequests: string;
    requestsToReview: string;
  };
};

type PlaceholderList = {
  pageTitle: string;
  actions: string;
  404: string;
  name: string;
  labels: string;
  deleteSuccess: string;
  deleteError: string;
};

type Document = {
  name: string;
  404: string;
};
type ConfigureTemplate = {
  pageTitle: string;
  placeholders: string;
  userFields: string;
  documentContent: string;
  select: string;
  buttons: {
    goBack: string;
    configureQrCode: string;
  };
  selectLabels: string;
  chooseLabelsToFilter: string;
  retrieveAll: string;
};

type ConfigureQrCode = {
  pageTitle: string;
  dragInstruction: string;
  errorLoadingPdf: string;
  buttons: {
    goBack: string;
    finish: string;
  };
  successToast: string;
};

type ConfigureSignature = {
  pageTitle: string;
  dragInstruction: string;
  successToast: string;
};

type DigitalSignature = {
  title: string;
  description: string;
  promptTitle: string;
  promptDescription: string;
  configureSignatureBtn: string;
  continueValidation: string;
};

type PdfDragOverlay = {
  modalHeader: string;
  modalDescription: string;
  selectPage: string;
  selectPageInfo: string;
  dragAndSelectPageInfo: string;
  dragInfo: string;
  confirm: string;
  goBack: string;
  saveAndReturnPosition: string;
  loading: string;
  page: string;
  submitting: string;
  stopResizing: string;
  resizeImage: string;
};

type QRCodePlacement = {
  modalTitle: string;
  modalDescription: string;
  allPages: string;
  allPagesDesc: string;
  specificPage: string;
  specificPageDesc: string;
  confirmButton: string;
};

type Errors = {
  noResponseReceived: string;
  validation: string;
  unauthorized: string;
  forbidden: string;
  somethingWentWrong: string;
  dataNotFound: string;
  conflict: string;
};

type AddPlaceholder = {
  title: string;
  placeholderInputName: string;
  name: string;
  labels: string;
  add: string;
  cancel: string;
  successMessage: string;
  selectOrCreateLabels: string;
  addButton: string;
};

type GenerateDocument = {
  pageTitle: string;
  userName: string;
  documentType: string;
  requestN: string;
  dateCreation: string;
  documentContent: string;
  confirmGenerateTitle: string;
  confirmGenerateMessage: string;
  buttons: {
    goBack: string;
    generate: string;
  };
};

type EditPlaceholder = {
  title: string;
  placeholderInputName: string;
  name: string;
  labels: string;
  selectOrCreateLabels: string;
  cancel: string;
  successMessage: string;
  save: string;
};

type ValidateRequest = {
  buttons: {
    reject: string;
    approve: string;
  };
  successMessage: string;
  rejectedMessage: string;
  modalTitle: string;
  noPdfAvailable: string;
  errorFetchingPdf: string;
  summaryError: string;
  viewOriginal: string;
  viewSummary: string;
  noSummary: string;
  noSummaryDesc: string;
  generateSummary: string;
  summarizing: string;
  summarizingDesc: string;
  retryGeneration: string;
  summaryErrorTitle: string;
  configureSignature: ConfigureSignature;
  digitalSignature: DigitalSignature;
};

type DownloadPDF = {
  btn: string;
  confirmDownloadTitle: string;
  confirmDownloadMessage: string;
};

type OpenValidateModal = {
  btn: string;
};

type GeneratePDF = {
  btn: string;
};

type ErrorPage = {
  errorTitle: string;
  errorDescription: string;
  goToHomeBtn: string;
};

type OcrCompare = {
  title: string;
  ocrCompare: string;
  startOcrCompare: string;
  uploadScannedImages: string;
  currentlyViewing: string;
  dropImagesHere: string;
  clickOrDrag: string;
  dropzoneDisabled: string;
  scannedDocument: string;
  originalDocument: string;
  uploadedImages: string;
  page: string;
  backToView: string;
};

type LanguageManagement = {
  pageTitle: string;
  addLanguageTitle: string;
  languageCode: string;
  codePlaceholder: string;
  languageName: string;
  namePlaceholder: string;
  addLanguage: string;
  reset: string;
  languagesList: string;
  actions: string;
  noLanguages: string;
  deleteSuccess: string;
  deleteError: string;
  addSuccess: string;
  addLanguageMobile: string;
};

export type TranslationKeys = {
  forms: FormsKeys;
  welcome: string;
  navbar: NavbarKeys;
  sidebar: SidebarKeys;
  login: LoginKeys;
  addUser: AddUserKeys;
  addTemplate: AddTemplateKeys;
  workflowProgress: WorkflowProgress;
  requestModal: RequestModal;
  addRequest: addRequest;
  editRequest: EditRequest;
  usersList: UsersList;
  signersPage: SignersPage;
  signatureModal: SignatureModal;
  pagination: Pagination;
  requestList: RequestList;
  document: Document;
  configureTemplate: ConfigureTemplate;
  configureQrCode: ConfigureQrCode;
  pdfOverlay: PdfDragOverlay;
  qrCodePlacement: QRCodePlacement;
  errors: Errors;
  addPlaceholder: AddPlaceholder;
  generateDocument: GenerateDocument;
  placeholderList: PlaceholderList;
  editPlaceholder: EditPlaceholder;
  validateRequest: ValidateRequest;
  assignRequest: AssignRequest;
  uploadSignedPdf: UploadSignedPdf;
  uploadDechargePdf: UploadDechargePdf;
  openValidateModal: OpenValidateModal;
  generatePDF: GeneratePDF;
  errorPage: ErrorPage;
  downloadPDF: DownloadPDF;
  ocrCompare: OcrCompare;
  languageManagement: LanguageManagement;
};

export const translations: Record<string, TranslationKeys> = {
  en,
  ar,
  fr,
  ja
};
