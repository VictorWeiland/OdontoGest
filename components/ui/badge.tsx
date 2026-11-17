import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-white shadow-xs hover:bg-emerald-600",
        secondary:
          "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200",
        outline:
          "border border-slate-300 text-slate-700 bg-white",
        success:
          "bg-emerald-100 text-emerald-800 border border-emerald-200",
        warning:
          "bg-amber-100 text-amber-900 border border-amber-200",
        muted:
          "bg-slate-100 text-slate-600 border border-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
