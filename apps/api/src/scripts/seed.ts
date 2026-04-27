import { hashPassword } from '../common/auth/password.service.js';
import { USER_ROLES } from '../common/constants/domain-enums.js';
import { parseTimeStringToDate } from '../common/utils/date.js';
import { prisma } from '../lib/prisma.js';

async function main() {
  const client = await prisma.client.upsert({
    where: {
      document: '00.000.000/0001-00',
    },
    update: {
      name: 'PontoMax Demo',
    },
    create: {
      name: 'PontoMax Demo',
      legalName: 'PontoMax Demo Ltda',
      document: '00.000.000/0001-00',
    },
  });

  const company = await prisma.company.upsert({
    where: {
      cnpj: '11.222.333/0001-44',
    },
    update: {
      name: 'PontoMax Matriz',
      clientId: client.id,
    },
    create: {
      clientId: client.id,
      name: 'PontoMax Matriz',
      legalName: 'PontoMax Matriz Ltda',
      tradeName: 'PontoMax',
      cnpj: '11.222.333/0001-44',
      timezone: 'America/Sao_Paulo',
    },
  });

  const journey = await prisma.journey.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Jornada padrao 8h',
      },
    },
    update: {
      dailyWorkMinutes: 480,
    },
    create: {
      companyId: company.id,
      name: 'Jornada padrao 8h',
      description: 'Jornada comercial padrao',
      scaleCode: '5X2',
      dailyWorkMinutes: 480,
      weeklyWorkMinutes: 2400,
      expectedEntryTime: parseTimeStringToDate('08:00'),
      expectedExitTime: parseTimeStringToDate('17:00'),
      breakMinutes: 60,
      toleranceMinutes: 10,
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      email: 'demo@pontomax.com.br',
    },
    update: {
      companyId: company.id,
      role: USER_ROLES[0],
      passwordHash: await hashPassword('123456'),
    },
    create: {
      companyId: company.id,
      employeeCode: 'ADM001',
      fullName: 'Lucas Sigoli',
      email: 'demo@pontomax.com.br',
      cpf: '000.000.000-00',
      passwordHash: await hashPassword('123456'),
      role: USER_ROLES[0],
      position: 'Administrador',
    },
  });

  await prisma.userJourneyAssignment.upsert({
    where: {
      userId_validFrom: {
        userId: admin.id,
        validFrom: new Date('2026-01-01T00:00:00.000Z'),
      },
    },
    update: {
      journeyId: journey.id,
    },
    create: {
      userId: admin.id,
      journeyId: journey.id,
      createdById: admin.id,
      validFrom: new Date('2026-01-01T00:00:00.000Z'),
    },
  });

  await prisma.holiday.upsert({
    where: {
      companyId_date_name: {
        companyId: company.id,
        date: new Date('2026-01-01T00:00:00.000Z'),
        name: 'Confraternizacao Universal',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Confraternizacao Universal',
      date: new Date('2026-01-01T00:00:00.000Z'),
      type: 'NATIONAL',
    },
  });

  console.log('Seed finished successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
