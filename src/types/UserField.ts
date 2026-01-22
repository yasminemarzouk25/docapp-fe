export const UserFieldsArray = [
  'firstname',
  'lastname',
  'email',
  'displayName',
  'employeeId',
  'department',
  'jobTitle',
  'aboutMe',
  'mobile',
  'country',
  'state',
  'city',
  'streetAddress',
  'postalCode',
  'companyName',
  'birthday',
  'manager.firstname',
  'manager.lastname',
  'manager.jobTitle'
] as const;

export type TemplateUserField = {
  templateId: string;
  detectedPlaceholder: string;
  userField: string;
};
