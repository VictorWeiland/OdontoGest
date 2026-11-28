import { Search, CalendarClock, CheckCircle } from "lucide-react";
import { Reveal } from "./reveal";

const steps = [
    {
        icon: Search,
        title: "Escolha a clínica",
        text: "Veja as clínicas disponíveis e escolha a mais conveniente para o seu atendimento."
    },
    {
        icon: CalendarClock,
        title: "Selecione o horário",
        text: "Escolha o procedimento odontológico, o dia e o horário livre na agenda em tempo real."
    },
    {
        icon: CheckCircle,
        title: "Receba a confirmação",
        text: "Pronto! O agendamento fica registrado e disponível no painel de consultas da clínica."
    },
];

export function HowItWorks() {
    return (
        <section id="como-funciona" className="bg-white py-20 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <Reveal className="mx-auto mb-14 max-w-2xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl dark:text-emerald-50">Como funciona</h2>
                    <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">Agendar sua consulta leva menos de um minuto.</p>
                </Reveal>
                <ol className="grid gap-6 md:grid-cols-3">
                    {steps.map(({ icon: Icon, title, text }, i) => (
                        <li key={title}>
                            <Reveal delay={i * 100} className="h-full">
                                <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                                    <span className="absolute top-4 left-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">0{i + 1}</span>
                                    <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                                        <Icon className="size-7" aria-hidden />
                                    </div>
                                    <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">{title}</h3>
                                    <p className="mx-auto mt-2 max-w-[34ch] leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
