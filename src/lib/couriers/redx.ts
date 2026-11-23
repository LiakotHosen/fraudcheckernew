import { CourierCredentials, CourierQueryResult } from "./types";

const REDX_BASE_URL = "https://openapi.redx.com.bd/v1.0.0";

export async function queryRedX(phone: string, credentials?: CourierCredentials): Promise<CourierQueryResult> {
  const startTime = Date.now();
  const defaultEmpty: CourierQueryResult = {
    courierCode: "redx",
    courierName: "RedX Courier",
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
      message: "RedX API Key not configured",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${REDX_BASE_URL}/parcel/search?phone=${phone}`, {
      method: "GET",
      headers: {
        "API-ACCESS-TOKEN": `Bearer ${credentials.apiKey}`,
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
        message: `RedX status ${res.status}`,
        data: { ...defaultEmpty.data, responseTimeMs: elapsed },
      };
    }

    const json = await res.json();
    const d = json.data || {};
    const total = Number(d.total_parcels ?? 0);
    const success = Number(d.delivered_parcels ?? 0);
    const cancel = Number(d.cancelled_parcels ?? 0);
    const deliveredPct = total > 0 ? Math.round((success / total) * 100) : 0;
    const returnPct = total > 0 ? Math.round((cancel / total) * 100) : 0;

    return {
      courierCode: "redx",
      courierName: "RedX Courier",
      status: true,
      message: "RedX stats retrieved",
      data: {
        total,
        success,
        cancel,
        deliveredPercentage: deliveredPct,
        returnPercentage: returnPct,
        rating: d.rating || (deliveredPct >= 85 ? "good" : "regular"),
        responseTimeMs: elapsed,
      },
    };
  } catch (err: any) {
    return {
      ...defaultEmpty,
      status: false,
      message: err.name === "AbortError" ? "RedX timeout" : err.message,
      data: { ...defaultEmpty.data, responseTimeMs: Date.now() - startTime },
    };
  }
}
