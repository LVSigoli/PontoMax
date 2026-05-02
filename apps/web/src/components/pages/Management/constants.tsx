// Types
import type { TableAction } from "@/components/structure/Table/types"
import type { Company, Employee, Journey, ManagementTabOption } from "./types"

export const MANAGEMENT_TABS: ManagementTabOption[] = [
  {
    id: "companies",
    label: "Empresas",
    icon: "building",
  },
  {
    id: "employees",
    label: "Funcionarios",
    icon: "user",
  },
  {
    id: "journeys",
    label: "Jornadas",
    icon: "clock",
  },
]

export const INITIAL_COMPANIES: Company[] = [
  { id: 1, name: "SOFTABLE", cnpj: "11.222.333/0001-44", employees: 45 },
  { id: 2, name: "BIOTRONICA", cnpj: "11.222.333/0001-44", employees: 45 },
  { id: 3, name: "SALESPACE", cnpj: "11.222.333/0001-44", employees: 45 },
  { id: 4, name: "IFSP", cnpj: "11.222.333/0001-44", employees: 45 },
]

export const INITIAL_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Jornada padrao 8h",
    flexible: false,
    startTime: "08:00",
    endTime: "17:00",
    interval: "01:00",
    scale: "5X2",
    employees: 45,
  },
  {
    id: 2,
    name: "Jornada padrao 6h",
    flexible: false,
    startTime: "08:00",
    endTime: "15:00",
    interval: "00:45",
    scale: "5X2",
    employees: 45,
  },
  {
    id: 3,
    name: "Jornada padrao noturna",
    flexible: false,
    startTime: "18:00",
    endTime: "06:00",
    interval: "01:30",
    scale: "12X36",
    employees: 45,
  },
  {
    id: 4,
    name: "Jornada meio periodo",
    flexible: true,
    startTime: "08:00",
    endTime: "12:00",
    interval: "",
    scale: "6X1",
    employees: 45,
  },
]

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: "Lucas Sigoli",
    cpf: "000.000.000-00",
    email: "lucas@teste.com",
    role: "Desenvolvedor",
    companyId: 1,
    journeyId: 1,
    managerAccess: true,
  },
  {
    id: 2,
    name: "Lucas Sigoli",
    cpf: "000.000.000-00",
    email: "lucas@teste.com",
    role: "Designer",
    companyId: 2,
    journeyId: 1,
    managerAccess: false,
  },
  {
    id: 3,
    name: "Lucas Sigoli",
    cpf: "000.000.000-00",
    email: "lucas@teste.com",
    role: "Aux. Administrativo",
    companyId: 3,
    journeyId: 3,
    managerAccess: false,
  },
  {
    id: 4,
    name: "Lucas Sigoli",
    cpf: "000.000.000-00",
    email: "lucas@teste.com",
    role: "Qa tester",
    companyId: 4,
    journeyId: 4,
    managerAccess: false,
  },
]

export const MANAGEMENT_ACTIONS: TableAction[] = [
  {
    id: "edit",
    label: "Editar",
    color: "text-content-secondary",
    icon: "edit",
  },
  {
    id: "remove",
    label: "Remover",
    color: "text-danger-700",
    icon: "trash",
  },
]

export const SCALE_OPTIONS = ["5X2", "6X1", "12X36"].map((scale) => ({
  value: scale,
  label: scale,
}))
