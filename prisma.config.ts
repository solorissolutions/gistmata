export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/gistmata?schema=public",
  },
});
