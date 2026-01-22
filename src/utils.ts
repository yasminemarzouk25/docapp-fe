export function displayFieldOrDash(field: string): string {
  return field.length > 0 ? field : '-';
}

const ALLOWED_ROUTES = [
  '/',
  '/app',
  '/dashboard',
  '/documents',
  '/users',
  '/signers',
  '/requests',
  '/add-user',
  '/generate-document',
  '/placeholders',
  '/languages',
  '/add-template',
  '/add-request',
  '/edit-request',
  '/assign-request',
  '/edit-template',
  '/configure-template',
  '/configure-qr-code',
  '/administrative-documents'
];

export const isValidRedirect = (redirectTo: string): boolean => {
  return (
    ALLOWED_ROUTES.some((route) => redirectTo.startsWith(route)) &&
    redirectTo.startsWith('/') &&
    !redirectTo.startsWith('//') &&
    redirectTo !== '/login'
  );
};
