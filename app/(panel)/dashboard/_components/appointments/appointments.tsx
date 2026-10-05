import { getTimesClinic } from "../../_data-access/get-times-clinic"
import { AppointmentsList } from "./appoitments-list"

export async function Appointments({ userId }: { userId: string }) {

    const { times, userId: id } = await getTimesClinic({ userId: userId })



    return (
        <div>
            <h1>
                <AppointmentsList 
                    times={times}
                />
            </h1>
        </div>
    )
}