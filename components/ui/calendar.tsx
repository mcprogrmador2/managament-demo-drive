"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Calendar, { TileArgs } from "react-calendar"
import "react-calendar/dist/Calendar.css"

import { cn } from "@/lib/utils"

export interface CalendarProps {
  value?: Date | null
  onChange?: (value: Date | null) => void
  disabled?: (date: Date) => boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

function CustomCalendar({
  value,
  onChange,
  disabled,
  className,
  minDate,
  maxDate,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("w-full", className)}>
      <Calendar
        value={value}
        onChange={(val) => {
          if (onChange) {
            onChange(val as Date | null)
          }
        }}
        minDate={minDate}
        maxDate={maxDate}
        tileDisabled={(args: TileArgs) => {
          if (disabled) {
            return disabled(args.date)
          }
          return false
        }}
        className="!border-0 !bg-transparent"
        calendarType="gregory"
        formatShortWeekday={(locale, date) => {
          const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
          return weekdays[date.getDay()]
        }}
        formatMonthYear={(locale, date) => {
          const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ]
          return `${months[date.getMonth()]} ${date.getFullYear()}`
        }}
        nextLabel={<ChevronRight className="h-5 w-5" />}
        prevLabel={<ChevronLeft className="h-5 w-5" />}
        next2Label={null}
        prev2Label={null}
        showNeighboringMonth={false}
        {...props}
      />
      
      <style jsx global>{`
        .react-calendar {
          width: 100% !important;
          background: var(--card) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-md) !important;
          font-family: var(--font-sans) !important;
        }
        
        .react-calendar__navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 1rem;
        }
        
        .react-calendar__navigation button {
          background: var(--secondary) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-md) !important;
          padding: 0.5rem !important;
          color: var(--foreground) !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          min-width: 2.5rem !important;
          height: 2.5rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .react-calendar__navigation button:hover {
          background: var(--muted) !important;
        }
        
        .react-calendar__navigation button:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
        
        .react-calendar__navigation__label {
          background: transparent !important;
          border: none !important;
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: var(--foreground) !important;
          padding: 0.5rem 1rem !important;
        }
        
        .react-calendar__month-view__weekdays {
          margin-bottom: 0.5rem;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.75rem 0;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--muted-foreground);
          text-transform: uppercase;
        }
        
        .react-calendar__month-view__days {
          gap: 0.25rem;
        }
        
        .react-calendar__tile {
          background: var(--secondary) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-md) !important;
          padding: 0.75rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: var(--foreground) !important;
          min-height: 2.5rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .react-calendar__tile:hover {
          background: var(--muted) !important;
        }
        
        .react-calendar__tile--active {
          background: var(--primary) !important;
          color: var(--primary-foreground) !important;
          border-color: var(--primary) !important;
        }
        
        .react-calendar__tile--now {
          background: var(--accent) !important;
          color: var(--accent-foreground) !important;
          border-color: var(--accent-foreground) !important;
          font-weight: 600 !important;
        }
        
        .react-calendar__tile--disabled {
          color: var(--muted-foreground) !important;
          cursor: not-allowed !important;
          opacity: 0.3 !important;
          background: var(--muted) !important;
        }
        
        .react-calendar__tile--disabled:hover {
          background: var(--muted) !important;
        }
        
        .react-calendar__tile--neighboringMonth {
          color: var(--muted-foreground) !important;
          opacity: 0.4 !important;
        }
        
        .react-calendar__tile--neighboringMonth:hover {
          background: var(--secondary) !important;
        }
      `}</style>
    </div>
  )
}

export { CustomCalendar as Calendar }
