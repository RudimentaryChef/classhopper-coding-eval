"use client"
import React from 'react'
import { toast } from "sonner";
import { Dialog, Text, IconButton, Button, Select, TextField, Switch, Radio } from "@radix-ui/themes";
import { TrashIcon } from 'lucide-react';
import { UsersRoundIcon, Clock, CalendarDaysIcon, Repeat, ArrowRight, TextIcon, WaypointsIcon } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import { Input } from '@/components/ui/input';
import { RRule } from 'rrule'
import { TimeSlot } from '../types';
import { formatTime, timeDifference } from '../utils/functions';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { MultiDatePicker } from '@/components/ui/multidatepicker';

type Props = {
    children: React.ReactNode;
    timeSlots: TimeSlot[];
    setTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
    onAdd: (ts: TimeSlot) => Promise<void>;
}

const TimeSlotPopup = (props: Props) => {
    const [seatsAvailable, setSeatsAvailable] = React.useState<number | undefined>(undefined);
    const [repeat, setRepeat] = React.useState(false);
    const [flexible, setFlexible] = React.useState(false);
    const [multi, setMulti] = React.useState(false);
    const [start, setStart] = React.useState<Date>(new Date());
    const [end, setEnd] = React.useState<Date>(new Date());
    const [activeDays, setActiveDays] = React.useState<string[]>([]);
    const [ends, setEnds] = React.useState<string>('never');
    const [freq, setFreq] = React.useState<'week' | 'month' | 'year'>('week');
    const [freqCount, setFreqCount] = React.useState<number>(1);
    const [description, setDescription] = React.useState<string>('');

    const [dates, setDates] = React.useState<Date[] | undefined>(undefined);

    const [startTime, setStartTime] = React.useState<string>('');
    const [endTime, setEndTime] = React.useState<string>('');
    const [open, setOpen] = React.useState(false);

    const dayMap: { [key: string]: any } = {
        "Mo": RRule.MO,
        "Tu": RRule.TU,
        "We": RRule.WE,
        "Th": RRule.TH,
        "Fr": RRule.FR,
        "Sa": RRule.SA,
        "Su": RRule.SU
    }



    const freqMap: { [key: string]: any } = {
        "week": RRule.WEEKLY,
        "month": RRule.MONTHLY,
        "year": RRule.YEARLY
    }

    function reset() {
        setOpen(false);
        setSeatsAvailable(undefined);
        setRepeat(false);
        setFlexible(false);
        setStart(new Date());
        setEnd(new Date());
        setActiveDays([]);
        setEnds('never');
        setFreq('week');
        setFreqCount(1);
        setStartTime('');
        setEndTime('');
        setDescription('');
    }

    async function handleSubmit() {

        if (multi) {
            if (!dates || dates.length === 0) {
                toast.error("Please select dates");
                return
            }

            // sort dates
            dates.sort(function (a, b) { return a.getTime() - b.getTime() });
            const startDate = dates[0]
            const endDate = dates[dates.length - 1]

            const st = startTime.split(' ')[0].split(':');

            if (startTime.split(' ')[1].trim() === "PM") {
                st[0] = (parseInt(st[0]) + 12).toString();
            }

            const et = endTime.split(' ')[0].split(':');
            if (endTime.split(' ')[1].trim() === "PM") {
                et[0] = (parseInt(et[0]) + 12).toString();
            }

            let nextDay = 0;
            if (startTime.endsWith("PM") && endTime.endsWith("AM")) {
                nextDay = 1;
            }

            const ts: TimeSlot = {
                flexible: false,
                spots: seatsAvailable,
                description: description,
                dtstart: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), Number(st[0]), Number(st[1])),
                dtend: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + nextDay, Number(et[0]), Number(et[1])),
                rdates: dates.map((date) => {
                    date.setHours(Number(st[0]))
                    return date.toISOString()
                }),
                duration: timeDifference(startTime, endTime),
            }

            console.log({
                description: ts.description,
                course_id: 0,
                visible: true,
                flexible: ts.flexible,
                rdates: dates.map((date) => {
                    date.setHours(Number(st[0]))
                    return date.toISOString()
                }),
                startTime: ts.dtstart?.toISOString(),
                endTime: ts.dtend?.toISOString(),
                duration: timeDifference(startTime, endTime),
            });

            await props.onAdd(ts);
            setOpen(false);
            reset();
            return;
        }

        if (flexible) {
            if (!description) {
                toast.error("Please provide a description");
                return
            }

            const ts: TimeSlot = {
                flexible: true,
                description: description,
            }

            console.log({
                description: ts.description,
                course_id: 0,
                visible: true,
                flexible: ts.flexible
            });

            // props.setTimeSlots([...props.timeSlots, ts]);
            await props.onAdd(ts);
        } else if (repeat) {
            if (!description || !seatsAvailable || activeDays.length === 0 || !startTime || !endTime) {
                toast.error("Please fill in all fields!");
                return;
            }

            const rrule = generateRRule();
            console.log(rrule.toString())

            const ts: TimeSlot = {
                description: description,
                spots: seatsAvailable,
                rrule: rrule,
                dtstart: rrule.options.dtstart,
                dtend: rrule.options.until!,
                flexible: false,
                duration: timeDifference(startTime, endTime),
            }

            console.log({
                description: ts.description,
                spots: ts.spots,
                dtstart: ts.dtstart?.toISOString(),
                dtend: ts.dtend?.toISOString(),
                rrule_string: ts.rrule ? ts.rrule.toLocaleString() : null,
                exdates: [],
                course_id: 0,
                visible: true,
                duration: timeDifference(startTime, endTime),
            });

            // props.setTimeSlots([...props.timeSlots, ts]);
            await props.onAdd(ts);
        } else {
            if (!description || !seatsAvailable || !startTime || !endTime) {
                toast.error("Please fill in all fields!");
                return;
            }

            const st = startTime.split(' ')[0].split(':');

            if (startTime.split(' ')[1].trim() === "PM") {
                st[0] = (parseInt(st[0]) + 12).toString();
            }

            const et = endTime.split(' ')[0].split(':');
            if (endTime.split(' ')[1].trim() === "PM") {
                et[0] = (parseInt(et[0]) + 12).toString();
            }

            // console.log(new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(st[0]), Number(st[1])))
            // console.log(new Date(end.getFullYear(), end.getMonth(), end.getDate(), Number(et[0]), Number(et[1])))
            let nextDay = 0;
            if (startTime.endsWith("PM") && endTime.endsWith("AM")) {
                nextDay = 1;
            }

            const ts: TimeSlot = {
                description: description,
                spots: seatsAvailable,
                dtstart: new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(st[0]), Number(st[1])),
                dtend: new Date(start.getFullYear(), start.getMonth(), start.getDate() + nextDay, Number(et[0]), Number(et[1])),
                flexible: false,
                duration: timeDifference(startTime, endTime),
            }

            console.log({
                description: ts.description,
                spots: ts.spots,
                dtstart: ts.dtstart?.toISOString(),
                dtend: ts.dtend?.toISOString(),
                rrule_string: ts.rrule ? ts.rrule.toLocaleString() : null,
                exdates: [],
                course_id: 0,
                visible: true,
                flexible: ts.flexible,
                duration: timeDifference(startTime, endTime),
            })

            // props.setTimeSlots([...props.timeSlots, ts]);
            await props.onAdd(ts);
        }
        setOpen(false)
        reset();
    }

    function generateRRule(): RRule {
        console.log("hello");

        const st = startTime.split(' ')[0].split(':');

        if (startTime.split(' ')[1].trim() === "PM") {
            st[0] = (parseInt(st[0]) + 12).toString();
        }

        const et = endTime.split(' ')[0].split(':');
        if (endTime.split(' ')[1].trim() === "PM") {
            et[0] = (parseInt(et[0]) + 12).toString();
        }

        console.log(new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(st[0]), Number(st[1])).toISOString())
        console.log(new Date(end.getFullYear(), end.getMonth(), end.getDate(), Number(et[0]), Number(et[1])).toISOString())

        if (ends === "never") {
            const rrule = new RRule({
                freq: freqMap[freq],
                interval: freqCount,
                byweekday: activeDays.map((day) => dayMap[day]),
                dtstart: new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(st[0]), Number(st[1])),
                until: new Date(end.getFullYear() + 100, end.getMonth(), end.getDate(), Number(et[0]), Number(et[1]))
            });

            return rrule;
        }

        const rrule = new RRule({
            freq: freqMap[freq],
            interval: freqCount,
            byweekday: activeDays.map((day) => dayMap[day]),
            dtstart: new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(st[0]), Number(st[1])),
            until: new Date(end.getFullYear(), end.getMonth(), end.getDate(), Number(et[0]), Number(et[1]))
        });

        return rrule;
    }

    function handleTimeBlur(e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) {
        const raw = e.target.value;
        const formatted = formatTime(raw);

        if (formatted === "def") {
            toast.error("Invalid time format");
            setter("");
        } else {
            setter(formatted);
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>{props.children}</Dialog.Trigger>
            <Dialog.Content maxWidth="550px" minHeight={"400px"}>
                <Dialog.Title className="mb-6">
                    <div className="flex flex-row items-center justify-between">
                        <Text size={"7"}>Add Section</Text>
                        <IconButton variant="ghost" radius="full" onClick={() => {
                            reset();
                            setOpen(false)
                        }}>
                            <TrashIcon width={28} height={28} />
                        </IconButton>
                    </div>
                </Dialog.Title>
                <Dialog.Description />

                <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                        <TextIcon height={18} width={18} className='flex-shrink-0 mr-2' />
                        <Input placeholder='Section Description' className='focus-visible:ring-offset-0 focus-visible:ring-0 px-4'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                    </div>
                    {!flexible ?
                        <>
                            <div className='flex items-center gap-2 mt-4'>
                                <UsersRoundIcon height={18} width={18} className='flex-shrink-0 mr-2' />
                                <Input type='number' placeholder={'Seats Available'} min={1} className='focus-visible:ring-offset-0 focus-visible:ring-0 px-4'
                                    value={seatsAvailable || ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        if (e.target.value) {
                                            setSeatsAvailable(Number(e.target.value))
                                        } else {
                                            setSeatsAvailable(undefined)
                                        }
                                    }}
                                />
                            </div>
                            <div className='flex gap-2 items-center mt-4'>
                                <Clock height={18} width={18} className='mr-2 flex-shrink-0' />
                                <Input placeholder="Start Time" className='focus-visible:ring-offset-0 focus-visible:ring-0 px-4' value={startTime} onChange={(e) => setStartTime(e.target.value)} onBlur={(e) => handleTimeBlur(e, setStartTime)} />
                                <ArrowRight height={14} width={14} className='flex-shrink-0' />
                                <Input placeholder="End Time" className='focus-visible:ring-offset-0 focus-visible:ring-0 px-4' value={endTime} onChange={(e) => setEndTime(e.target.value)} onBlur={(e) => handleTimeBlur(e, setEndTime)} />
                            </div>
                            <div className='flex gap-2 items-center mt-4'>
                                <CalendarDaysIcon height={18} width={18} className='flex-shrink-0 mr-2' />
                                {multi ?
                                    (
                                        <MultiDatePicker dates={dates} setDates={setDates} />
                                    ) :
                                    (
                                        <DatePicker date={start} setDate={setStart} />
                                    )}
                            </div>
                        </>
                        : null}
                    <div className='flex gap-2 items-center h-10 justify-between mt-4'>
                        <div className='flex items-center'>
                            <WaypointsIcon height={18} width={18} className='flex-shrink-0 mr-4' />
                            <HoverCard>
                                <HoverCardTrigger>
                                    <p className='select-none cursor-pointer hover:underline underline-offset-4'>
                                        Flexible?
                                    </p>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    Schedule time with student
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                        <Switch checked={flexible} onClick={() => setFlexible(!flexible)} size={"3"} disabled={repeat || multi} />
                    </div>
                    <div className='flex gap-2 items-center h-10 justify-between mt-4'>
                        <div className='flex items-center'>
                            <CalendarDaysIcon height={18} width={18} className='flex-shrink-0 mr-4' />
                            <p className='select-none'>Multi-Select</p>
                        </div>
                        <Switch checked={multi} onClick={() => setMulti(!multi)} size={"3"} disabled={flexible || repeat} />
                    </div>
                    <div className='flex gap-2 items-center h-10 justify-between mt-4'>
                        <div className='flex items-center'>
                            <Repeat height={18} width={18} className='flex-shrink-0 mr-4' />
                            <p className='select-none'>Repeat?</p>
                        </div>
                        <Switch checked={repeat} onClick={() => setRepeat(!repeat)} size={"3"} disabled={flexible || multi} />
                    </div>
                    {repeat && <RepeatComponent end={end} setEnd={setEnd} activeDays={activeDays} setActiveDays={setActiveDays}
                        freq={freq} setFreq={setFreq} ends={ends} setEnds={setEnds} freqCount={freqCount} setFreqCount={setFreqCount}
                        handleSubmit={handleSubmit}

                    />}
                    <div className='flex items-center justify-end gap-2 mt-8'>
                        <Button variant='soft' onClick={() => {
                            reset();
                            setOpen(false);
                        }}>Cancel</Button>
                        <Button onClick={handleSubmit}>Done</Button>
                    </div>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    )
}

export default TimeSlotPopup

type RepeatComponentProps = {
    end: Date;
    setEnd: React.Dispatch<React.SetStateAction<Date>>;
    activeDays: string[];
    setActiveDays: React.Dispatch<React.SetStateAction<string[]>>;
    freq: string;
    setFreq: React.Dispatch<React.SetStateAction<'week' | 'month' | 'year'>>;
    ends: string;
    setEnds: React.Dispatch<React.SetStateAction<string>>;
    freqCount: number;
    setFreqCount: React.Dispatch<React.SetStateAction<number>>;
    handleSubmit: () => void;
}
function RepeatComponent({ end, setEnd, activeDays, setActiveDays, freq, setFreq, ends, setEnds, freqCount, setFreqCount, handleSubmit }: RepeatComponentProps) {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    function handleClick(day: string) {
        if (activeDays.includes(day)) {
            setActiveDays(activeDays.filter((d) => d !== day));
        } else {
            setActiveDays([...activeDays, day]);
        }
    }

    return (
        <div className='flex flex-col ml-8'>
            <div className='flex flex-row items-center gap-2 mt-2 justify-between h-12'>
                <Text className='h-10 flex items-center justify-start'>Every</Text>
                <div className='flex gap-2'>
                    <Input type='number' min={1} value={freqCount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreqCount(Number(e.target.value))} className='focus-visible:ring-offset-0 focus-visible:ring-0 px-4 w-20' />
                    <select name="freq" id="freq" className='h-10 border border-slate-200 rounded-md px-2' onChange={(e) => setFreq(e.target.value as 'week' | 'month' | 'year')}>
                        <option value="week">week</option>
                        <option value="month">month</option>
                        <option value="year">year</option>
                    </select>
                </div>
            </div>
            <div className='flex flex-row items-center gap-2 mt-2 justify-between h-12'>
                <Text>On</Text>
                <div className='flex flex-row gap-2 items-center'>
                    {days.map((day) => (
                        <div key={day} onClick={() => handleClick(day)} className={`select-none rounded-full flex items-center justify-center border border-gray-300 w-8 h-8 cursor-pointer text-sm ${activeDays.includes(day) ? 'bg-accent-foreground text-white' : ''}`}>{day}</div>
                    ))}
                </div>
            </div>
            <div className='flex flex-col items-start w-full'>
                <Text className='h-8 mt-2 flex items-center justify-start'>Ends</Text>
                <div className='flex flex-col mt-2 gap-2 w-full'>
                    <div className='h-10 items-center flex'>
                        <Text as="label" size="2">
                            <Radio checked={ends === "never"} value='never' onClick={() => setEnds("never")} className='mr-4' />
                            never
                        </Text>
                    </div>
                    <div className='flex items-center justify-between'>
                        <Text as="label" size="2" className='mr-12'>
                            <Radio checked={ends === "on"} value='on' onClick={() => setEnds("on")} className='mr-4' />
                            on
                        </Text>
                        <DatePicker disabled={ends !== "on"} date={end} setDate={setEnd} />
                    </div>
                </div>
            </div>
        </div>
    )
}