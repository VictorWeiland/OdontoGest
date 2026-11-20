"use client"

import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { isSlotInThePast, isSlotSequenceAvailable } from "@/lib/schedule-utils"

interface QuickTimeSlotPickerProps {
  clinicTimes: string[]
  blockedTimes: string[]
  requiredSlots: number
  selectedDateIso: string
  selectedTime: string
  loading: boolean
  onSelectTime: (time: string) => void
  errorMessage?: string
}

export function QuickTimeSlotPicker({
  clinicTimes,
  blockedTimes,
  requiredSlots,
  selectedDateIso,
  selectedTime,
  loading,
  onSelectTime,
  errorMessage,
}: QuickTimeSlotPickerProps) {
  const freeSlots = clinicTimes.filter((slot) => {
    const sequenceOk = isSlotSequenceAvailable(
      slot,
      requiredSlots,
      clinicTimes,
      blockedTimes
    )
    const isPast = isSlotInThePast(slot, selectedDateIso)
    return sequenceOk && !isPast
  })

  return (
    <div className="space-y-2">
      {loading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Skeleton key={item} className="h-9 rounded-xl" />
          ))}
        </div>
      ) : freeSlots.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3.5 py-4 text-xs font-medium text-slate-600">
          <Clock className="size-4 shrink-0 text-slate-400" aria-hidden />
          <span>Sem horários livres nesta data. Escolha outra data.</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {freeSlots.map((slot) => {
            const isSelected = selectedTime === slot
            return (
              <Button
                key={slot}
                type="button"
                variant="outline"
                onClick={() => onSelectTime(slot)}
                aria-pressed={isSelected}
                aria-label={`Selecionar horário ${slot}`}
                className={cn(
                  "h-9 rounded-xl font-mono text-xs font-bold transition-all duration-150",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-xs shadow-emerald-500/25 hover:bg-emerald-600 hover:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-900"
                )}
              >
                {slot}
              </Button>
            )
          })}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs font-medium text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
