import { Button } from "@/components/structure/Button"
import { Input } from "@/components/structure/Input"
import { Picker } from "@/components/structure/Picker"
import { Toggle } from "@/components/structure/Toggle"
import { Typography } from "@/components/structure/Typography"

import { SCALE_OPTIONS } from "../../../../constants"
import type { Company } from "../../../../types"
import {
  clockToMinutes,
  makeCompanyOptions,
  minutesToClock,
  normalizeScaleCode,
} from "../../../../utils"
import type { JourneyFormData, ManagementFormValue } from "../../types"
import { DrawerFormSelect } from "../DrawerFormSelect"

export function JourneyFormFields({
  form,
  companies,
  onChange,
}: {
  form: JourneyFormData
  companies: Company[]
  onChange: (field: string, value: ManagementFormValue) => void
}) {
  return (
    <>
      <Toggle
        label="HorÃ¡rio flexÃ­vel?"
        active={form.flexible}
        onChange={(value) => onChange("flexible", value)}
      />
      <Input
        title="Nome"
        value={form.name}
        placeholder="Informe o nome"
        onChange={(value) => onChange("name", value)}
      />
      <DrawerFormSelect
        label="Selecione uma empresa"
        options={makeCompanyOptions(companies)}
        value={String(form.companyId ?? "")}
        onChange={(value) => onChange("companyId", Number(value))}
      />
      {form.flexible ? (
        <Picker
          type="time"
          label="Informe a quantidade de horas a serem trabalhadas"
          value={minutesToClock(form.dailyWorkMinutes ?? 0)}
          onChange={(value) =>
            onChange("dailyWorkMinutes", clockToMinutes(value))
          }
        />
      ) : (
        <>
          <Picker
            type="time"
            label="Informe a hora de entrada"
            value={form.startTime}
            onChange={(value) => onChange("startTime", value)}
          />
          <Picker
            type="time"
            label="Informe a hora de saÃ­da"
            value={form.endTime}
            onChange={(value) => onChange("endTime", value)}
          />
          <Picker
            type="interval"
            label="Informe o tempo de intervalo"
            value={form.interval}
            onChange={(value) => onChange("interval", value)}
          />
        </>
      )}
      <Input
        title="Escala"
        value={form.scale}
        placeholder="Ex.: 5X2, 4X2 ou 12X36"
        onChange={(value) => onChange("scale", normalizeScaleCode(value))}
      />
      <div className="grid gap-2">
        <Typography
          variant="b2"
          value="Atalhos de escala"
          className="font-semibold"
        />
        <div className="flex flex-wrap gap-2">
          {SCALE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              value={option.label}
              color="primary"
              variant={form.scale === option.value ? "filled" : "outlined"}
              className="h-9 px-3"
              onClick={() =>
                onChange("scale", normalizeScaleCode(option.value))
              }
            />
          ))}
        </div>
      </div>
      <Toggle
        label="Jornada ativa?"
        active={form.isActive ?? true}
        onChange={(value) => onChange("isActive", value)}
      />
    </>
  )
}
