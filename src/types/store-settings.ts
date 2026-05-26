export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface PaymentSettings {
  // Bank Transfer
  bankTransferEnabled: boolean;
  bankAccounts: BankAccount[];

  // Midtrans
  midtransEnabled: boolean;
  serverKey: string;
  clientKey: string;
  merchantId?: string;
  isProduction: boolean;

  // Cash on Delivery
  codEnabled: boolean;

  // QRIS
  qrisEnabled: boolean;
  qrisImageUrl: string;
}

export interface ShippingSettings {
  apiKey: string;
}

export interface ShippingOrigin {
  id: string;
  cityId: number;
  cityName: string;
  provinceName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface SettingsAuditLog {
  id: string;
  settingKey: string;
  action: 'created' | 'updated' | 'deleted';
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface StoreSettingsOverview {
  payment: {
    configured: boolean;
    isProduction: boolean;
    lastUpdated?: string;
    updatedBy?: string;
  };
  shipping: {
    configured: boolean;
    accountType?: string;
    originsCount: number;
    lastUpdated?: string;
    updatedBy?: string;
  };
  recentChanges: SettingsAuditLog[];
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: any;
}
