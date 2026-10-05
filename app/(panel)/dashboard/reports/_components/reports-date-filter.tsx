import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ReportsDateFilterProps {
    startDate: string
    endDate: string
}

export function ReportsDateFilter({ startDate, endDate }: ReportsDateFilterProps) {
    return (
        <Card>
            <CardContent>
                <form
                    action="/dashboard/reports"
                    method="get"
                    className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                    <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
                        De
                        <input
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            type="date"
                            name="startDate"
                            value={startDate}
                            required
                        />
                    </label>
                    <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
                        Até
                        <input
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            type="date"
                            name="endDate"
                            value={endDate}
                            required
                        />
                    </label>
                    <Button type="submit" className="sm:min-w-32">
                        Filtrar período
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
