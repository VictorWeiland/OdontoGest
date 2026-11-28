"use client"

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search, SearchX, Stethoscope } from "lucide-react";
import type { PublicClinic } from "../_data-access/get-professionals";
import { PremiumCardBadge } from "./premium-badge";
import { PortalButton } from "./portal-button";
import { Reveal } from "./reveal";

interface ProfessionalsProps {
    clinics: PublicClinic[]
    demoOnly: boolean
}

function initials(name?: string | null) {
    if (!name) return "";
    return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function ClinicCard({ clinic, demo }: { clinic: PublicClinic; demo: boolean }) {
    const active =
        clinic.subscription?.status === "active" ||
        clinic.subscription?.status === "trialing";
    const showBadge = !demo && !clinic.isDemo && active;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/70 dark:to-slate-900">
                {clinic.image ? (
                    <Image
                        src={clinic.image}
                        alt={`Logo ou foto de ${clinic.name ?? "clínica"}`}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        loading="lazy"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400" aria-hidden>
                        {initials(clinic.name) || <Stethoscope className="size-9" />}
                    </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                    {demo && (
                        <span className="inline-flex items-center rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white">
                            Exemplo
                        </span>
                    )}
                    {showBadge && <PremiumCardBadge plan={clinic.subscription?.plan} />}
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">{clinic.name ?? "Clínica"}</h3>
                <p className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    <span className="line-clamp-2">{clinic.address || "Endereço não informado"}</span>
                </p>
                {clinic.specialties.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                        {clinic.specialties.map((s) => (
                            <li key={s} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">{s}</li>
                        ))}
                    </ul>
                )}
                <Link
                    href={`/clinica/${clinic.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                    Agendar horário
                    <ArrowRight className="size-4" aria-hidden />
                </Link>
            </div>
        </article>
    );
}

export function Professionals({ clinics, demoOnly }: ProfessionalsProps) {
    const [query, setQuery] = useState("");
    const [specialty, setSpecialty] = useState("");

    const specialties = useMemo(
        () => Array.from(new Set(clinics.flatMap((c) => c.specialties))).sort(),
        [clinics]
    );
    const filterable = !demoOnly && clinics.length > 0;

    const filtered = useMemo(() => {
        if (!filterable) return clinics;
        const q = query.trim().toLowerCase();
        return clinics.filter((c) => {
            const matchesText = !q || `${c.name ?? ""} ${c.address ?? ""}`.toLowerCase().includes(q);
            const matchesSpec = !specialty || c.specialties.includes(specialty);
            return matchesText && matchesSpec;
        });
    }, [clinics, query, specialty, filterable]);

    return (
        <section id="clinicas" className="bg-slate-50 py-20 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <Reveal className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl dark:text-emerald-50">
                        {demoOnly ? "Veja como sua clínica aparece para os pacientes" : "Clínicas disponíveis"}
                    </h2>
                    {demoOnly && (
                        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                            Os cards abaixo são <strong>exemplos de demonstração</strong>, não clientes reais.
                        </p>
                    )}
                </Reveal>

                {filterable && (
                    <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
                        <label className="relative flex-1">
                            <span className="sr-only">Buscar por nome ou cidade</span>
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" aria-hidden />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar por nome ou cidade"
                                className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-10 text-sm transition-shadow duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                            />
                        </label>
                        {specialties.length > 0 && (
                            <label>
                                <span className="sr-only">Filtrar por especialidade</span>
                                <select
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none sm:w-52 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                >
                                    <option value="">Todas as especialidades</option>
                                    {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </label>
                        )}
                    </div>
                )}

                {filtered.length === 0 ? (
                    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                        <SearchX className="mb-3 size-10 text-emerald-500" aria-hidden />
                        <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
                            {clinics.length === 0 ? "Ainda não há clínicas por aqui" : "Nenhuma clínica encontrada"}
                        </h3>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {clinics.length === 0
                                ? "Novas clínicas estão chegando. Volte em breve!"
                                : "Tente buscar por outro nome, cidade ou especialidade."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((clinic, i) => (
                            <Reveal key={clinic.id} delay={(i % 4) * 70} className="h-full">
                                <ClinicCard clinic={clinic} demo={demoOnly} />
                            </Reveal>
                        ))}
                    </div>
                )}

                <Reveal className="mt-12">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:flex-row sm:text-left dark:border-emerald-500/25 dark:bg-emerald-950/40">
                        <div>
                            <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">Sua clínica aqui</h3>
                            <p className="text-slate-600 dark:text-slate-300">Cadastre-se no OdontoGEST e receba agendamentos online.</p>
                        </div>
                        <PortalButton label="Cadastre-se no OdontoGEST" className="shrink-0" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
