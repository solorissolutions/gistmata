import { addDays, addHours, addMinutes } from "date-fns";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashSecretValue(value: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(value, salt, 64).toString("hex");
  return `scrypt:${salt}:${digest}`;
}

export function verifySecretValue(value: string, storedHash: string | null | undefined) {
  if (!storedHash) {
    return false;
  }

  if (storedHash.startsWith("scrypt:")) {
    const [, salt, digest] = storedHash.split(":");

    if (!salt || !digest) {
      return false;
    }

    const expected = Buffer.from(digest, "hex");
    const actual = scryptSync(value, salt, expected.length);

    return timingSafeEqual(actual, expected);
  }

  return hashValue(value) === storedHash;
}

export function makeId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

export function randomToken(bytes = 24) {
  return randomBytes(bytes).toString("hex");
}

export function daysFromNow(days: number) {
  return addDays(new Date(), days).toISOString();
}

export function daysAgo(days: number) {
  return addDays(new Date(), -days).toISOString();
}

export function hoursAgo(hours: number) {
  return addHours(new Date(), -hours).toISOString();
}

export function minutesAgo(minutes: number) {
  return addMinutes(new Date(), -minutes).toISOString();
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCodePart(length: number) {
  return Array.from({ length }, () => {
    return CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }).join("");
}

export function createAccountCode() {
  return `MATA-${randomCodePart(4)}-${randomCodePart(4)}`;
}

export function createReferralCode() {
  return `${randomCodePart(4)}-${randomCodePart(4)}`;
}
