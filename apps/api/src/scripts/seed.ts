import path from "node:path"
import { fileURLToPath } from "node:url"

import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"

import { hashPassword } from "../common/auth/password.service.js"
import { getDateOnly, parseTimeStringToDate } from "../common/utils/date.js"

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url))
const workspaceEnvPath = path.resolve(currentDirectoryPath, "../../../../.env")

config({ path: workspaceEnvPath })

const prisma = new PrismaClient({
  datasourceUrl: buildSeedDatabaseUrl(),
})

const DEMO_PASSWORD = "123456"
const COMPANY_TIMEZONE = "America/Sao_Paulo"
const DEFAULT_SCHEDULE_MINUTES = 480
const DEMO_VALID_FROM = new Date("2026-01-01T00:00:00.000Z")
const LOCAL_TIME_OFFSET_HOURS = 3

type DemoTimeEntryKind = "ENTRY" | "EXIT"

type DemoTimeEntrySeed = {
  kind: DemoTimeEntryKind
  time: string
}

type DemoWorkdayStatus =
  | "ADJUSTED"
  | "CLOSED"
  | "INCONSISTENT"
  | "LATE"
  | "PENDING_ADJUSTMENT"

type DemoWorkdaySeed = {
  dayOffset: number
  missingMinutes: number
  overtimeMinutes: number
  status: DemoWorkdayStatus
  timeEntries: DemoTimeEntrySeed[]
  userEmail: string
  workedMinutes: number
}

type DemoAdjustmentRequestStatus = "APPROVED" | "PENDING" | "REJECTED"

type DemoAdjustmentRequestSeed = {
  dayOffset: number
  justification: string
  reviewedByEmail?: string
  reviewNotes?: string
  requestedAtTime: string
  status: DemoAdjustmentRequestStatus
  userEmail: string
  workdayStatus: DemoWorkdayStatus
}

async function main() {
  console.log("[seed] Conectando ao banco de dados...")
  await prisma.$connect()
  console.log("[seed] Conexao estabelecida.")

  console.log("[seed] Preparando cliente, empresa e jornada...")
  const demoPasswordHash = await hashPassword(DEMO_PASSWORD)

  const client = await prisma.client.upsert({
    where: {
      document: "00.000.000/0001-00",
    },
    update: {
      name: "PontoMax Demo",
    },
    create: {
      name: "PontoMax Demo",
      legalName: "PontoMax Demo Ltda",
      document: "00.000.000/0001-00",
    },
  })

  const company = await prisma.company.upsert({
    where: {
      cnpj: "11.222.333/0001-44",
    },
    update: {
      clientId: client.id,
      name: "PontoMax Matriz",
      timezone: COMPANY_TIMEZONE,
    },
    create: {
      clientId: client.id,
      name: "PontoMax Matriz",
      legalName: "PontoMax Matriz Ltda",
      tradeName: "PontoMax",
      cnpj: "11.222.333/0001-44",
      timezone: COMPANY_TIMEZONE,
    },
  })

  const journey = await prisma.journey.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: "Jornada padrao 8h",
      },
    },
    update: {
      dailyWorkMinutes: 480,
    },
    create: {
      companyId: company.id,
      name: "Jornada padrao 8h",
      description: "Jornada comercial padrao",
      scaleCode: "5X2",
      dailyWorkMinutes: 480,
      weeklyWorkMinutes: 2400,
      expectedEntryTime: parseTimeStringToDate("08:00"),
      expectedExitTime: parseTimeStringToDate("17:00"),
      breakMinutes: 60,
      toleranceMinutes: 10,
    },
  })

  const admin = await prisma.user.upsert({
    where: {
      email: "demo@pontomax.com.br",
    },
    update: {
      companyId: company.id,
      role: "PLATFORM_ADMIN",
      passwordHash: demoPasswordHash,
    },
    create: {
      companyId: company.id,
      employeeCode: "ADM001",
      fullName: "Lucas Sigoli",
      email: "demo@pontomax.com.br",
      cpf: "000.000.000-00",
      passwordHash: demoPasswordHash,
      role: "PLATFORM_ADMIN",
      position: "Administrador",
    },
  })

  await prisma.userJourneyAssignment.upsert({
    where: {
      userId_validFrom: {
        userId: admin.id,
        validFrom: DEMO_VALID_FROM,
      },
    },
    update: {
      journeyId: journey.id,
    },
    create: {
      userId: admin.id,
      journeyId: journey.id,
      createdById: admin.id,
      validFrom: DEMO_VALID_FROM,
    },
  })

  const demoEmployees = [
    {
      cpf: "111.111.111-11",
      email: "maria.demo@pontomax.com.br",
      employeeCode: "EMP002",
      fullName: "Maria Santos",
      position: "Analista de RH",
    },
    {
      cpf: "222.222.222-22",
      email: "joao.demo@pontomax.com.br",
      employeeCode: "EMP003",
      fullName: "Joao Pereira",
      position: "Analista Administrativo",
    },
    {
      cpf: "333.333.333-33",
      email: "ana.demo@pontomax.com.br",
      employeeCode: "EMP004",
      fullName: "Ana Costa",
      position: "Assistente de Operacoes",
    },
    {
      cpf: "444.444.444-44",
      email: "pedro.demo@pontomax.com.br",
      employeeCode: "EMP005",
      fullName: "Pedro Lima",
      position: "Tecnico de Campo",
    },
  ] as const

  console.log("[seed] Criando colaboradores demonstrativos...")
  const demoUsers = await Promise.all(
    demoEmployees.map(async (employee) => {
      const user = await prisma.user.upsert({
        where: {
          email: employee.email,
        },
        update: {
          companyId: company.id,
          cpf: employee.cpf,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          isActive: true,
          passwordHash: demoPasswordHash,
          position: employee.position,
          role: "EMPLOYEE",
        },
        create: {
          companyId: company.id,
          cpf: employee.cpf,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          email: employee.email,
          isActive: true,
          passwordHash: demoPasswordHash,
          position: employee.position,
          role: "EMPLOYEE",
        },
      })

      await prisma.userJourneyAssignment.upsert({
        where: {
          userId_validFrom: {
            userId: user.id,
            validFrom: DEMO_VALID_FROM,
          },
        },
        update: {
          journeyId: journey.id,
        },
        create: {
          userId: user.id,
          journeyId: journey.id,
          createdById: admin.id,
          validFrom: DEMO_VALID_FROM,
        },
      })

      return user
    })
  )

  const demoUsersByEmail = new Map(
    [admin, ...demoUsers].map((user) => [user.email, user] as const)
  )
  const today = getDateOnly(new Date(), COMPANY_TIMEZONE)

  const demoWorkdays: DemoWorkdaySeed[] = [
    {
      dayOffset: -6,
      missingMinutes: 0,
      overtimeMinutes: 40,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:40" },
      ],
      userEmail: "maria.demo@pontomax.com.br",
      workedMinutes: 520,
    },
    {
      dayOffset: -6,
      missingMinutes: 10,
      overtimeMinutes: 0,
      status: "LATE",
      timeEntries: [
        { kind: "ENTRY", time: "08:20" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:10" },
      ],
      userEmail: "joao.demo@pontomax.com.br",
      workedMinutes: 470,
    },
    {
      dayOffset: -6,
      missingMinutes: 0,
      overtimeMinutes: 30,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:30" },
      ],
      userEmail: "ana.demo@pontomax.com.br",
      workedMinutes: 510,
    },
    {
      dayOffset: -6,
      missingMinutes: 0,
      overtimeMinutes: 0,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:00" },
      ],
      userEmail: "pedro.demo@pontomax.com.br",
      workedMinutes: 480,
    },
    {
      dayOffset: -4,
      missingMinutes: 0,
      overtimeMinutes: 60,
      status: "ADJUSTED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "18:00" },
      ],
      userEmail: "maria.demo@pontomax.com.br",
      workedMinutes: 540,
    },
    {
      dayOffset: -4,
      missingMinutes: 20,
      overtimeMinutes: 0,
      status: "LATE",
      timeEntries: [
        { kind: "ENTRY", time: "08:20" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:00" },
      ],
      userEmail: "joao.demo@pontomax.com.br",
      workedMinutes: 460,
    },
    {
      dayOffset: -4,
      missingMinutes: 0,
      overtimeMinutes: 20,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:20" },
      ],
      userEmail: "ana.demo@pontomax.com.br",
      workedMinutes: 500,
    },
    {
      dayOffset: -4,
      missingMinutes: 0,
      overtimeMinutes: 40,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:40" },
      ],
      userEmail: "pedro.demo@pontomax.com.br",
      workedMinutes: 520,
    },
    {
      dayOffset: -3,
      missingMinutes: 0,
      overtimeMinutes: 10,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:10" },
      ],
      userEmail: "maria.demo@pontomax.com.br",
      workedMinutes: 490,
    },
    {
      dayOffset: -3,
      missingMinutes: 250,
      overtimeMinutes: 0,
      status: "INCONSISTENT",
      timeEntries: [
        { kind: "ENTRY", time: "08:10" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
      ],
      userEmail: "joao.demo@pontomax.com.br",
      workedMinutes: 230,
    },
    {
      dayOffset: -3,
      missingMinutes: 0,
      overtimeMinutes: 40,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:40" },
      ],
      userEmail: "ana.demo@pontomax.com.br",
      workedMinutes: 520,
    },
    {
      dayOffset: -3,
      missingMinutes: 0,
      overtimeMinutes: 0,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:00" },
      ],
      userEmail: "pedro.demo@pontomax.com.br",
      workedMinutes: 480,
    },
    {
      dayOffset: -1,
      missingMinutes: 0,
      overtimeMinutes: 30,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:30" },
      ],
      userEmail: "maria.demo@pontomax.com.br",
      workedMinutes: 510,
    },
    {
      dayOffset: -1,
      missingMinutes: 0,
      overtimeMinutes: 0,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:00" },
      ],
      userEmail: "joao.demo@pontomax.com.br",
      workedMinutes: 480,
    },
    {
      dayOffset: -1,
      missingMinutes: 0,
      overtimeMinutes: 50,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:50" },
      ],
      userEmail: "ana.demo@pontomax.com.br",
      workedMinutes: 530,
    },
    {
      dayOffset: -1,
      missingMinutes: 0,
      overtimeMinutes: 40,
      status: "ADJUSTED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:40" },
      ],
      userEmail: "pedro.demo@pontomax.com.br",
      workedMinutes: 520,
    },
    {
      dayOffset: 0,
      missingMinutes: 0,
      overtimeMinutes: 20,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "17:20" },
      ],
      userEmail: "maria.demo@pontomax.com.br",
      workedMinutes: 500,
    },
    {
      dayOffset: 0,
      missingMinutes: 0,
      overtimeMinutes: 40,
      status: "LATE",
      timeEntries: [
        { kind: "ENTRY", time: "08:20" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "18:00" },
      ],
      userEmail: "joao.demo@pontomax.com.br",
      workedMinutes: 520,
    },
    {
      dayOffset: 0,
      missingMinutes: 250,
      overtimeMinutes: 0,
      status: "PENDING_ADJUSTMENT",
      timeEntries: [
        { kind: "ENTRY", time: "08:10" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
      ],
      userEmail: "ana.demo@pontomax.com.br",
      workedMinutes: 230,
    },
    {
      dayOffset: 0,
      missingMinutes: 0,
      overtimeMinutes: 60,
      status: "CLOSED",
      timeEntries: [
        { kind: "ENTRY", time: "08:00" },
        { kind: "EXIT", time: "12:00" },
        { kind: "ENTRY", time: "13:00" },
        { kind: "EXIT", time: "18:00" },
      ],
      userEmail: "pedro.demo@pontomax.com.br",
      workedMinutes: 540,
    },
  ]

  console.log(`[seed] Gravando ${demoWorkdays.length} jornadas...`)
  await runInBatches(demoWorkdays, 5, async (workdaySeed) => {
    const user = demoUsersByEmail.get(workdaySeed.userEmail)

    if (!user) {
      throw new Error(`Demo user not found for ${workdaySeed.userEmail}`)
    }

    await upsertDemoWorkday({
      companyId: company.id,
      date: addDays(today, workdaySeed.dayOffset),
      seed: workdaySeed,
      userId: user.id,
    })
  })

  const demoRequests: DemoAdjustmentRequestSeed[] = [
    {
      dayOffset: -4,
      justification: "Esqueci de registrar a saida do almoco.",
      requestedAtTime: "15:30",
      reviewedByEmail: admin.email,
      reviewNotes: "Ajuste validado com o gestor da area.",
      status: "APPROVED",
      userEmail: "maria.demo@pontomax.com.br",
      workdayStatus: "ADJUSTED",
    },
    {
      dayOffset: -3,
      justification: "Registro ficou incompleto por queda de energia.",
      requestedAtTime: "11:45",
      reviewedByEmail: admin.email,
      reviewNotes: "Sem evidencia suficiente para aprovar.",
      status: "REJECTED",
      userEmail: "joao.demo@pontomax.com.br",
      workdayStatus: "INCONSISTENT",
    },
    {
      dayOffset: -1,
      justification: "Precisei corrigir o horario do ultimo ponto.",
      requestedAtTime: "10:00",
      reviewedByEmail: admin.email,
      reviewNotes: "Solicitacao aprovada apos conferencias internas.",
      status: "APPROVED",
      userEmail: "pedro.demo@pontomax.com.br",
      workdayStatus: "ADJUSTED",
    },
    {
      dayOffset: 0,
      justification: "Pendente de validacao para fechar o turno.",
      requestedAtTime: "09:00",
      status: "PENDING",
      userEmail: "ana.demo@pontomax.com.br",
      workdayStatus: "PENDING_ADJUSTMENT",
    },
  ]

  console.log(
    `[seed] Gravando ${demoRequests.length} solicitacoes de ajuste...`
  )
  await runInBatches(demoRequests, 4, async (requestSeed) => {
    const user = demoUsersByEmail.get(requestSeed.userEmail)

    if (!user) {
      throw new Error(`Demo user not found for ${requestSeed.userEmail}`)
    }

    await upsertDemoAdjustmentRequest({
      companyId: company.id,
      date: addDays(today, requestSeed.dayOffset),
      reviewedById: requestSeed.reviewedByEmail
        ? demoUsersByEmail.get(requestSeed.reviewedByEmail)?.id
        : undefined,
      seed: requestSeed,
      userId: user.id,
    })
  })

  console.log("[seed] Atualizando feriados demonstrativos...")
  const nationalHolidayDate = new Date("2026-01-01T00:00:00.000Z")
  const currentNationalHoliday = await prisma.holiday.findFirst({
    where: {
      name: "Confraternizacao Universal",
      date: nationalHolidayDate,
      type: "NATIONAL",
    },
  })

  if (!currentNationalHoliday) {
    await prisma.holiday.create({
      data: {
        name: "Confraternizacao Universal",
        date: nationalHolidayDate,
        type: "NATIONAL",
      },
    })
  }

  console.log("[seed] Seed concluido com sucesso.")
}

function buildSeedDatabaseUrl() {
  const rawUrl =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim()

  if (!rawUrl) {
    throw new Error("Missing environment variable: DIRECT_URL or DATABASE_URL")
  }

  const databaseUrl = new URL(rawUrl)

  databaseUrl.searchParams.set("connect_timeout", "10")
  databaseUrl.searchParams.set("connection_limit", "5")
  databaseUrl.searchParams.set("pool_timeout", "20")

  return databaseUrl.toString()
}

async function runInBatches<T>(
  items: T[],
  batchSize: number,
  operation: (item: T) => Promise<void>
) {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize)

    await Promise.all(batch.map(operation))
    console.log(
      `[seed] Progresso: ${Math.min(index + batch.length, items.length)}/${items.length}`
    )
  }
}

async function upsertDemoAdjustmentRequest(params: {
  companyId: number
  date: Date
  reviewedById?: number
  seed: DemoAdjustmentRequestSeed
  userId: number
}) {
  const workday = await prisma.workday.findUniqueOrThrow({
    where: {
      userId_date: {
        date: params.date,
        userId: params.userId,
      },
    },
  })

  const requestedAt = makeDemoDateTime(params.date, params.seed.requestedAtTime)
  const reviewedAt =
    params.seed.status === "PENDING"
      ? null
      : makeDemoDateTime(params.date, "18:00")

  const existingRequest = await prisma.adjustmentRequest.findFirst({
    where: {
      companyId: params.companyId,
      justification: params.seed.justification,
      userId: params.userId,
      workdayId: workday.id,
    },
  })

  const requestData = {
    companyId: params.companyId,
    justification: params.seed.justification,
    requestedAt,
    reviewNotes: params.seed.reviewNotes ?? null,
    reviewedAt,
    reviewedById:
      params.seed.status === "PENDING" ? null : (params.reviewedById ?? null),
    status: params.seed.status,
    userId: params.userId,
    workdayId: workday.id,
  }

  if (existingRequest) {
    await prisma.adjustmentRequest.update({
      data: requestData,
      where: {
        id: existingRequest.id,
      },
    })
  } else {
    await prisma.adjustmentRequest.create({
      data: requestData,
    })
  }

  await prisma.workday.update({
    data: {
      status: params.seed.workdayStatus,
    },
    where: {
      id: workday.id,
    },
  })
}

async function upsertDemoWorkday(params: {
  companyId: number
  date: Date
  seed: DemoWorkdaySeed
  userId: number
}) {
  const timeEntries = params.seed.timeEntries.map((timeEntry, index) => ({
    kind: timeEntry.kind,
    recordedAt: makeDemoDateTime(params.date, timeEntry.time),
    sequence: index + 1,
    source: "WEB",
    status: "ACTIVE",
    timezone: COMPANY_TIMEZONE,
    userId: params.userId,
  }))

  await prisma.workday.upsert({
    where: {
      userId_date: {
        date: params.date,
        userId: params.userId,
      },
    },
    update: {
      holidayId: null,
      isHoliday: false,
      missingMinutes: params.seed.missingMinutes,
      nightMinutes: 0,
      overtimeMinutes: params.seed.overtimeMinutes,
      scheduledMinutes: DEFAULT_SCHEDULE_MINUTES,
      status: params.seed.status,
      timeEntries: {
        create: timeEntries,
        deleteMany: {},
      },
      workedMinutes: params.seed.workedMinutes,
    },
    create: {
      companyId: params.companyId,
      date: params.date,
      holidayId: null,
      isHoliday: false,
      missingMinutes: params.seed.missingMinutes,
      nightMinutes: 0,
      overtimeMinutes: params.seed.overtimeMinutes,
      scheduledMinutes: DEFAULT_SCHEDULE_MINUTES,
      status: params.seed.status,
      timeEntries: {
        create: timeEntries,
      },
      userId: params.userId,
      workedMinutes: params.seed.workedMinutes,
    },
  })
}

function addDays(value: Date, amount: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate() + amount
    )
  )
}

function makeDemoDateTime(date: Date, time: string) {
  const [hours = "00", minutes = "00"] = time.split(":")

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      Number(hours) + LOCAL_TIME_OFFSET_HOURS,
      Number(minutes)
    )
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
