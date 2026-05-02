// External Libraries
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Input } from "@/components/structure/Input"
import { Picker } from "@/components/structure/Picker"
import { Select } from "@/components/structure/Select"
import { SidePanel } from "@/components/structure/SidePanel"
import { Toggle } from "@/components/structure/Toggle"
import { Typography } from "@/components/structure/Typography"

// Constants
import { SCALE_OPTIONS } from "../../constants"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { Company, Employee, Journey } from "../../types"
import type {
  CompanyFormData,
  EmployeeFormData,
  FormData,
  JourneyFormData,
  ManagementDrawerMethods,
  Props,
} from "./types"

// Utils
import { useManagementContext } from "../../contexts/ManagementContext"
import {
  getEntityLabel,
  makeCompanyForm,
  makeCompanyOptions,
  makeEmployeeForm,
  makeJourneyForm,
  makeJourneyOptions,
} from "../../utils"

export const ManagementDrawer = forwardRef<ManagementDrawerMethods, Props>(
  ({ element, view, onSuccess }, ref) => {
    // Refs
    const sidePanelRef = useRef<SidePanelMethods>(null)

    // Contexts
    const { companies, journeys, saveEntity } = useManagementContext()

    // States
    const [form, setForm] = useState<FormData>(() =>
      makeDrawerForm(view, element, companies, journeys)
    )

    // Constants
    const drawerTitle = `Cadastro de ${getEntityLabel(view.id)}`
    const mode = element ? "edit" : "create"
    const description =
      mode === "create"
        ? `Adicione um novo ${getEntityLabel(view.id)}`
        : `Edite os dados de ${getEntityLabel(view.id)}`

    const getInitialForm = useCallback(() => {
      return makeDrawerForm(view, element, companies, journeys)
    }, [companies, element, journeys, view])

    const handleClose = useCallback(() => {
      sidePanelRef.current?.close()
    }, [])

    const handleOpen = useCallback(() => {
      setForm(getInitialForm())
      sidePanelRef.current?.open()
    }, [getInitialForm])

    const handleToggle = useCallback(() => {
      setForm(getInitialForm())
      sidePanelRef.current?.toggle()
    }, [getInitialForm])

    useImperativeHandle(
      ref,
      () => ({
        close: handleClose,
        open: handleOpen,
        toggle: handleToggle,
      }),
      [handleClose, handleOpen, handleToggle]
    )

    function handleCancel() {
      handleClose()
    }

    function handleChange(field: string, value: string | number | boolean) {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }))
    }

    async function handleSave() {
      try {
        await saveEntity(view.id, element, form)

        handleClose()

        if (view.id === "employees" && !element) onSuccess()
      } catch (error) {
        console.log(error)
      }
    }

    function renderForm() {
      if (view.id === "companies") {
        const companyForm = form as CompanyFormData

        return (
          <>
            <Input
              title="Nome"
              value={companyForm.name}
              placeholder="Digite o nome"
              onChange={(value) => handleChange("name", value)}
            />

            <Input
              title="CNPJ"
              value={companyForm.cnpj}
              mask="cnpj"
              placeholder="00.000.000/0000-00"
              onChange={(value) => handleChange("cnpj", value)}
            />
          </>
        )
      }

      if (view.id === "employees") {
        const employeeForm = form as EmployeeFormData
        const companyOptions = makeCompanyOptions(companies)
        const journeyOptions = makeJourneyOptions(journeys)

        return (
          <>
            <Input
              title="Nome"
              value={employeeForm.name}
              placeholder="Informe o nome"
              onChange={(value) => handleChange("name", value)}
            />

            <Input
              title="CPF"
              value={employeeForm.cpf}
              mask="cpf"
              placeholder="000.000.000-00"
              onChange={(value) => handleChange("cpf", value)}
            />

            <Input
              title="E-mail"
              value={employeeForm.email}
              mask="email"
              placeholder="Informe o e-mail"
              onChange={(value) => handleChange("email", value)}
            />

            <Input
              title="Cargo"
              value={employeeForm.role}
              placeholder="Informe o cargo"
              onChange={(value) => handleChange("role", value)}
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {renderSelect({
                label: "Selecione uma empresa",
                options: companyOptions,
                value: String(employeeForm.companyId),
                onChange: (value) => handleChange("companyId", Number(value)),
              })}

              {renderSelect({
                label: "Selecione uma jornada",
                options: journeyOptions,
                value: String(employeeForm.journeyId),
                onChange: (value) => handleChange("journeyId", Number(value)),
              })}
            </div>

            <Toggle
              label="Acesso ao painel gerencial?"
              active={employeeForm.managerAccess}
              onChange={(value) => handleChange("managerAccess", value)}
            />
          </>
        )
      }

      const journeyForm = form as JourneyFormData
      const companyOptions = makeCompanyOptions(companies)

      return (
        <>
          <Toggle
            label="Horario flexivel?"
            active={journeyForm.flexible}
            onChange={(value) => handleChange("flexible", value)}
          />

          <Input
            title="Nome"
            value={journeyForm.name}
            placeholder="Informe o nome"
            onChange={(value) => handleChange("name", value)}
          />

          {renderSelect({
            label: "Selecione uma empresa",
            options: companyOptions,
            value: String(journeyForm.companyId ?? ""),
            onChange: (value) => handleChange("companyId", Number(value)),
          })}

          <Picker
            type="time"
            label="Informe a hora de entrada"
            value={journeyForm.startTime}
            onChange={(value) => handleChange("startTime", value)}
          />

          <Picker
            type="time"
            label="Informe a hora de saida"
            value={journeyForm.endTime}
            onChange={(value) => handleChange("endTime", value)}
          />

          <Picker
            type="interval"
            label="Informe o tempo de intervalo"
            value={journeyForm.interval}
            onChange={(value) => handleChange("interval", value)}
          />

          {renderSelect({
            label: "Selecione uma Escala",
            options: SCALE_OPTIONS,
            value: journeyForm.scale,
            onChange: (value) => handleChange("scale", value),
          })}
        </>
      )
    }

    function renderSelect({
      label,
      options,
      value,
      onChange: handleSelectChange,
    }: {
      label: string
      options: SelectionOption[]
      value: string
      onChange: (value: string) => void
    }) {
      return (
        <div className="grid gap-1">
          <Typography variant="b2" value={label} />
          <Select
            options={options}
            selectedItem={options.filter((option) => option.value === value)}
            buttonClassName="border-border-default"
            onSelectionChange={(selection) => {
              const selectedValue = selection[0]?.value
              if (selectedValue) handleSelectChange(selectedValue)
            }}
          />
        </div>
      )
    }

    return (
      <SidePanel
        ref={sidePanelRef}
        title={drawerTitle}
        subtitle={description}
        widthClassName="max-w-[504px]"
        className="bg-surface-page"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-7 sm:px-5">
            <form
              className="grid gap-3"
              onSubmit={(event) => event.preventDefault()}
            >
              {renderForm()}
            </form>
          </div>

          <footer className="grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-page px-4 py-5 sm:px-5">
            <Button
              fitWidth
              value="Cancelar"
              color="primary"
              variant="outlined"
              onClick={handleCancel}
            />

            <Button fitWidth value="Salvar" onClick={() => void handleSave()} />
          </footer>
        </div>
      </SidePanel>
    )
  }
)

ManagementDrawer.displayName = "ManagementDrawer"

function makeDrawerForm(
  view: Props["view"],
  element: Props["element"],
  companies: Company[],
  journeys: Journey[]
) {
  if (view.id === "companies") return makeCompanyForm(element as Company)
  if (view.id === "employees") {
    return makeEmployeeForm(companies, journeys, element as Employee)
  }

  return makeJourneyForm(element as Journey)
}
