"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  children?: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  name?: string
  required?: boolean
  /** Controlled open state (optional) */
  open?: boolean
  /** Called when open state changes (optional) */
  onOpenChange?: (open: boolean) => void
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
  selectedValue?: string
  children?: React.ReactNode
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children?: React.ReactNode
}

// Context para pasar datos entre componentes
const SelectContext = React.createContext<{
  selectedValue: string
  selectedLabel: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  handleSelect: (value: string, label: string) => void
}>({
  selectedValue: "",
  selectedLabel: "",
  isOpen: false,
  setIsOpen: () => {},
  handleSelect: () => {}
})

function Select({ children, value, onValueChange, name, required, open, onOpenChange }: SelectProps) {
  const isControlled = typeof open === 'boolean'
  const [internalOpen, setInternalOpen] = React.useState<boolean>(open ?? false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const [selectedLabel, setSelectedLabel] = React.useState("")

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  // Keep internalOpen in sync when controlled
  React.useEffect(() => {
    if (isControlled) setInternalOpen(open as boolean)
  }, [open, isControlled])

  const setIsOpen = (val: boolean) => {
    if (!isControlled) setInternalOpen(val)
    onOpenChange?.(val)
  }

  const handleSelect = (newValue: string, label: string) => {
    setSelectedValue(newValue)
    setSelectedLabel(label)
    setIsOpen(false)
    onValueChange?.(newValue)
  }

  return (
    <SelectContext.Provider value={{ selectedValue, selectedLabel, isOpen: internalOpen, setIsOpen, handleSelect }}>
      <div className="relative">
        {name && <input type="hidden" name={name} value={selectedValue} required={required} />}
        {children}
      </div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)
  
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

function SelectValue({ placeholder, selectedValue: propSelectedValue, children }: SelectValueProps) {
  const { selectedValue: contextValue, selectedLabel } = React.useContext(SelectContext)
  
  // Prioridad: propSelectedValue > contextValue
  const displayValue = propSelectedValue ?? contextValue
  
  // Si hay un valor seleccionado y no es vacío, mostrar el label
  if (displayValue && displayValue !== '') {
    // Si hay children explícitos, usarlos (por compatibilidad)
    if (children) {
      return <span className="text-foreground">{children}</span>
    }
    // Si no, usar el selectedLabel del contexto
    return <span className="text-foreground">{selectedLabel}</span>
  }
  // Si no hay valor seleccionado, mostrar el placeholder
  return <span className="text-muted-foreground">{placeholder}</span>
}

function SelectContent({ children, className }: SelectContentProps) {
  const { isOpen, handleSelect } = React.useContext(SelectContext)
  
  if (!isOpen) return null
  
  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md top-full left-0 right-0 mt-1",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onSelect: handleSelect
          } as Record<string, unknown>)
        }
        return child
      })}
    </div>
  )
}

function SelectItem({ value, children, className, onSelect }: SelectItemProps & { onSelect?: (value: string, label: string) => void }) {
  const { handleSelect: contextHandleSelect } = React.useContext(SelectContext)
  const handler = onSelect || contextHandleSelect
  
  const handleClick = () => {
    const label = typeof children === 'string' ? children : React.Children.toArray(children).join('')
    handler(value, label)
  }
  
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}