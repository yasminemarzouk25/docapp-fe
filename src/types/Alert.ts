export type AlertStatus = 'success' | 'error' | 'info';
export interface Alert {
  message: string;
  status: AlertStatus;
}
