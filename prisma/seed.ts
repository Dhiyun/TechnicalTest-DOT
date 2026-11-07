import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "superadmin@test.com";
  const password = "Superadmin123!";

  const superadmin = await prisma.users.upsert({
    where: { email },
    update: {},
    create: {
      nama: 'Super Admin',
      email,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  console.log(`Superadmin: ${superadmin.email}`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
