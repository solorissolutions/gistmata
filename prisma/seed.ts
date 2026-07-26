import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hash } from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const hashed = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: hashed, name: "Admin" },
    create: { email, name: "Admin", password: hashed },
  });

  console.log(`Admin user synced: ${email}`);

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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
