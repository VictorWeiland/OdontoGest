import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "Termos de Uso - OdontoGEST" };

export default function Termos() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <main className="mx-auto max-w-3xl px-4 py-16 leading-relaxed text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">← Voltar</Link>
          <ThemeToggle />
        </div>
        <h1 className="mt-6 mb-6 text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">Termos de Uso</h1>
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
          Texto-base provisório. Revise com assessoria jurídica antes de publicar.
        </p>
        <p className="mb-4">O OdontoGEST é uma plataforma que conecta pacientes a clínicas odontológicas para agendamento online e oferece ferramentas de gestão às clínicas.</p>
        <p className="mb-4">O valor, a execução e as regras de cancelamento dos atendimentos são de responsabilidade de cada clínica.</p>
        <p>Ao usar a plataforma, você concorda em fornecer informações verdadeiras e em não utilizá-la para fins ilícitos.</p>
      </main>
    </div>
  );
}
