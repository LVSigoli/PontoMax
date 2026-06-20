import { Select } from "@/components/structure/Select"
import type { SelectionOption } from "@/components/structure/Select/types"
import { Typography } from "@/components/structure/Typography"

export function DrawerFormSelect({
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
