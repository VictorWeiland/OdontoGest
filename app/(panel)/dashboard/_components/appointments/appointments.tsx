import { getTimesClinic } from "../../_data-access/get-times-clinic"
import { AppointmentsList } from "./appoitments-list"

export async function Appointments({ userId }: { userId: string }) {
    const { times, status, workingDays } = await getTimesClinic({ userId })

    return (
        <section>
            <AppointmentsList
                times={times}
                userId={userId}
                clinicStatus={status}
                workingDays={workingDays}
            />
        </section>
    )
}
