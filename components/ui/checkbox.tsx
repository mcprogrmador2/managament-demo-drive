"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
      onChange?.(event)
    }

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div
          data-slot="checkbox"
          className={cn(
            "peer border-input dark:bg-input/30 size-4 shrink-0 rounded-[4px] border shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center",
            isChecked && "bg-primary text-primary-foreground border-primary",
            "hover:border-primary/50",
            className
          )}
          onClick={() => {
            const newChecked = !isChecked
            setIsChecked(newChecked)
            onCheckedChange?.(newChecked)
          }}
        >
          {isChecked && (
            <CheckIcon className="size-3.5" />
          )}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
