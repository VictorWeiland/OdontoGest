"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import {
  CalendarCheck2,
  Stethoscope,
  BarChart3,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Lock,
  ExternalLink,
  Plus,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Topbar } from "./topbar"
import { cn } from "@/lib/utils"
import {
  QuickAppointmentProvider,
  useQuickAppointment,
} from "./quick-appointment/quick-appointment-modal"

function MobileQuickAppointmentFab() {
  const { openQuickAppointment } = useQuickAppointment()

  return (
    <button
      type="button"
      onClick={() => openQuickAppointment()}
      aria-label="Agendamento rápido"
      title="Agendamento rápido"
      className="fixed right-4 bottom-5 z-40 inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/35 transition-transform duration-150 hover:bg-emerald-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:hidden"
    >
      <Plus className="size-6" aria-hidden />
    </button>
  )
}

interface UserSessionInfo {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface SidebarDashboardProps {
  children: React.ReactNode
  showReports: boolean
  user?: UserSessionInfo | null
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  locked?: boolean
  badge?: string
}

export default function SidebarDashboard({
  children,
  showReports,
  user,
}: SidebarDashboardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const panelItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Agendamentos",
      icon: CalendarCheck2,
    },
    {
      href: "/dashboard/services",
      label: "Serviços",
      icon: Stethoscope,
    },
    {
      href: "/dashboard/reports",
      label: "Relatórios",
      icon: BarChart3,
      locked: !showReports,
      badge: !showReports ? "Pro" : undefined,
    },
  ]

  const configItems: NavItem[] = [
    {
      href: "/dashboard/profile",
      label: "Meu Perfil",
      icon: Settings,
    },
    {
      href: "/dashboard/plans",
      label: "Planos",
      icon: CreditCard,
    },
  ]

  async function handleLogout() {
    await signOut({ redirect: false })
    router.replace("/")
  }

  function getInitials(name?: string | null) {
    if (!name) return "CL"
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  const renderNavLinks = (items: NavItem[], onItemClick?: () => void) => {
    return items.map((item) => {
      const isActive =
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.href)

      const Icon = item.icon

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          title={isCollapsed ? item.label : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            isActive
              ? "bg-emerald-500 text-white shadow-xs font-semibold"
              : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-800",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Icon
            className={cn(
              "size-5 shrink-0 transition-colors",
              isActive ? "text-white" : "text-slate-500 group-hover:text-emerald-700"
            )}
          />

          {!isCollapsed && (
            <span className="flex-1 truncate">{item.label}</span>
          )}

          {!isCollapsed && item.locked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
              <Lock className="size-3" />
              {item.badge}
            </span>
          )}

          {isCollapsed && item.locked && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-500" />
          )}
        </Link>
      )
    })
  }

  return (
    <QuickAppointmentProvider>
      <div className="flex min-h-screen w-full bg-slate-50/60 text-slate-800">
      {/* Sidebar Desktop Fixa */}
      <aside
        className={cn(
          "hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col md:border-r md:border-slate-200/80 md:bg-white md:transition-all md:duration-200",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        {/* Header da Sidebar com Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 font-extrabold tracking-tight text-emerald-950 transition-opacity",
              isCollapsed && "mx-auto"
            )}
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-lg shadow-xs shadow-emerald-500/30">
              O
            </div>
            {!isCollapsed && (
              <span className="text-xl">
                Odonto<span className="text-emerald-500">GEST</span>
              </span>
            )}
          </Link>
        </div>

        {/* Botão de Toggle Expand/Collapse */}
        <div className="flex justify-end px-3 pt-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>

        {/* Lista de Navegação */}
        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {/* Grupo PAINEL */}
          <div>
            {!isCollapsed && (
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Painel
              </p>
            )}
            <nav className="space-y-1" aria-label="Navegação do painel">
              {renderNavLinks(panelItems)}
            </nav>
          </div>

          {/* Grupo CONFIGURAÇÕES */}
          <div>
            {!isCollapsed && (
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Configurações
              </p>
            )}
            <nav className="space-y-1" aria-label="Configurações">
              {renderNavLinks(configItems)}
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar - Usuário & Sair */}
        <div className="border-t border-slate-100 p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5 transition-colors",
              isCollapsed && "justify-center p-2"
            )}
          >
            {user?.image ? (
              <div className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                <Image
                  src={user.image}
                  alt={user.name || "Foto de perfil"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-800">
                {getInitials(user?.name)}
              </div>
            )}

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-emerald-950">
                  {user?.name || "Clínica"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {user?.email || "Minha conta"}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da conta"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-600"
                aria-label="Sair da conta"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Drawer Mobile (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="z-50 w-72 p-0">
          <SheetHeader className="border-b border-slate-100 p-5 text-left">
            <SheetTitle className="text-xl font-extrabold text-emerald-950">
              Odonto<span className="text-emerald-500">GEST</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Menu de navegação da clínica
            </SheetDescription>
          </SheetHeader>

          <div className="flex h-[calc(100%-80px)] flex-col justify-between p-4">
            <div className="space-y-6 overflow-y-auto">
              <div>
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Painel
                </p>
                <nav className="space-y-1">
                  {renderNavLinks(panelItems, () => setIsMobileOpen(false))}
                </nav>
              </div>

              <div>
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Configurações
                </p>
                <nav className="space-y-1">
                  {renderNavLinks(configItems, () => setIsMobileOpen(false))}
                </nav>
              </div>

              {user?.id && (
                <div className="pt-2">
                  <Link
                    href={`/clinica/${user.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-3.5 py-2.5 text-xs font-semibold text-emerald-800"
                  >
                    <span>Página pública de agendamento</span>
                    <ExternalLink className="size-4 text-emerald-600" />
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-800">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-emerald-950">
                    {user?.name || "Clínica"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user?.email || "Minha conta"}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full justify-center gap-2 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                Sair da conta
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Conteúdo Principal com Topbar */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          isCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        <Topbar
          userName={user?.name}
          userId={user?.id}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 md:pb-8 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <MobileQuickAppointmentFab />
    </div>
    </QuickAppointmentProvider>
  )
}
