import { CourierCredentials, CourierQueryResult, ParcelBookingPayload, ParcelBookingResult } from "./types";

const STEADFAST_BASE_URL = "https://portal.steadfast.com.bd/api/v1";

export async function querySteadfast(phone: string, credentials?: CourierCredentials): Promise<CourierQueryResult> {
  const startTime = Date.now();
  const defaultEmpty: CourierQueryResult = {
    courierCode: "steadfast",
    courierName: "Steadfast Courier",
    status: true,
    data: {
      total: 0,
      success: 0,
      cancel: 0,
      deliveredPercentage: 0,
      returnPercentage: 0,
      responseTimeMs: 0,
    },
  };

  if (!credentials?.apiKey || !credentials?.apiSecret) {
    return {
      ...defaultEmpty,
      status: false,
      message: "No Steadfast API credentials provided by merchant.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${STEADFAST_BASE_URL}/fraud_check/${phone}`, {
      method: "GET",
      headers: {
        "Api-Key": credentials.apiKey,
        "Secret-Key": credentials.apiSecret,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const elapsed = Date.now() - startTime;
    if (!res.ok) {
      return {
        ...defaultEmpty,
        status: false,
        message: `Steadfast API responded with status ${res.status}`,
        data: { ...defaultEmpty.data, responseTimeMs: elapsed },
      };
    }

    const json = await res.json();
    const data = json.data || json;

    const total = Number(data.total_parcels ?? data.total ?? 0);
    const success = Number(data.delivered_parcels ?? data.success ?? 0);
    const cancel = Number(data.cancelled_parcels ?? data.cancel ?? 0);
    const deliveredPct = total > 0 ? Math.round((success / total) * 100) : 0;
    const returnPct = total > 0 ? Math.round((cancel / total) * 100) : 0;

    return {
      courierCode: "steadfast",
      courierName: "Steadfast Courier",
      status: true,
      message: "Successfully retrieved Steadfast data",
      data: {
        total,
        success,
        cancel,
        deliveredPercentage: deliveredPct,
        returnPercentage: returnPct,
        responseTimeMs: elapsed,
      },
    };
  } catch (err: any) {
    return {
      ...defaultEmpty,
      status: false,
      message: err.name === "AbortError" ? "Steadfast API timeout" : err.message || "Failed to reach Steadfast",
      data: { ...defaultEmpty.data, responseTimeMs: Date.now() - startTime },
    };
  }
}

export async function bookSteadfastParcel(
  payload: ParcelBookingPayload,
  credentials: CourierCredentials
): Promise<ParcelBookingResult> {
  if (!credentials.apiKey || !credentials.apiSecret) {
    return {
      success: false,
      courierCode: "steadfast",
      message: "Steadfast credentials missing",
    };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: "POST",
      headers: {
        "Api-Key": credentials.apiKey,
        "Secret-Key": credentials.apiSecret,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        invoice: payload.invoiceId,
        recipient_name: payload.recipientName,
        recipient_phone: payload.recipientPhone,
        recipient_address: payload.recipientAddress,
        cod_amount: payload.codAmount,
        note: payload.note || "Booked via FraudChecker BD",
      }),
    });

    const json = await res.json();
    if (res.ok && (json.status === 200 || json.consignment)) {
      const c = json.consignment || json.data || {};
      return {
        success: true,
        courierCode: "steadfast",
        trackingCode: c.tracking_code,
        consignmentId: String(c.consignment_id),
        message: "Order placed successfully in Steadfast",
      };
    }

    return {
      success: false,
      courierCode: "steadfast",
      message: json.message || "Failed to create consignment",
    };
  } catch (err: any) {
    return {
      success: false,
      courierCode: "steadfast",
      message: err.message || "Network error while connecting to Steadfast",
    };
  }
}
