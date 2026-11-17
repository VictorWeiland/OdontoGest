import SidebarDashboard from "./_components/sidebar"
import getSession from "@/lib/getSession"
import { getPermissionUserToReports } from "./reports/_data-access/get-permission-reports"
import prisma from "@/lib/prisma"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}){
    const session = await getSession()
    const userId = session?.user?.id

    const showReports = userId
        ? await getPermissionUserToReports({ userId })
        : false

    // Busca dados atualizados da clínica (nome, imagem, email) para exibir no menu do usuário
    const clinicUser = userId
        ? await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        })
        : null

    return (
        <SidebarDashboard
            showReports={showReports}
            user={clinicUser ?? session?.user ?? null}
        >
            {children}
        </SidebarDashboard>
    )
}
