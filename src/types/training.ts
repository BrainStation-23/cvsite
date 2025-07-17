
export interface Training {
  id: string;
  title: string;
  provider: string;
  description?: string;
  date: Date;
  certificateUrl?: string;
  isRenewable?: boolean;
  expiryDate?: Date;
}
