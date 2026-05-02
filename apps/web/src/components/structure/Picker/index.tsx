// Components
import { DatePickerPanel } from "./components/DatePickerPanel"
import { DateTimePickerPanel } from "./components/DateTimePickerPanel"
import { IntervalPickerPanel } from "./components/IntervalPickerPanel"
import { PickerField } from "./components/PickerField"
import { PickerPanel } from "./components/PickerPanel"
import { TimePickerPanel } from "./components/TimePickerPanel"

// Hooks
import { usePicker } from "./hooks/usePicker"

// Utils
import {
  getPickerDisplayValue,
  getPickerIconName,
  getPickerPlaceholder,
} from "./utils"

// Types
import type { Props } from "./types"

export const Picker: React.FC<Props> = ({
  type,
  value,
  label,
  placeholder,
  className = "",
  fieldClassName = "",
  panelClassName = "",
  disabled = false,
  variant = "default",
  onChange,
}) => {
  // Hooks
  const {
    isOpen,
    panelRef,
    triggerRef,
    containerRef,
    panelPosition,
    closePicker,
    handleToggle,
  } = usePicker({ disabled, type })

  // Constants
  const displayValue = getPickerDisplayValue(type, value, variant)
  const iconName = getPickerIconName(type)
  const fieldPlaceholder = placeholder ?? getPickerPlaceholder(type, variant)

  // Functions

  function renderPanel() {
    if (type === "date") {
      return (
        <DatePickerPanel
          value={value}
          onChange={onChange}
          onClose={closePicker}
        />
      )
    }

    if (type === "time") {
      return (
        <TimePickerPanel
          value={value}
          onChange={onChange}
          onClose={closePicker}
        />
      )
    }

    if (type === "interval") {
      return (
        <IntervalPickerPanel
          value={value}
          onChange={onChange}
          onClose={closePicker}
        />
      )
    }

    return (
      <DateTimePickerPanel
        value={value}
        onChange={onChange}
        onClose={closePicker}
      />
    )
  }

  return (
    <div ref={containerRef} className={className}>
      <PickerField
        ref={triggerRef}
        disabled={disabled}
        iconName={iconName}
        isOpen={isOpen}
        label={label}
        placeholder={fieldPlaceholder}
        value={displayValue}
        variant={variant}
        className={fieldClassName}
        onClick={handleToggle}
      />

      {!isOpen || typeof document === "undefined" ? null : (
        <PickerPanel
          panelRef={panelRef}
          position={panelPosition}
          className={panelClassName}
        >
          {renderPanel()}
        </PickerPanel>
      )}
    </div>
  )
}
