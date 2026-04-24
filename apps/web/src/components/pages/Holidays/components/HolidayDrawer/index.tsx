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
import { Typography } from "@/components/structure/Typography"

// Constants
import { HOLIDAY_TYPE_OPTIONS } from "../../constants"

// Contexts
import { useHolidaysContext } from "../../contexts/HolidaysContext"

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
    const { saveHoliday } = useHolidaysContext()

    // States
    const [form, setForm] = useState<HolidayForm>(() =>
      makeHolidayForm(element)
    )

    // Constants
    const mode = element ? "edit" : "create"
    const description =
      mode === "create" ? "Adicione um novo feriado" : "Edite o feriado"

    const getInitialForm = useCallback(() => {
      return makeHolidayForm(element)
    }, [element])

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

    function handleChange(field: keyof HolidayForm, value: string) {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }))
    }

    function handleSave() {
      saveHoliday(element, form)
      handleClose()
    }

    function renderSelect({
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
        widthClassName="max-w-[504px]"
        className="bg-surface-page"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-7 sm:px-5">
            <Typography variant="h4" value="Cadastro de feriado" />

            <Typography
              variant="h4"
              value={description}
              className="mt-12 text-xl font-medium"
            />

            <form
              className="mt-4 grid gap-3"
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

              {renderSelect({
                label: "Selecione um tipo",
                options: HOLIDAY_TYPE_OPTIONS,
                value: form.type,
                onChange: (value) => handleChange("type", value as HolidayType),
              })}
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
