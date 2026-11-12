import { CalendarDays, Users, LayoutDashboard, BellRing, BarChart3, UserCog } from "lucide-react";
import { Reveal } from "./reveal";

const features = [
    { icon: CalendarDays, title: "Agenda online", text: "Seus pacientes agendam sozinhos, a qualquer hora, direto no seu link." },
    { icon: Users, title: "Cadastro de pacientes", text: "Dados de contato e histórico de agendamentos organizados em um só lugar." },
    { icon: LayoutDashboard, title: "Painel de gestão", text: "Acompanhe serviços, horários e agendamentos do dia em um painel simples." },
    { icon: BellRing, title: "Lembretes por WhatsApp e e-mail", text: "Reduza faltas avisando o paciente antes da consulta." },
    { icon: BarChart3, title: "Relatórios", text: "Veja o desempenho da clínica por período e os serviços mais agendados." },
    { icon: UserCog, title: "Múltiplos profissionais", text: "Organize a agenda de toda a equipe sem conflito de horários." },
];

export function Features() {
    return (
        <section id="recursos" className="bg-emerald-50/60 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <Reveal className="mx-auto mb-14 max-w-2xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Recursos para clínicas</h2>
                    <p className="mt-3 text-lg text-slate-600">Tudo o que sua clínica precisa para atender melhor e perder menos tempo.</p>
                </Reveal>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ icon: Icon, title, text }, i) => (
                        <Reveal key={title} delay={(i % 3) * 80} className="h-full">
                            <article className="h-full rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <Icon className="size-6" aria-hidden />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-950">{title}</h3>
                                <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
