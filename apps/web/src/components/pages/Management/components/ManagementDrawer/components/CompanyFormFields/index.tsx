import { Input } from "@/components/structure/Input"
import { Toggle } from "@/components/structure/Toggle"

import type { CompanyFormData, ManagementFormValue } from "../../types"

export function CompanyFormFields({
  form,
  onChange,
}: {
  form: CompanyFormData
  onChange: (field: string, value: ManagementFormValue) => void
}) {
  return (
    <>
      <Input
        title="Nome"
        value={form.name}
        placeholder="Digite o nome"
        onChange={(value) => onChange("name", value)}
      />
      <Input
        title="CNPJ"
        value={form.cnpj}
        mask="cnpj"
        placeholder="00.000.000/0000-00"
        onChange={(value) => onChange("cnpj", value)}
      />
      <Toggle
        label="Empresa ativa?"
        active={form.isActive ?? true}
        onChange={(value) => onChange("isActive", value)}
      />
    </>
  )
}
