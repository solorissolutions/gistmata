import { prisma } from "./prisma";

export function rateLimitHeaders(rl: { allowed: boolean; remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Limit": String(rl.remaining + (rl.allowed ? 1 : 0)),
    "X-RateLimit-Remaining": String(Math.max(0, rl.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
  };
}

export async function rateLimit(
  key: string,
  opts: { interval: number; maxRequests: number }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || now > existing.resetAt.getTime()) {
    await prisma.rateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt: new Date(now + opts.interval) },
      create: { key, count: 1, resetAt: new Date(now + opts.interval) },
    });
    return { allowed: true, remaining: opts.maxRequests - 1, resetAt: now + opts.interval };
  }

  if (existing.count >= opts.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt.getTime() };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: existing.count + 1 },
  });

  return { allowed: true, remaining: opts.maxRequests - (existing.count + 1), resetAt: existing.resetAt.getTime() };
}
