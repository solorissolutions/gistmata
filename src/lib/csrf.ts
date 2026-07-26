import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { createHmac } from "crypto";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET must be set");
  return secret;
}

function generateToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function signToken(token: string): string {
  const hmac = createHmac("sha256", getSecret());
  hmac.update(token);
  return token + "." + hmac.digest("hex");
}

function unsignToken(signed: string): string | null {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const token = signed.slice(0, dot);
  const expected = signToken(token);
  if (signed.length !== expected.length) return null;
  try {
    return timingSafeEqual(Buffer.from(signed), Buffer.from(expected))
      ? token
      : null;
  } catch {
    return null;
  }
}

export function generateCsrfToken(): string {
  return signToken(generateToken());
}

export function validateCsrfToken(signed: string | null | undefined): boolean {
  if (!signed) return false;
  return unsignToken(signed) !== null;
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateToken();
  const cookieStore = await cookies();
  cookieStore.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });
  return token;
}

export async function validateCsrf(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const cookieStore = await cookies();
  const stored = cookieStore.get("csrf-token")?.value;
  if (!stored) return false;
  const buf1 = Buffer.from(token);
  const buf2 = Buffer.from(stored);
  if (buf1.length !== buf2.length) return false;
  try {
    return timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
}
