"use client"

import { useState } from "react"
import DatePicker, { registerLocale } from "react-datepicker"
import { ptBR } from "date-fns/locale/pt-BR"
import { getSaoPauloToday } from "./schedule-utils"

registerLocale("pt-BR", ptBR)

interface DateTimePickerProps {
  minDate?: Date
  className?: string
  initialDate?: Date
  onChange: (date: Date) => void
}

export function DateTimePicker({
  initialDate,
  className,
  minDate,
  onChange,
}: DateTimePickerProps) {
  const [startDate, setStartDate] = useState(initialDate || getSaoPauloToday())

  function handleChange(date: Date | null) {
    if (date) {
      setStartDate(date)
      onChange(date)
    }
  }

  return (
    <div className="w-full">
      <DatePicker
        className={className}
        selected={startDate}
        locale="pt-BR"
        minDate={minDate ?? getSaoPauloToday()}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
      />
    </div>
  )
}
