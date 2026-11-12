import { ChevronDown } from "lucide-react";
import { Reveal } from "./reveal";

const faqs = [
    { q: "Como agendo uma consulta?", a: "Na seção Clínicas, escolha a clínica, clique em “Agendar horário”, selecione o serviço, a data e um horário disponível e informe seus dados de contato." },
    { q: "Quanto custa para o paciente?", a: "Agendar pelo OdontoGEST é gratuito para o paciente. O valor das consultas e tratamentos é definido por cada clínica." },
    { q: "Meus dados estão seguros?", a: "Sim. Tratamos os dados conforme a LGPD e os usamos apenas para realizar e confirmar o seu agendamento. Veja detalhes na Política de Privacidade." },
    { q: "Posso cancelar ou remarcar?", a: "Sim. Entre em contato com a clínica com antecedência para cancelar ou remarcar; cada clínica define suas regras de cancelamento." },
    { q: "Sou clínica. Como começo?", a: "Clique em “Portal da Clínica”, entre com sua conta e configure serviços e horários. Você começa a receber agendamentos pelo seu link próprio." },
];

export function Faq() {
    return (
        <section id="faq" className="bg-white py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <Reveal className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Perguntas frequentes</h2>
                </Reveal>
                <div className="space-y-3">
                    {faqs.map(({ q, a }) => (
                        <details key={q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-shadow duration-200 open:shadow-md">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-semibold text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 [&::-webkit-details-marker]:hidden">
                                {q}
                                <ChevronDown className="size-5 shrink-0 text-emerald-600 transition-transform duration-200 group-open:rotate-180" aria-hidden />
                            </summary>
                            <p className="mt-3 max-w-[60ch] leading-relaxed text-slate-600">{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
