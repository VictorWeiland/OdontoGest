import { CheckCircle2, Calendar, Clock, MapPin, MessageCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/formatCurrency"
import Link from "next/link"

interface ScheduleSuccessProps {
  clinicName: string
  clinicPhone?: string | null
  clinicAddress?: string | null
  patientName: string
  patientPhone: string
  serviceName: string
  servicePrice: number
  dateFormatted: string
  time: string
  onReset: () => void
}

export function ScheduleSuccess({
  clinicName,
  clinicPhone,
  clinicAddress,
  patientName,
  patientPhone,
  serviceName,
  servicePrice,
  dateFormatted,
  time,
  onReset,
}: ScheduleSuccessProps) {
  // Monta link do WhatsApp da clínica
  const cleanPhone = (clinicPhone || patientPhone).replace(/\D/g, "")
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
  const message = encodeURIComponent(
    `Olá! Sou ${patientName} e acabo de agendar ${serviceName} para o dia ${dateFormatted} às ${time} pelo OdontoGEST.`
  )
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${message}`

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-emerald-200/90 bg-white p-6 sm:p-8 text-center shadow-lg shadow-emerald-900/5 dark:border-emerald-500/30 dark:bg-slate-900 dark:shadow-black/40">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xs dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 className="size-9" />
      </div>

      <span className="mt-4 inline-block text-xs font-bold text-emerald-700 uppercase tracking-wider dark:text-emerald-400">
        Agendamento Realizado
      </span>

      <h2 className="mt-1 text-2xl font-extrabold text-emerald-950 sm:text-3xl dark:text-emerald-50">
        Consulta confirmada!
      </h2>

      <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
        Obrigado, <strong>{patientName}</strong>! Seus dados foram enviados diretamente para a equipe da clínica.
      </p>

      {/* Resumo do Agendamento */}
      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-left text-xs sm:text-sm space-y-3 dark:border-emerald-500/20 dark:bg-emerald-950/30">
        <div className="border-b border-emerald-100/70 pb-3 dark:border-emerald-500/20">
          <p className="text-[11px] text-slate-500 font-medium dark:text-slate-400">Clínica</p>
          <h4 className="font-extrabold text-emerald-950 text-base dark:text-emerald-50">{clinicName}</h4>
          {clinicAddress && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 dark:text-slate-300">
              <MapPin className="size-3.5 text-emerald-600 shrink-0 dark:text-emerald-400" />
              <span>{clinicAddress}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-emerald-100/70 pb-3 dark:border-emerald-500/20">
          <div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 dark:text-slate-400">
              <Calendar className="size-3 text-emerald-600 dark:text-emerald-400" />
              Data
            </p>
            <p className="font-bold text-emerald-950 capitalize mt-0.5 dark:text-emerald-50">{dateFormatted}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 dark:text-slate-400">
              <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
              Horário
            </p>
            <p className="font-bold text-emerald-950 mt-0.5 dark:text-emerald-50">{time}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[11px] text-slate-500 font-medium dark:text-slate-400">Procedimento</p>
            <p className="font-bold text-emerald-950 dark:text-emerald-50">{serviceName}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500 font-medium dark:text-slate-400">Valor</p>
            <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(servicePrice / 100)}</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-col gap-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
        >
          <MessageCircle className="size-4" />
          Falar com a clínica no WhatsApp
        </a>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Realizar outro agendamento
        </Button>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-emerald-700 transition-colors pt-2 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="size-3" />
          <span>Voltar para a página inicial</span>
        </Link>
      </div>
    </div>
  )
}
