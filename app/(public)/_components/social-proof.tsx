import { Quote } from "lucide-react";
import { REAL_METRICS, REAL_TESTIMONIALS, SHOW_SOCIAL_PROOF } from "@/lib/landing-config";

/**
 * Prova social: só renderiza com SHOW_SOCIAL_PROOF=true E dados reais
 * preenchidos em lib/landing-config.ts. Nunca inventamos números.
 */
export function SocialProof() {
    if (!SHOW_SOCIAL_PROOF) return null;
    if (REAL_METRICS.length === 0 && REAL_TESTIMONIALS.length === 0) return null;

    return (
        <section className="bg-white py-20 dark:bg-slate-950" aria-labelledby="prova-social">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 id="prova-social" className="mb-12 text-center text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl dark:text-emerald-50">
                    Quem usa, recomenda
                </h2>

                {REAL_METRICS.length > 0 && (
                    <dl className="mb-12 grid grid-cols-2 gap-6 rounded-2xl bg-emerald-50 p-8 lg:grid-cols-4 dark:bg-emerald-950/40 dark:ring-1 dark:ring-emerald-500/20">
                        {REAL_METRICS.map((m) => (
                            <div key={m.label} className="text-center">
                                <dd className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{m.value}</dd>
                                <dt className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.label}</dt>
                            </div>
                        ))}
                    </dl>
                )}

                {REAL_TESTIMONIALS.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {REAL_TESTIMONIALS.slice(0, 3).map((t) => (
                            <figure key={t.name} className="rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <Quote className="mb-3 size-6 text-emerald-500" aria-hidden />
                                <blockquote className="leading-relaxed text-slate-700 dark:text-slate-300">{t.text}</blockquote>
                                <figcaption className="mt-4 text-sm">
                                    <span className="font-bold text-emerald-950 dark:text-emerald-50">{t.name}</span>
                                    <span className="text-slate-500 dark:text-slate-400"> · {t.clinic}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
