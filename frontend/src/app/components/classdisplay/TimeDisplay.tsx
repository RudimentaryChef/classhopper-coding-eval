"use client"
import { Dialog, Button, VisuallyHidden, Heading, Text } from "@radix-ui/themes"
import Image from "next/image"
import { TimeSlot } from "@/app/types"
import { useState } from "react"
import { rrulestr, RRule } from "rrule"

type Props = {
    title: string;
    img: string;
    instructor: string;
    meetingtimes: TimeSlot[]
    class_id: number;
    tallyID?: string;
    flexible?: boolean;
    children: React.ReactNode;
}

function processTime(time: string) {
    // Military time to 12 hour time
    const [hour, minute, _] = time.split(":")
    if (parseInt(hour) > 12) {
        return `${parseInt(hour) - 12}:${minute} PM`
    }
    return `${parseInt(hour)}:${minute} AM`
}

const dayMap: { [key: number]: string } = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
}

const TimeDisplay = (props: Props) => {
    const [selected, setSelected] = useState<number | null>(null)
    const [step, setStep] = useState<number>(0)

    function onNext() {
        setStep(step + 1)
    }

    function parseMeetingTime(mt: TimeSlot) {
        if (mt.flexible) return
        if (mt.dtstart && mt.dtend && mt.rrule) {
            const startDay = mt.dtstart.getDay()
            const endDay = mt.dtend.getDay()

            const startTime = mt.dtstart.toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })
            const endTime = mt.dtend.toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })
            console.log(startTime, endTime)
            console.log(dayMap[startDay], dayMap[endDay])

            console.log(mt.rrule)

        }
    }

    return (
        <Dialog.Root onOpenChange={() => {
            if (props.flexible == true) {
                setStep(1)
            } else {
                setStep(0)
            }
        }}>
            <Dialog.Trigger>
                {props.children}
            </Dialog.Trigger>
            <Dialog.Content maxWidth={"450px"}>
                <Dialog.Title className="">
                    <Text size={"7"}>{step == 0 ? "Sections Available" : "Register"}</Text>
                </Dialog.Title>
                <Dialog.Description className={`mb-6 ${step == 1 && "hidden"}`}>
                    <div className="flex flex-row items-center justify-start">
                        <Image
                            src={`https://storage.googleapis.com/imagestorageclasshopper/${props.img}`}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-sm object-cover"
                            alt="class image"
                        />
                        <div className="flex flex-col">
                            <Text size="4" className="ml-4 font-semibold">
                                {props.title}
                            </Text>
                            <Text color="gray" className="ml-4">{`1 hr ⋅ ${props.instructor}`}</Text>
                        </div>
                    </div>
                </Dialog.Description>
                {step == 0 && (
                    <div className="mt-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* {props.meetingtimes && props.meetingtimes.length > 0 ? props.meetingtimes.map((mt, idx) => (
                                <div key={mt.description} className={`flex cursor-pointer border ${selected == idx ? "border-blue-500 shadow-md" : "border-gray-300"} overflow-hidden rounded-sm ${mt.spots - mt.spots_taken <= 0 && "bg-gray-100"}`}
                                    onClick={() => {
                                        if (mt.spots - mt.spots_taken <= 0) return

                                        if (selected === idx) {
                                            setSelected(null)
                                        } else {
                                            setSelected(idx)
                                        }
                                    }}
                                >
                                    <div className={`min-h-32 flex flex-col py-2 px-3`}>
                                        <Text className="font-semibold">{mt.description}</Text>
                                        <div className="flex flex-col justify-center mt-2">
                                            <Text>{dayMap[mt.day_time_ranges[0].day_of_week] + ","}</Text>
                                            <Text>{processTime(mt.day_time_ranges[0].start_time) + " to " + processTime(mt.day_time_ranges[0].end_time)}</Text>
                                        </div>
                                        <Text color="gray" className="text-sm mt-1">{`${mt.spots - mt.spots_taken} spots left`}</Text>
                                    </div>
                                </div>
                            )) :
                                (
                                    <Text>No times available</Text>
                                )
                            } */}
                        </div>
                        <Button className="w-full mt-6" disabled={selected === null}
                            onClick={onNext}
                        >Next</Button>
                    </div>
                )}
                {/* {step == 1 && (
                    <TallyEmbed courseName="test" tallyID={props.tallyID} meetingtime={selected == null ? null : props.meetingtimes[selected]} course_id={props.class_id} />
                )} */}
            </Dialog.Content>
        </Dialog.Root >
    )
}

export default TimeDisplay