export type User = {
  aboutMe: string;
  birthday: string;
  city: string;
  companyName: string;
  country: string;
  department: string;
  displayName: string;
  email: string;
  employeeId: string;
  firstName: string;
  id: string;
  isActive: boolean;
  jobTitle: string;
  lastName: string;
  mobile: string;
  postalCode: string;
  state: string;
  streetAddress: string;
  signatureUrl: string | null;
};

export type SyncResponse = {
  message: string;
};

export type ConnectedUser = { id: string; fullname: string };

export type HrUsers = { id: string; firstname: string; lastname: string };

export enum UserRole {
  _Employee = 'Employee',
  _Signer = 'Signer',
  _HR = 'HR',
  _Manager = 'Manager'
}
