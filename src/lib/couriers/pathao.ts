import { CourierCredentials, CourierQueryResult, ParcelBookingPayload, ParcelBookingResult } from "./types";

const PATHAO_BASE_URL = "https://api-hermes.pathao.com/aladdin/api/v1";

export async function queryPathao(phone: string, credentials?: CourierCredentials): Promise<CourierQueryResult> {
  const startTime = Date.now();
  const defaultEmpty: CourierQueryResult = {
    courierCode: "pathao",
    courierName: "Pathao Courier",
    status: true,
    data: {
      total: 0,
      success: 0,
      cancel: 0,
      deliveredPercentage: 0,
      returnPercentage: 0,
      rating: "new_customer",
      responseTimeMs: 0,
    },
  };

  if (!credentials?.apiKey) {
    return {
      ...defaultEmpty,
      status: false,
      message: "Pathao API Token / Key not configured",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Pathao merchant order search / customer insights
    const res = await fetch(`${PATHAO_BASE_URL}/user/insights?phone=${phone}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
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
        message: `Pathao API responded with status ${res.status}`,
        data: { ...defaultEmpty.data, responseTimeMs: elapsed },
      };
    }

    const json = await res.json();
    const d = json.data || {};
    const total = Number(d.total_orders ?? 0);
    const success = Number(d.delivered_orders ?? 0);
    const cancel = Number(d.returned_orders ?? 0);
    const deliveredPct = total > 0 ? Math.round((success / total) * 100) : 0;
    const returnPct = total > 0 ? Math.round((cancel / total) * 100) : 0;

    return {
      courierCode: "pathao",
      courierName: "Pathao Courier",
      status: true,
      message: "Pathao stats retrieved",
      data: {
        total,
        success,
        cancel,
        deliveredPercentage: deliveredPct,
        returnPercentage: returnPct,
        rating: d.rating || (deliveredPct >= 90 ? "excellent_customer" : "standard"),
        responseTimeMs: elapsed,
      },
    };
  } catch (err: any) {
    return {
      ...defaultEmpty,
      status: false,
      message: err.name === "AbortError" ? "Pathao API timeout" : err.message,
      data: { ...defaultEmpty.data, responseTimeMs: Date.now() - startTime },
    };
  }
}

export async function bookPathaoParcel(
  payload: ParcelBookingPayload,
  credentials: CourierCredentials
): Promise<ParcelBookingResult> {
  if (!credentials.apiKey) {
    return {
      success: false,
      courierCode: "pathao",
      message: "Pathao token missing",
    };
  }

  const storeId = credentials.additionalConfig?.storeId || credentials.apiSecret;

  try {
    const res = await fetch(`${PATHAO_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        store_id: storeId,
        merchant_order_id: payload.invoiceId,
        recipient_name: payload.recipientName,
        recipient_phone: payload.recipientPhone,
        recipient_address: payload.recipientAddress,
        amount_to_collect: payload.codAmount,
        special_instruction: payload.note || "Booked via FraudChecker BD",
        item_type: 2, // Parcel
        delivery_type: 48, // Standard delivery
      }),
    });

    const json = await res.json();
    if (res.ok && json.data?.consignment_id) {
      return {
        success: true,
        courierCode: "pathao",
        trackingCode: json.data.consignment_id,
        consignmentId: json.data.consignment_id,
        message: "Order placed successfully in Pathao",
      };
    }

    return {
      success: false,
      courierCode: "pathao",
      message: json.message || "Failed to book with Pathao",
    };
  } catch (err: any) {
    return {
      success: false,
      courierCode: "pathao",
      message: err.message || "Network error while connecting to Pathao",
    };
  }
}
