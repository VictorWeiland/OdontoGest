"use client"

import { useMemo, useState } from "react"
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form"
import { Mail, Phone, Search, User, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { extractPhoneNumber, formatPhone } from "@/utils/formatPhone"
import type {
  QuickAppointmentFormData,
  QuickAppointmentPatient,
} from "../../_schemas/quick-appointment"

interface PatientSearchFieldProps {
  patients: QuickAppointmentPatient[]
  register: UseFormRegister<QuickAppointmentFormData>
  control: Control<QuickAppointmentFormData>
  setValue: UseFormSetValue<QuickAppointmentFormData>
  errors: FieldErrors<QuickAppointmentFormData>
  disabled?: boolean
  firstInputRef?: React.RefObject<HTMLInputElement | null>
}

export function PatientSearchField({
  patients,
  register,
  control,
  setValue,
  errors,
  disabled,
  firstInputRef,
}: PatientSearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const phoneValue = useWatch({ control, name: "phone" })
  const { ref: nameRegisterRef, ...nameRegisterProps } = register("name")

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const queryDigits = extractPhoneNumber(searchQuery)

    if (!query) {
      return patients.slice(0, 5)
    }

    return patients
      .filter((patient) => {
        const nameMatch = patient.name.toLowerCase().includes(query)
        const phoneDigits = extractPhoneNumber(patient.phone)
        const phoneMatch =
          (queryDigits.length > 0 && phoneDigits.includes(queryDigits)) ||
          patient.phone.toLowerCase().includes(query)
        return nameMatch || phoneMatch
      })
      .slice(0, 6)
  }, [patients, searchQuery])

  function handleSelectPatient(patient: QuickAppointmentPatient) {
    setValue("name", patient.name, { shouldValidate: true })
    setValue("phone", formatPhone(patient.phone), { shouldValidate: true })
    setValue("email", patient.email || "", { shouldValidate: true })
    setSearchQuery(patient.name)
    setDropdownOpen(false)
  }

  function handleClearSearch() {
    setSearchQuery("")
    setValue("name", "", { shouldValidate: false })
    setValue("phone", "", { shouldValidate: false })
    setValue("email", "", { shouldValidate: false })
    firstInputRef?.current?.focus()
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
          1. Paciente
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <X className="size-3" aria-hidden />
            Novo paciente
          </button>
        )}
      </div>

      {/* Campo de busca de pacientes anteriores */}
      {patients.length > 0 && (
        <div className="relative">
          <Label
            htmlFor="quick-patient-search"
            className="mb-1.5 text-xs font-semibold text-slate-700"
          >
            Buscar paciente anterior (opcional)
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              ref={firstInputRef}
              id="quick-patient-search"
              type="text"
              value={searchQuery}
              disabled={disabled}
              placeholder="Buscar por nome ou telefone..."
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                // Pequeno atraso para permitir clique na sugestão
                setTimeout(() => setDropdownOpen(false), 150)
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setDropdownOpen(true)
              }}
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 pr-8 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Limpar busca de paciente"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>

          {dropdownOpen && filteredPatients.length > 0 && (
            <div
              role="listbox"
              aria-label="Sugestões de pacientes anteriores"
              className="absolute z-20 mt-1.5 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
            >
              {filteredPatients.map((patient, idx) => (
                <button
                  key={`${patient.name}-${patient.phone}-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectPatient(patient)}
                  className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-emerald-50 focus-visible:bg-emerald-50 focus-visible:outline-none"
                >
                  <span className="truncate text-xs font-bold text-emerald-950">
                    {patient.name}
                  </span>
                  <span className="truncate text-[11px] text-slate-500">
                    {patient.phone}
                    {patient.email ? ` • ${patient.email}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nome completo */}
      <div className="space-y-1.5">
        <Label htmlFor="quick-patient-name" className="text-xs font-semibold text-slate-700">
          Nome do paciente *
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            id="quick-patient-name"
            type="text"
            placeholder="Nome completo"
            disabled={disabled}
            aria-invalid={Boolean(errors.name)}
            className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25"
            {...nameRegisterProps}
            ref={(el) => {
              nameRegisterRef(el)
              if (patients.length === 0 && firstInputRef) {
                firstInputRef.current = el
              }
            }}
          />
        </div>
        {errors.name && (
          <p className="text-xs font-medium text-red-700" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Telefone e E-mail */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quick-patient-phone" className="text-xs font-semibold text-slate-700">
            Telefone / WhatsApp *
          </Label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="quick-patient-phone"
              type="tel"
              placeholder="(11) 99999-9999"
              disabled={disabled}
              aria-invalid={Boolean(errors.phone)}
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25"
              value={phoneValue || ""}
              onChange={(e) =>
                setValue("phone", formatPhone(e.target.value), {
                  shouldValidate: Boolean(errors.phone),
                })
              }
            />
          </div>
          {errors.phone && (
            <p className="text-xs font-medium text-red-700" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quick-patient-email" className="text-xs font-semibold text-slate-700">
            E-mail (opcional)
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="quick-patient-email"
              type="email"
              placeholder="paciente@exemplo.com"
              disabled={disabled}
              aria-invalid={Boolean(errors.email)}
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-700" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
