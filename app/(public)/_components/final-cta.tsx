import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/landing-config";
import { PortalButton } from "./portal-button";
import { Reveal } from "./reveal";

export function FinalCta() {
    const wa = whatsappLink();
    return (
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
            <Reveal>
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-emerald-600 px-6 py-16 text-center sm:px-12">
                    <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-emerald-500/50" />
                    <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-700/40" />
                    <div className="relative">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Leve seu consultório para o digital
                        </h2>
                        <p className="mx-auto mt-4 max-w-[60ch] text-base leading-relaxed text-emerald-50 sm:text-lg">
                            Receba agendamentos online 24h, confirme horários no WhatsApp com 1 clique e simplifique a rotina da sua clínica.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <PortalButton
                                variant="light"
                                className="px-6! py-3.5! text-base!"
                                label="Acessar Portal da Clínica"
                            />
                            {wa && (
                                <a
                                    href={wa}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    <MessageCircle className="size-5" aria-hidden />
                                    Falar no WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    )
}
