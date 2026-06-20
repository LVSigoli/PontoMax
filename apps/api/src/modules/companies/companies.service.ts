import {
  buildAuditCompany,
  buildChangeSet,
  recordAuditLog,
} from "../../common/audit/index.js"
import { AppError } from "../../common/errors/app-error.js"
import { prisma } from "../../lib/prisma.js"
import {
  companyAuditSnapshot,
  serializeCompany,
} from "./companies.serializer.js"

const companyDetailsInclude = {
  client: true,
  _count: {
    select: {
      users: true,
    },
  },
} as const

export async function listCompanies(params: {
  role: string
  authCompanyId: number
  clientId?: number
}) {
  if (params.role === "PLATFORM_ADMIN") {
    const companies = await prisma.company.findMany({
      where: {
        clientId: params.clientId,
      },
      include: companyDetailsInclude,
      orderBy: {
        name: "asc",
      },
    })

    return companies.map(serializeCompany)
  }

  const company = await prisma.company.findUniqueOrThrow({
    where: {
      id: params.authCompanyId,
    },
    include: companyDetailsInclude,
  })

  return [serializeCompany(company)]
}

export async function createCompany(
  data: {
    clientId: number
    name: string
    legalName: string
    tradeName?: string
    cnpj: string
    timezone: string
    isActive?: boolean
  },
  actorUserId: number
) {
  const company = await prisma.company.create({ data })

  await recordAuditLog(prisma, {
    companyId: company.id,
    actorUserId,
    entityType: "COMPANY",
    entityId: company.id,
    action: "CREATE",
    metadata: {
      summary: "Empresa criada",
      company: buildAuditCompany(company),
      details: {
        after: companyAuditSnapshot(company),
      },
    },
  })

  return company
}

export async function updateCompany(params: {
  companyId: number
  role: string
  authCompanyId: number
  actorUserId: number
  data: {
    clientId?: number
    name?: string
    legalName?: string
    tradeName?: string
    cnpj?: string
    timezone?: string
    isActive?: boolean
  }
}) {
  const currentCompany = await prisma.company.findUniqueOrThrow({
    where: { id: params.companyId },
  })

  if (
    params.role !== "PLATFORM_ADMIN" &&
    params.authCompanyId !== params.companyId
  ) {
    throw new AppError(
      "You do not have permission to update this company.",
      403
    )
  }

  if (
    params.role !== "PLATFORM_ADMIN" &&
    params.data.clientId !== undefined &&
    params.data.clientId !== currentCompany.clientId
  ) {
    throw new AppError(
      "You do not have permission to change the client of this company.",
      403
    )
  }

  const company = await prisma.company.update({
    where: { id: params.companyId },
    data: {
      ...params.data,
      clientId:
        params.role === "PLATFORM_ADMIN" ? params.data.clientId : undefined,
    },
    include: companyDetailsInclude,
  })

  await recordAuditLog(prisma, {
    companyId: company.id,
    actorUserId: params.actorUserId,
    entityType: "COMPANY",
    entityId: company.id,
    action: "UPDATE",
    metadata: {
      summary: "Empresa atualizada",
      company: buildAuditCompany(company),
      changes: buildChangeSet(
        companyAuditSnapshot(currentCompany),
        companyAuditSnapshot(company),
        [
          "clientId",
          "name",
          "legalName",
          "tradeName",
          "cnpj",
          "timezone",
          "isActive",
        ]
      ),
    },
  })

  return serializeCompany(company)
}

export async function deleteCompany(companyId: number, actorUserId: number) {
  const currentCompany = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
  })

  await prisma.$transaction(async (transaction) => {
    await recordAuditLog(transaction, {
      companyId: currentCompany.id,
      actorUserId,
      entityType: "COMPANY",
      entityId: currentCompany.id,
      action: "DELETE",
      metadata: {
        summary: "Empresa removida",
        company: buildAuditCompany(currentCompany),
        details: {
          before: companyAuditSnapshot(currentCompany),
        },
      },
    })

    await transaction.company.delete({
      where: { id: companyId },
    })
  })
}
