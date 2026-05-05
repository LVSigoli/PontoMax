// External Libraries
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Input } from "@/components/structure/Input"
import { Picker } from "@/components/structure/Picker"
import { Select } from "@/components/structure/Select"
import { SidePanel } from "@/components/structure/SidePanel"
import { Typography } from "@/components/structure/Typography"

// Constants
import { HOLIDAY_TYPE_OPTIONS } from "../../constants"

// Contexts
import { useAuth } from "@/contexts/AuthContext"
import { useHolidaysContext } from "../../contexts/HolidaysContext"

// Hooks
import { useCompaniesSWR } from "@/hooks/swr"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { HolidayForm, HolidayType } from "../../types"
import type { HolidayDrawerMethods, Props } from "./types"

// Utils
import { makeHolidayForm } from "../../utils"

export const HolidayDrawer = forwardRef<HolidayDrawerMethods, Props>(
  ({ element }, ref) => {
    // Refs
    const sidePanelRef = useRef<SidePanelMethods>(null)

    // Contexts
    const { user } = useAuth()
    const { saveHoliday } = useHolidaysContext()

    // Hooks
    const { data: companyItems = [] } = useCompaniesSWR()

    // States
    const [form, setForm] = useState<HolidayForm>(() =>
      getDefaultForm(element, user?.role)
    )

    // Constants
    const mode = element ? "edit" : "create"
    const description =
      mode === "create" ? "Adicione um novo feriado" : "Edite o feriado"
    const typeOptions = useMemo(
      () =>
        user?.role === "PLATFORM_ADMIN"
          ? HOLIDAY_TYPE_OPTIONS
          : HOLIDAY_TYPE_OPTIONS.filter((option) => option.value !== "Nacional"),
      [user?.role]
    )
    const companyOptions = useMemo<SelectionOption[]>(
      () =>
        companyItems.map((company) => ({
          value: String(company.id),
          label: company.tradeName ?? company.name,
        })),
      [companyItems]
    )
    const selectedCompanyOptions = useMemo(
      () =>
        companyOptions.filter((option) => form.companyIds.includes(Number(option.value))),
      [companyOptions, form.companyIds]
    )
    const shouldShowCompanySelect = form.type !== "Nacional"

    const getInitialForm = useCallback(() => {
      return getDefaultForm(element, user?.role)
    }, [element, user?.role])

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

    function handleChange<Key extends keyof HolidayForm>(
      field: Key,
      value: HolidayForm[Key]
    ) {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }))
    }

    function handleTypeChange(value: HolidayType) {
      setForm((currentForm) => ({
        ...currentForm,
        type: value,
        companyIds: value === "Nacional" ? [] : currentForm.companyIds,
      }))
    }

    async function handleSave() {
      try {
        await saveHoliday(element, form)
        handleClose()
      } catch {}
    }

    function renderSingleSelect({
      label,
      options,
      value,
      onChange,
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
            label={label}
            options={options}
            selectedItem={options.filter((option) => option.value === value)}
            buttonClassName="border-border-default"
            onSelectionChange={(selection) => {
              const selectedValue = selection[0]?.value
              if (selectedValue) onChange(selectedValue)
            }}
          />
        </div>
      )
    }

    return (
      <SidePanel
        ref={sidePanelRef}
        title="Cadastro de feriado"
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
              <Input
                title="Nome"
                value={form.name}
                placeholder="Informe o nome"
                onChange={(value) => handleChange("name", value)}
              />

              <Picker
                type="date"
                label="Informe a data do feriado"
                value={form.date}
                onChange={(value) => handleChange("date", value)}
              />

              {renderSingleSelect({
                label: "Selecione um tipo",
                options: typeOptions,
                value: form.type,
                onChange: (value) => handleTypeChange(value as HolidayType),
              })}

              {shouldShowCompanySelect ? (
                <div className="grid gap-1">
                  <Typography variant="b2" value="Selecione as empresas" />
                  <Select
                    multi
                    label="Selecione as empresas"
                    options={companyOptions}
                    selectedItem={selectedCompanyOptions}
                    buttonClassName="border-border-default"
                    onSelectionChange={(selection) => {
                      handleChange(
                        "companyIds",
                        selection.map((option) => Number(option.value))
                      )
                    }}
                  />
                </div>
              ) : null}
            </form>
          </div>

          <footer className="grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-page px-4 py-5 sm:px-5">
            <Button
              fitWidth
              value="Cancelar"
              color="primary"
              variant="outlined"
              onClick={handleClose}
            />

            <Button fitWidth value="Salvar" onClick={handleSave} />
          </footer>
        </div>
      </SidePanel>
    )
  }
)

HolidayDrawer.displayName = "HolidayDrawer"

function getDefaultForm(
  element: Props["element"],
  role?: string
) {
  const form = makeHolidayForm(element)

  if (role !== "PLATFORM_ADMIN" && form.type === "Nacional") {
    return {
      ...form,
      type: "Municipal" as const,
    }
  }

  return form
}
