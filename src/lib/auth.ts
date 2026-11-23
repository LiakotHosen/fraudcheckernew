import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase/admin";

export interface UserSession {
  id: string;
  email: string;
  companyName: string;
  phone: string;
  role: "merchant" | "admin" | "super_admin";
  tier: "free" | "pro" | "business";
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const AUTH_COOKIE_NAME = "fc_session";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "fc_salt_2026").digest("hex");
}

function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    // Seed default super admin
    const defaultAdmin = {
      id: "usr_admin_001",
      email: "admin@fraudchecker.bd",
      passwordHash: hashPassword("admin12345"),
      companyName: "FraudChecker BD Admin",
      phone: "01700000000",
      role: "super_admin",
      tier: "business",
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin], null, 2), "utf8");
  }
}

export function getAllLocalUsers(): any[] {
  ensureUsersFile();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

export function registerLocalUser(data: {
  email: string;
  password: string;
  companyName: string;
  phone: string;
}): { success: boolean; message?: string; user?: UserSession } {
  ensureUsersFile();
  const users = getAllLocalUsers();
  const normalizedEmail = data.email.toLowerCase().trim();

  if (users.find((u) => u.email === normalizedEmail)) {
    return { success: false, message: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে।" };
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: normalizedEmail,
    passwordHash: hashPassword(data.password),
    companyName: data.companyName.trim(),
    phone: data.phone.trim(),
    role: "merchant",
    tier: "free",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");

  const session: UserSession = {
    id: newUser.id,
    email: newUser.email,
    companyName: newUser.companyName,
    phone: newUser.phone,
    role: "merchant",
    tier: "free",
  };

  return { success: true, user: session };
}

export function loginLocalUser(email: string, password: string): { success: boolean; message?: string; user?: UserSession } {
  ensureUsersFile();
  const users = getAllLocalUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const target = users.find((u) => u.email === normalizedEmail);

  if (!target) {
    return { success: false, message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" };
  }

  if (target.passwordHash !== hashPassword(password)) {
    return { success: false, message: "ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।" };
  }

  const session: UserSession = {
    id: target.id,
    email: target.email,
    companyName: target.companyName,
    phone: target.phone,
    role: target.role || "merchant",
    tier: target.tier || "free",
  };

  return { success: true, user: session };
}

export async function getCurrentUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const session: UserSession = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    return session;
  } catch {
    return null;
  }
}

export function createSessionCookieString(session: UserSession): string {
  return Buffer.from(JSON.stringify(session)).toString("base64");
}
