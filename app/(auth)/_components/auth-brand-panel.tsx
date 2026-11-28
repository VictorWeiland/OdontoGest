import Link from "next/link"
import { CalendarCheck, MessageCircle, Clock, ShieldCheck } from "lucide-react"
import { PLAN_FEATURES } from "@/utils/plans"

interface BenefitConfig {
  featureId: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const BENEFIT_ITEMS: BenefitConfig[] = [
  {
    featureId: "online_scheduling",
    description:
      "Pacientes escolhem clínica, data e horário disponíveis direto pelo seu link exclusivo.",
    icon: CalendarCheck,
  },
  {
    featureId: "whatsapp_confirmation_click",
    description:
      "Envie confirmações com mensagem pré-preenchida de data, horário e procedimento.",
    icon: MessageCircle,
  },
  {
    featureId: "operating_hours",
    description:
      "Configure os horários de atendimento da clínica e gerencie serviços em um só lugar.",
    icon: Clock,
  },
]

export function AuthBrandPanel() {
  const availableFeatures = PLAN_FEATURES.filter((f) => f.status === "available")

  const benefits = BENEFIT_ITEMS.map((item) => {
    const feature = availableFeatures.find((f) => f.id === item.featureId)
    if (!feature) return null
    return {
      id: feature.id,
      title: feature.label,
      description: item.description,
      icon: item.icon,
    }
  }).filter((b): b is NonNullable<typeof b> => b !== null)

  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-950 p-12 text-white lg:flex dark:from-emerald-900 dark:via-emerald-950 dark:to-slate-950">
      {/* Formas decorativas sutis */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-emerald-500/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-emerald-400/20 blur-3xl"
      />

      {/* Topo do painel: Logo */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-xl text-2xl font-black tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-white text-lg font-black text-emerald-700 shadow-sm">
            O
          </div>
          <span>
            Odonto<span className="text-emerald-200">GEST</span>
          </span>
        </Link>
        <p className="mt-2.5 text-xs text-emerald-100">
          Plataforma de agendamento online e gestão para clínicas odontológicas
        </p>
      </div>

      {/* Meio: 3 benefícios disponíveis em utils/plans/index.ts */}
      <div className="relative z-10 my-auto max-w-md space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Organize sua clínica com praticidade e controle
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-emerald-50/90">
            Centralize sua agenda, serviços e horários de atendimento em um painel simples para o dia a dia do consultório.
          </p>
        </div>

        <ul className="space-y-4">
          {benefits.map(({ id, title, description, icon: Icon }) => (
            <li
              key={id}
              className="flex items-start gap-3.5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs"
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <Icon className="size-4" aria-hidden />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{title}</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-50/85">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Rodapé do painel */}
      <div className="relative z-10 flex items-center gap-2 text-xs text-emerald-100">
        <ShieldCheck className="size-4 text-emerald-200" aria-hidden />
        <span>Ambiente protegido e em conformidade com a LGPD</span>
      </div>
    </div>
  )
}
