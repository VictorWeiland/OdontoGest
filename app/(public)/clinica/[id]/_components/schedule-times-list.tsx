"use client"

import { Button } from "@/components/ui/button"
import { TimeSlot } from "./schedule-content"
import { cn } from "@/lib/utils"
import { isSlotInThePast, isSlotSequenceAvailable } from "./schedule-utils"

interface ScheduleTimeListProps {
  selectedDate: Date
  selectedTime: string
  requiredSlots: number
  blockedTimes: string[]
  availableTimeSlots: TimeSlot[]
  clinicTimes: string[]
  onSelectTime: (time: string) => void
}

export function ScheduleTimeList({
  selectedDate,
  selectedTime,
  requiredSlots,
  blockedTimes,
  availableTimeSlots,
  clinicTimes,
  onSelectTime,
}: ScheduleTimeListProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {availableTimeSlots.map((slot) => {
        const sequenceOk = isSlotSequenceAvailable(
          slot.time,
          requiredSlots,
          clinicTimes,
          blockedTimes
        )

        const slotIsPast = isSlotInThePast(slot.time, selectedDate)
        const slotEnabled = slot.available && sequenceOk && !slotIsPast
        const isSelected = selectedTime === slot.time

        return (
          <Button
            key={slot.time}
            type="button"
            variant="outline"
            disabled={!slotEnabled}
            onClick={() => slotEnabled && onSelectTime(slot.time)}
            className={cn(
              "h-11 rounded-xl font-mono text-xs font-bold transition-all duration-150 select-none",
              isSelected
                ? "border-emerald-500 bg-emerald-500 text-white shadow-xs shadow-emerald-500/30 scale-102 hover:bg-emerald-600"
                : slotEnabled
                ? "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50"
                : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50 line-through"
            )}
            aria-pressed={isSelected}
            aria-label={`Horário ${slot.time}${!slotEnabled ? " indisponível" : ""}`}
          >
            {slot.time}
          </Button>
        )
      })}
    </div>
  )
}
