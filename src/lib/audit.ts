import { prisma } from "./prisma";

export type AuditAction =
  | "article.create"
  | "article.update"
  | "article.delete"
  | "article.publish"
  | "article.unpublish"
  | "article.feature"
  | "article.unfeature"
  | "upcoming.create"
  | "upcoming.update"
  | "upcoming.delete"
  | "upcoming.reorder"
  | "media.upload"
  | "media.delete";

export async function logAuditEvent(
  action: AuditAction,
  entityType: string,
  entityId?: string,
  details?: string,
  ip?: string
) {
  try {
    await prisma.auditLog.create({
      data: { action, entityType, entityId, details, ip },
    });
  } catch {
    // audit logging should never throw
  }
}
