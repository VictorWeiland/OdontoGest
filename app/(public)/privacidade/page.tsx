import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade - OdontoGEST" };

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 leading-relaxed text-slate-700">
      <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">← Voltar</Link>
      <h1 className="mt-6 mb-6 text-3xl font-extrabold text-emerald-950">Política de Privacidade (LGPD)</h1>
      <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Texto-base provisório. Revise com assessoria jurídica antes de publicar.
      </p>
      <p className="mb-4">Coletamos nome, e-mail e telefone apenas para realizar e confirmar agendamentos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
      <p className="mb-4">Os dados são compartilhados somente com a clínica escolhida e não são vendidos a terceiros.</p>
      <p>Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato pelos canais indicados no rodapé.</p>
    </main>
  );
}
