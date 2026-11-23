export type CourierCode = "steadfast" | "pathao" | "redx" | "carrybee" | "paperfly";

export interface CourierStats {
  total: number;
  success: number;
  cancel: number;
  deliveredPercentage: number;
  returnPercentage: number;
  rating?: string;
  responseTimeMs?: number;
}

export interface CourierQueryResult {
  courierCode: CourierCode;
  courierName: string;
  status: boolean;
  message?: string;
  data: CourierStats;
}

export interface CourierCredentials {
  apiKey: string;
  apiSecret?: string;
  additionalConfig?: Record<string, any>;
}

export interface ParcelBookingPayload {
  invoiceId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface ParcelBookingResult {
  success: boolean;
  trackingCode?: string;
  consignmentId?: string;
  courierCode: CourierCode;
  message?: string;
}
