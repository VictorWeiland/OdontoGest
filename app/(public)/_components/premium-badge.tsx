interface PremiumCardBadgeProps {
    plan?: "BASIC" | "PROFESSIONAL"
}

/** Badge de texto legível para clínicas reais com assinatura ativa. */
export function PremiumCardBadge({ plan }: PremiumCardBadgeProps) {
    const label = plan === "PROFESSIONAL" ? "Destaque" : "Parceiro"
    return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
            {label}
        </span>
    )
}
