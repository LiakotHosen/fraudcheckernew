import crypto from "crypto";

// 32-byte secret key from environment or fallback for development
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "fraudchecker_bd_enterprise_secret_32bytes!!";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive plaintext (such as Courier API keys and Secrets)
 * Returns a base64 encoded string: iv:authTag:ciphertext
 */
export function encryptVaultData(text: string): string {
  if (!text) return "";
  const key = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt vaulted data back to plaintext
 */
export function decryptVaultData(vaultString: string): string {
  if (!vaultString) return "";
  try {
    const parts = vaultString.split(":");
    if (parts.length !== 3) return "";

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

/**
 * Generate a SHA-256 hash of an API Key for secure database lookup
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Generate a new random API key for a merchant
 */
export function generateMerchantApiKey(): { rawKey: string; keyPrefix: string; keyHash: string } {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `fc_live_${randomBytes}`;
  const keyPrefix = rawKey.substring(0, 16);
  const keyHash = hashApiKey(rawKey);

  return { rawKey, keyPrefix, keyHash };
}
