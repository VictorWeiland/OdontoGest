"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Link2 } from "lucide-react"
import { toast } from "sonner"

export function ButtonCopyLink({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopyLink() {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const url = `${origin}/clinica/${userId}`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link público copiado com sucesso!")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Não foi possível copiar o link.")
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleCopyLink}
      className="gap-2 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 shadow-2xs"
      title="Copiar link da página de agendamento"
    >
      {copied ? (
        <>
          <Check className="size-4 text-emerald-600" />
          <span>Copiado!</span>
        </>
      ) : (
        <>
          <Link2 className="size-4 text-slate-500" />
          <span className="hidden sm:inline">Copiar link público</span>
          <span className="sm:hidden">Copiar</span>
        </>
      )}
    </Button>
  )
}
