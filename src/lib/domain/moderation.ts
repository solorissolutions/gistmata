import { PERSONAL_DATA_BLOCK_MESSAGE } from "@/lib/domain/constants";

const PHONE_PATTERN =
  /(?:\+?234[\s-]?)?(?:0)?[789][01]\d[\s-]?\d{3}[\s-]?\d{4}/gi;
const EMAIL_PATTERN =
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
const ACCOUNT_PATTERN =
  /\b(?:acct(?:ount)?|account|opay|kuda|moniepoint|uba|gtb|access|zenith)?[\s:#-]*\d{10}\b/gi;
const ADDRESS_PATTERN =
  /\b(?:house|flat|plot|compound|suite|apartment|room)\s*(?:no\.?\s*)?\d{1,4}\b/i;
const STREET_PATTERN =
  /\b\d{1,4}\s+[a-z][a-z'\- ]{2,}\s+(?:street|st|road|rd|close|cl|crescent|estate|avenue|ave|lane|way)\b/i;
const DOXX_PATTERN =
  /\b(?:call me|reach me on|my number is|send am to|account number|acct number|i stay for|i live at|home address)\b/i;

export type ModerationHit =
  | "phone"
  | "email"
  | "bank-account"
  | "address"
  | "doxxing";

export interface ModerationResult {
  blocked: boolean;
  message: string | null;
  hits: ModerationHit[];
}

export function detectPersonalData(text: string): ModerationResult {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  const hits = new Set<ModerationHit>();

  if (PHONE_PATTERN.test(normalized)) {
    hits.add("phone");
  }

  if (EMAIL_PATTERN.test(normalized)) {
    hits.add("email");
  }

  if (ACCOUNT_PATTERN.test(normalized)) {
    hits.add("bank-account");
  }

  if (ADDRESS_PATTERN.test(normalized) || STREET_PATTERN.test(normalized)) {
    hits.add("address");
  }

  if (DOXX_PATTERN.test(normalized)) {
    hits.add("doxxing");
  }

  const blocked = hits.size > 0;

  return {
    blocked,
    message: blocked ? PERSONAL_DATA_BLOCK_MESSAGE : null,
    hits: [...hits],
  };
}
