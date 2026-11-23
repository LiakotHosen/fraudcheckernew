/**
 * Bangladeshi Phone Number Normalization and Validation
 * Standardizes inputs like:
 * "+8801712345678", "8801712345678", "01712345678", "01712-345678"
 * into a canonical 11-digit string: "01712345678"
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  operator?: string;
  formatted?: string;
  error?: string;
}

const BD_OPERATOR_PREFIXES: Record<string, string> = {
  "013": "Grameenphone",
  "014": "Banglalink",
  "015": "Teletalk",
  "016": "Airtel",
  "017": "Grameenphone",
  "018": "Robi",
  "019": "Banglalink",
};

export function normalizeBDPhone(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { isValid: false, normalized: "", error: "Phone number is required" };
  }

  // Remove non-digit characters
  let digits = rawPhone.replace(/\D/g, "");

  // Handle +880 or 880 prefix
  if (digits.startsWith("880")) {
    digits = digits.substring(2);
  }

  // Ensure leading zero
  if (digits.length === 10 && !digits.startsWith("0")) {
    digits = "0" + digits;
  }

  // Must be exactly 11 digits
  if (digits.length !== 11) {
    return {
      isValid: false,
      normalized: digits,
      error: "Phone number must be 11 digits (e.g. 017XXXXXXXX)",
    };
  }

  // Check prefix
  const prefix = digits.substring(0, 3);
  const operator = BD_OPERATOR_PREFIXES[prefix];

  if (!operator) {
    return {
      isValid: false,
      normalized: digits,
      error: `Invalid operator prefix "${prefix}". Must start with 013-019`,
    };
  }

  // Format as 01XXX-XXXXXX
  const formatted = `${digits.substring(0, 5)}-${digits.substring(5)}`;

  return {
    isValid: true,
    normalized: digits,
    operator,
    formatted,
  };
}
