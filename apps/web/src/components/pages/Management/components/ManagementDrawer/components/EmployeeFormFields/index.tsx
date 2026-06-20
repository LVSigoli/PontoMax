import { Input } from "@/components/structure/Input"
import { Toggle } from "@/components/structure/Toggle"

import type { Company, Journey } from "../../../../types"
import { makeCompanyOptions, makeJourneyOptions } from "../../../../utils"
import type { EmployeeFormData, ManagementFormValue } from "../../types"
import { DrawerFormSelect } from "../DrawerFormSelect"

export function EmployeeFormFields({
  form,
  companies,
  journeys,
  onChange,
  onCompanyChange,
}: {
  form: EmployeeFormData
  companies: Company[]
  journeys: Journey[]
  onChange: (field: string, value: ManagementFormValue) => void
  onCompanyChange: (companyId: number, journeyId: number) => void
}) {
  const companyOptions = makeCompanyOptions(companies)
  const companyJourneys = journeys.filter(
    (journey) => journey.companyId === form.companyId
  )

  return (
    <>
      <Input
        title="Nome"
        value={form.name}
        placeholder="Informe o nome"
        onChange={(value) => onChange("name", value)}
      />
      <Input
        title="CPF"
        value={form.cpf}
        mask="cpf"
        placeholder="000.000.000-00"
        onChange={(value) => onChange("cpf", value)}
      />
      <Input
        title="E-mail"
        value={form.email}
        mask="email"
        placeholder="Informe o e-mail"
        onChange={(value) => onChange("email", value)}
      />
      <Input
        title="Cargo"
        value={form.role}
        placeholder="Informe o cargo"
        onChange={(value) => onChange("role", value)}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <DrawerFormSelect
          label="Selecione uma empresa"
          options={companyOptions}
          value={String(form.companyId)}
          onChange={(value) => {
            const companyId = Number(value)
            const journeyId =
              journeys.find((journey) => journey.companyId === companyId)?.id ??
              0
            onCompanyChange(companyId, journeyId)
          }}
        />
        <DrawerFormSelect
          label="Selecione uma jornada"
          options={makeJourneyOptions(companyJourneys)}
          value={String(form.journeyId)}
          onChange={(value) => onChange("journeyId", Number(value))}
        />
      </div>
      <Toggle
        label="Acesso ao painel gerencial?"
        active={form.managerAccess}
        onChange={(value) => onChange("managerAccess", value)}
      />
      <Toggle
        label="FuncionÃ¡rio ativo?"
        active={form.isActive}
        onChange={(value) => onChange("isActive", value)}
      />
    </>
  )
}
