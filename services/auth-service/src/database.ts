import { PrismaClient } from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn", "info"]
      : ["error"],
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
  await pool.end();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

export default prisma;

// Export a disconnect function for tests
export async function disconnectDatabase() {
  await prisma.$disconnect();
  await pool.end();
}
