import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, BellRing, ShieldCheck, ArrowRight } from "lucide-react";
import dentistImg from "../../../public/dentist-hero.jpg";
import { PortalButton } from "./portal-button";

const trustBadges = [
    { icon: CalendarCheck, label: "Agendamento online 24h" },
    { icon: BellRing, label: "Lembretes automáticos" },
    { icon: ShieldCheck, label: "Seguro e em conformidade com a LGPD" },
];

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40">
            {/* formas decorativas */}
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-emerald-200/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-emerald-100/60 blur-3xl" />

            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-32 lg:pb-24">
                <div className="space-y-8">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        Agendamento e gestão para clínicas odontológicas
                    </span>
                    <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-emerald-950 sm:text-5xl lg:text-[3.5rem]">
                        Agende consultas odontológicas em <span className="text-emerald-500">poucos cliques</span>
                    </h1>
                    <p className="max-w-[60ch] text-lg leading-relaxed text-slate-600">
                        Pacientes escolhem a clínica, o dia e o horário em minutos. Clínicas
                        organizam agenda, pacientes e lembretes em um só lugar.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="#clinicas"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                        >
                            Encontrar clínica
                            <ArrowRight className="size-5" aria-hidden />
                        </Link>
                        <PortalButton
                            variant="light"
                            className="border border-emerald-200 px-6! py-3.5! text-base!"
                            label="Sou clínica, quero o OdontoGEST"
                        />
                    </div>

                    <ul className="grid gap-3 pt-2 sm:grid-cols-3">
                        {trustBadges.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                                <Icon className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                    <div aria-hidden className="absolute -inset-3 rotate-3 rounded-[2rem] bg-emerald-200/50" />
                    <Image
                        src={dentistImg}
                        alt="Dentista sorrindo em um consultório odontológico moderno"
                        priority
                        sizes="(min-width: 1024px) 560px, 90vw"
                        className="relative aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-xl shadow-emerald-900/10"
                    />
                </div>
            </div>
        </section>
    )
}
