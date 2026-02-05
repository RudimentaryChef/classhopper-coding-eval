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

export function DatePicker({ disabled, date, setDate }: { disabled?: boolean, date: Date, setDate: React.Dispatch<React.SetStateAction<Date>> }) {

    return (
        <Popover modal>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant={"outline"}
                    className={cn(
                        "flex-grow justify-start text-left font-normal",
                        !date || disabled && "text-muted-foreground"
                    )}
                >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => day && setDate(day)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}