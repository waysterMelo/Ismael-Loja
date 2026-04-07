import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create ADMIN user
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@iwr.com' } });
  if (!existingAdmin) {
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
  } else {
    console.log('Admin user already exists');
  }

  // Create OPERATOR user
  const existingOperator = await prisma.user.findUnique({ where: { email: 'operador@iwr.com' } });
  if (!existingOperator) {
    const passwordHash = await bcrypt.hash('operador@123', 10);
    await prisma.user.create({
      data: {
        name: 'Operador Caixa',
        email: 'operador@iwr.com',
        passwordHash,
        role: 'OPERATOR',
      },
    });
    console.log('Operator user created: operador@iwr.com / operador@123');
  } else {
    console.log('Operator user already exists');
  }

  await prisma.$disconnect();
}

main();
