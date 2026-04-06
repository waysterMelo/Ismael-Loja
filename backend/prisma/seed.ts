import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@iwr.com' } });
  if (existing) {
    console.log('Admin user already exists');
    prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash('admin@123', 10);

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@iwr.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created: admin@iwr.com / admin@123');
  await prisma.$disconnect();
}

main();
