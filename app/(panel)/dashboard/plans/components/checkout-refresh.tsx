"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function CheckoutRefresh() {
    const router = useRouter()

    useEffect(() => {
        const url = new URL(window.location.href)

        if (url.searchParams.get("checkout") !== "success") {
            return
        }

        url.searchParams.delete("checkout")
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`)
        router.refresh()
    }, [router])

    return null
}
