import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { CONTACT, SOCIALS, whatsappLink } from "@/lib/landing-config";

const usefulLinks = [
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#recursos", label: "Recursos" },
    { href: "#clinicas", label: "Clínicas" },
    { href: "#faq", label: "Perguntas frequentes" },
];

const linkClass = "rounded text-emerald-100 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-white";

export function Footer() {
    const wa = whatsappLink();
    const socials = [
        { href: SOCIALS.instagram, label: "Instagram" },
        { href: SOCIALS.linkedin, label: "LinkedIn" },
        { href: SOCIALS.facebook, label: "Facebook" },
    ].filter((s) => s.href);

    return (
        <footer id="contato" className="bg-emerald-950 text-emerald-100">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                <div className="space-y-4">
                    <p className="text-2xl font-extrabold tracking-tight text-white">
                        Odonto<span className="text-emerald-400">GEST</span>
                    </p>
                    <p className="max-w-[40ch] text-sm leading-relaxed">
                        Plataforma de agendamento online e gestão para clínicas odontológicas.
                    </p>
                </div>

                <nav aria-label="Links úteis">
                    <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">Links úteis</h2>
                    <ul className="space-y-2 text-sm">
                        {usefulLinks.map((l) => (
                            <li key={l.href}><Link href={l.href} className={linkClass}>{l.label}</Link></li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">Contato</h2>
                    <ul className="space-y-2 text-sm">
                        {CONTACT.email && (
                            <li><a href={`mailto:${CONTACT.email}`} className={`${linkClass} inline-flex items-center gap-2`}><Mail className="size-4" aria-hidden />{CONTACT.email}</a></li>
                        )}
                        {wa && (
                            <li><a href={wa} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}><MessageCircle className="size-4" aria-hidden />WhatsApp</a></li>
                        )}
                        {!CONTACT.email && !wa && <li>Entre pelo Portal da Clínica.</li>}
                    </ul>
                    {socials.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            {socials.map(({ href, label }) => (
                                <li key={label}>
                                    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <nav aria-label="Legal">
                    <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">Legal</h2>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/termos" className={linkClass}>Termos de Uso</Link></li>
                        <li><Link href="/privacidade" className={linkClass}>Política de Privacidade (LGPD)</Link></li>
                    </ul>
                </nav>
            </div>
            <div className="border-t border-emerald-900 py-6 text-center text-sm text-emerald-200">
                <p>© 2026 - Triforce System. Todos os direitos reservados.</p>
            </div>
        </footer>
    )
}
