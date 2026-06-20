import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import { Button } from "@/components/structure/Button"
import { SidePanel } from "@/components/structure/SidePanel"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"

import { useManagementContext } from "../../contexts/ManagementContext"
import type { Company, Employee, Journey } from "../../types"
import {
  getEntityLabel,
  makeCompanyForm,
  makeEmployeeForm,
  makeJourneyForm,
} from "../../utils"
import { CompanyFormFields } from "./components/CompanyFormFields"
import { EmployeeFormFields } from "./components/EmployeeFormFields"
import { JourneyFormFields } from "./components/JourneyFormFields"
import { ManagementFormSkeleton } from "./components/ManagementFormSkeleton"
import type {
  CompanyFormData,
  EmployeeFormData,
  FormData,
  JourneyFormData,
  ManagementDrawerMethods,
  ManagementFormValue,
  Props,
} from "./types"

export const ManagementDrawer = forwardRef<ManagementDrawerMethods, Props>(
  function ManagementDrawer({ element, view }, ref) {
    const sidePanelRef = useRef<SidePanelMethods>(null)
    const { companies, journeys, isLoading, saveEntity } =
      useManagementContext()
    const [form, setForm] = useState<FormData>(() =>
      makeDrawerForm(view, element, companies, journeys)
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const mode = element ? "edit" : "create"
    const entityLabel = getEntityLabel(view.id)

    const getInitialForm = useCallback(
      () => makeDrawerForm(view, element, companies, journeys),
      [companies, element, journeys, view]
    )
    const close = useCallback(() => sidePanelRef.current?.close(), [])
    const open = useCallback(() => {
      setForm(getInitialForm())
      sidePanelRef.current?.open()
    }, [getInitialForm])
    const toggle = useCallback(() => {
      setForm(getInitialForm())
      sidePanelRef.current?.toggle()
    }, [getInitialForm])

    useImperativeHandle(ref, () => ({ close, open, toggle }), [
      close,
      open,
      toggle,
    ])

    function handleChange(field: string, value: ManagementFormValue) {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }))
    }

    async function handleSave() {
      if (isSubmitting) return

      try {
        setIsSubmitting(true)
        await saveEntity(view.id, element, form)
        close()
      } finally {
        setIsSubmitting(false)
      }
    }

    function renderForm() {
      if (isLoading) return <ManagementFormSkeleton />

      if (view.id === "companies") {
        return (
          <CompanyFormFields
            form={form as CompanyFormData}
            onChange={handleChange}
          />
        )
      }

      if (view.id === "employees") {
        return (
          <EmployeeFormFields
            form={form as EmployeeFormData}
            companies={companies}
            journeys={journeys}
            onChange={handleChange}
            onCompanyChange={(companyId, journeyId) =>
              setForm((currentForm) => ({
                ...currentForm,
                companyId,
                journeyId,
              }))
            }
          />
        )
      }

      return (
        <JourneyFormFields
          form={form as JourneyFormData}
          companies={companies}
          onChange={handleChange}
        />
      )
    }

    return (
      <SidePanel
        ref={sidePanelRef}
        title={`Cadastro de ${entityLabel}`}
        subtitle={
          mode === "create"
            ? `Adicione um novo ${entityLabel}`
            : `Edite os dados de ${entityLabel}`
        }
        widthClassName="max-w-[504px]"
        className="bg-surface-page"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
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
              disabled={isSubmitting}
              onClick={close}
            />
            <Button
              fitWidth
              value="Salvar"
              loading={isSubmitting}
              onClick={() => void handleSave()}
            />
          </footer>
        </div>
      </SidePanel>
    )
  }
)

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
