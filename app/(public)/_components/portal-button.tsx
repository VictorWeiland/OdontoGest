"use client"

import Link from "next/link";
import { LogIn, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

interface PortalButtonProps {
    variant?: "primary" | "light"
    className?: string
    onClick?: () => void
    /** Texto quando deslogado (padrão: "Portal da Clínica") */
    label?: string
}

const styles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/30",
    light: "bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800",
};

/** Botão "Portal da Clínica": leva ao login (/login) ou ao painel (/dashboard) se já logado. */
export function PortalButton({ variant = "primary", className = "", onClick, label = "Portal da Clínica" }: PortalButtonProps) {
    const { data: session, status } = useSession();
    const base = `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${styles[variant]} ${className}`;

    if (status === "loading") {
        return <span className={`${base} opacity-70`} aria-busy="true">{label}</span>;
    }

    if (session) {
        return (
            <Link href="/dashboard" onClick={onClick} className={base}>
                <LayoutDashboard className="size-4" aria-hidden />
                Acessar clínica
            </Link>
        );
    }

    return (
        <Link href="/login" onClick={onClick} className={base}>
            <LogIn className="size-4" aria-hidden />
            {label}
        </Link>
    );
}
