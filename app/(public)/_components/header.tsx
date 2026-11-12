"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { PortalButton } from "./portal-button";

const navItems = [
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#recursos", label: "Recursos" },
    { href: "#clinicas", label: "Clínicas" },
    { href: "#contato", label: "Contato" },
]

const linkClass =
    "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
                scrolled
                    ? "bg-white/80 shadow-sm shadow-slate-900/5 backdrop-blur-md"
                    : "bg-white/60 backdrop-blur-sm"
            }`}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="text-2xl font-extrabold tracking-tight text-emerald-950"
                    aria-label="OdontoGEST - página inicial"
                >
                    Odonto<span className="text-emerald-500">GEST</span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={linkClass}>
                            {item.label}
                        </Link>
                    ))}
                    <PortalButton className="ml-3" />
                </nav>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger
                        className="md:hidden"
                        aria-label="Abrir menu"
                        render={
                            <button
                                type="button"
                                className="inline-flex size-10 items-center justify-center rounded-xl text-emerald-950 transition-colors duration-150 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
                            >
                                <Menu className="size-6" aria-hidden />
                            </button>
                        }
                    />
                    <SheetContent side="right" className="z-[60] w-72">
                        <SheetHeader className="p-4">
                            <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
                            <SheetDescription>Navegue pelo OdontoGEST</SheetDescription>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`${linkClass} text-base`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <PortalButton className="mt-4" onClick={() => setIsOpen(false)} />
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
