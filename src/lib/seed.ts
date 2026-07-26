import { prisma } from "./prisma";
import { hash } from "bcryptjs";
import "dotenv/config";

export async function seed() {
  const email = process.env.ADMIN_EMAIL || "admin@gistmata.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await hash(password, 12);
    await prisma.user.create({
      data: { email, name: "Admin", password: hashed },
    });
    console.log(`Seeded admin user: ${email}`);
  }

  const siteConfig = await prisma.siteConfig.findUnique({
    where: { id: "default" },
  });
  if (!siteConfig) {
    await prisma.siteConfig.create({ data: { id: "default" } });
    console.log("Seeded site config");
  }

  const upcomingCount = await prisma.upcoming.count();
  if (upcomingCount === 0) {
    await prisma.upcoming.createMany({
      data: [
        { title: "N-QAI Research Note #001", category: "n-qai", sortOrder: 0 },
        { title: "The Last Resonance #001", category: "last-resonance", sortOrder: 1 },
        { title: "Vibe Hacking Framework", category: "vibe-hacking", sortOrder: 2 },
        { title: "Future Intelligence Architectures", category: "n-qai", sortOrder: 3 },
      ],
    });
    console.log("Seeded upcoming items");
  }
}
