"use client"

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { LogIn, Menu } from "lucide-react";
import { useSession } from 'next-auth/react'
import { handleRegister } from '../_actions/login'


export function Header() {
    const{ data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        {href: "#profissionais", label: "Profissionais"},
        /*{href: "/contatos", label: "Contatos"}*/
    ]

    async function handleLogin() {
        await handleRegister("google")
    }

    const NavLinks = () =>(
        <>
        {navItems.map((item)=>(
            <Button  
                onClick={() => setIsOpen(false)}              
                key={item.href}
                className="bg-transparent hover:bg-transparent text-black shadow-none"
            >
                <Link href={item.href} className="text-base">
                    {item.label}
                </Link>
            </Button>
        ))}
        {status === 'loading' ? (
            <></>
        ) : session ? (
            <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-1 rounded-md px-4"
            >
                Acessar clínica
            </Link>
        ):(
            <Button onClick={handleLogin}>
                <LogIn />
                Portal da Clínica
            </Button>
        )}
        </>
    )

    return (
        <header 
            className="fixed top-0 right-0 left-0 z-999 py-4 px-6 bg-white"
        >
            <div className="container mx-auto flex items-center justify-between">
                <Link 
                    href="/"
                    className="text-3xl font-bold text-zinc-900"
                >
                    Odonto<span className="text-emerald-500">GEST</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-04">
                    <NavLinks />
                </nav>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger
                        className="md:hidden"
                        render={
                            <Button
                                className="text-black hover:bg-transparent"
                                variant="ghost"
                                size="icon"
                            >
                                <Menu className="w-6 h-6" />
                            </Button>
                        }
                    />
                    <SheetContent side="right" className="z-9999 w-60 sm:w-75">
                        <SheetHeader className="p-4">
                            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                            <SheetDescription>Veja nossos links</SheetDescription>
                        </SheetHeader>
                        <nav className="flex flex-col space-y-4 mt-6">
                            <NavLinks />
                        </nav>
                    </SheetContent>
                </Sheet>
            </div> 
        </header>
    )
}