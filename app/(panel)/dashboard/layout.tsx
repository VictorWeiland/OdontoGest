import SidebarDashboard from "./_components/sidebar"
import getSession from "@/lib/getSession"
import { getPermissionUserToReports } from "./reports/_data-access/get-permission-reports"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}){
    const session = await getSession()
    const showReports = session?.user?.id
        ? await getPermissionUserToReports({ userId: session.user.id })
        : false

    return(
        <>  
            <SidebarDashboard showReports={showReports}>
                {children}
            </SidebarDashboard>
        </>
    )
}