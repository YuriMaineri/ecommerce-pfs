import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPasswordHash = await bcrypt.hash('12345678', 10);
  await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@email.com',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const customerPasswordHash = await bcrypt.hash('12345678', 10);
  await prisma.user.upsert({
    where: { email: 'customer@email.com' },
    update: {},
    create: {
      name: 'Customer',
      email: 'customer@email.com',
      password: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });

  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    await prisma.category.createMany({
      data: [
        { name: 'Electronics', description: 'Devices and accessories' },
        { name: 'Books', description: 'Printed and digital books' },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
