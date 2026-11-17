import { ChevronDown } from "lucide-react";
import { Reveal } from "./reveal";

const faqs = [
    {
        q: "Como o paciente agenda uma consulta?",
        a: "Na seção Clínicas, o paciente escolhe o consultório, clica em “Agendar horário”, seleciona o procedimento, escolhe a data e um horário livre em tempo real, informando nome, telefone e e-mail."
    },
    {
        q: "Quanto custa para o paciente agendar?",
        a: "Agendar pelo OdontoGEST é 100% gratuito para o paciente. O valor das consultas e tratamentos é informado pela própria clínica e acertado diretamente com ela."
    },
    {
        q: "Como funciona a confirmação por WhatsApp?",
        a: "No painel da clínica, ao abrir os detalhes de qualquer agendamento, há um botão de WhatsApp com mensagem pronta contendo o nome do paciente, data, horário e serviço. Com 1 clique o profissional envia a confirmação sem precisar digitar."
    },
    {
        q: "A plataforma suporta mais de um profissional ou dentista?",
        a: "No momento, o OdontoGEST é otimizado para 1 profissional/cadeira por consultório, ideal para dentistas autônomos e clínicas individuais. O suporte a múltiplos profissionais está em desenvolvimento (Plano Profissional e Rede de Clínicas)."
    },
    {
        q: "Quais os limites de serviços em cada plano?",
        a: "O Plano Básico permite cadastrar até 15 procedimentos odontológicos ativos. O Plano Profissional permite procedimentos ilimitados e inclui relatórios operacionais completos com gráficos de faturamento."
    },
    {
        q: "Os dados dos pacientes e da clínica estão seguros?",
        a: "Sim. A plataforma segue as diretrizes da LGPD, utiliza conexões criptografadas (HTTPS) e armazena os dados com segurança exclusivamente para a gestão dos agendamentos."
    },
    {
        q: "Sou dentista ou clínica. Como posso começar?",
        a: "Clique em “Portal da Clínica”, faça login com sua conta, configure seus procedimentos e horários de atendimento. Em poucos minutos sua página de agendamento estará pronta para divulgar."
    },
];

export function Faq() {
    return (
        <section id="faq" className="bg-white py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <Reveal className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
                        Perguntas frequentes
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Tire suas dúvidas sobre o funcionamento do OdontoGEST para pacientes e clínicas.
                    </p>
                </Reveal>
                <div className="space-y-3">
                    {faqs.map(({ q, a }) => (
                        <details key={q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-shadow duration-200 open:shadow-md">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-semibold text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 [&::-webkit-details-marker]:hidden">
                                <span>{q}</span>
                                <ChevronDown className="size-5 shrink-0 text-emerald-600 transition-transform duration-200 group-open:rotate-180" aria-hidden />
                            </summary>
                            <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-slate-600">{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
