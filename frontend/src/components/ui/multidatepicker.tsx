"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function MultiDatePicker({ disabled, dates, setDates }: { disabled?: boolean, dates: Date[] | undefined, setDates: React.Dispatch<React.SetStateAction<Date[] | undefined>> }) {

    return (
        <Popover modal>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant={"outline"}
                    className={cn(
                        "flex-grow justify-start text-left font-normal",
                        !dates || disabled && "text-muted-foreground"
                    )}
                >
                    {dates && dates.length > 0 ? `${dates.length || 0} date(s) picked` : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="multiple"
                    selected={dates}
                    onSelect={(d) => setDates(d)}
                    max={10}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}