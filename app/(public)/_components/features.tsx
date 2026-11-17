import {
  CalendarDays,
  Globe,
  LayoutDashboard,
  MessageCircle,
  BarChart3,
  Clock,
  Sparkles,
} from "lucide-react";
import { Reveal } from "./reveal";

interface FeatureItem {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  text: string;
  badge?: string;
  status: "available" | "soon";
}

const features: FeatureItem[] = [
  {
    icon: CalendarDays,
    title: "Agenda online 24h",
    text: "Seus pacientes agendam sozinhos a qualquer hora, com bloqueio automático de horários ocupados.",
    status: "available",
  },
  {
    icon: Globe,
    title: "Página pública da clínica",
    text: "Um link exclusivo com seus serviços, durações e valores para compartilhar com pacientes.",
    status: "available",
  },
  {
    icon: LayoutDashboard,
    title: "Painel de gestão diária",
    text: "Acompanhe consultas agendadas, horários vagos e crie anotações operacionais da rotina.",
    status: "available",
  },
  {
    icon: MessageCircle,
    title: "Confirmação WhatsApp em 1 clique",
    text: "Mensagem personalizada pronta com data, hora e serviço para enviar ao paciente sem digitar nada.",
    status: "available",
  },
  {
    icon: Clock,
    title: "Horários e intervalos ativos",
    text: "Configure intervalos de atendimento e horários de funcionamento específicos da sua clínica.",
    status: "available",
  },
  {
    icon: BarChart3,
    title: "Relatórios e faturamento estimado",
    text: "Gráficos de consultas, horários de maior movimento e procedimentos mais agendados (Plano Profissional).",
    status: "available",
  },
];

const upcomingFeatures = [
  "Lembretes automáticos por WhatsApp",
  "Múltiplos profissionais / cadeiras",
  "Anamnese digital e prontuário",
  "Controle financeiro básico",
];

export function Features() {
  return (
    <section id="recursos" className="bg-emerald-50/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="size-3.5 text-emerald-600" />
            Recursos reais e disponíveis
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
            Recursos para o seu consultório
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Tudo o que sua clínica precisa hoje para organizar a agenda e acabar com os horários vagos.
          </p>
        </Reveal>

        {/* Grade de Recursos Disponíveis */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 3) * 80} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Faixa Discreta de Recursos em Desenvolvimento ("Em breve") */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                Em breve
              </span>
              <p className="text-xs text-slate-600">
                Novos recursos previstos em atualizações contínuas da plataforma:
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {upcomingFeatures.map((item) => (
                <span
                  key={item}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  • {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
