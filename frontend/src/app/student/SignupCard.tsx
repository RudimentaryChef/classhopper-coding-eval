"use client"
import { StarFilledIcon } from '@radix-ui/react-icons'
import { Badge, Button, Heading, Separator, Text } from '@radix-ui/themes'
import axios from 'axios'
import { Clock, GlobeIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { toast } from 'sonner'

type Props = {
    course_id: string
    startTime: string
    endTime: string
}
const SignupCard = ({ course_id, startTime, endTime }: Props) => {
    const [classInfo, setClassInfo] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        async function fetchClass() {
            setLoading(true);
            try {
                const c = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/${course_id}`)
                setClassInfo(c.data);
            } catch (error) {
                console.error("Error fetching class details:", error);
                toast.error("Failed to fetch class details. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        fetchClass();
    }, [])

    if (loading) {
        return (
            <div className="h-80 min-w-[384px] max-w-[384px] flex flex-col overflow-hidden items-start border-2 border-gray-200 rounded-md animate-pulse">
                {/* Image placeholder */}
                <div className="w-full h-[50%] bg-slate-200"></div>

                {/* Content placeholder */}
                <div className="px-4 py-2 w-full flex flex-col justify-between h-[50%]">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center w-full">
                            {/* Title placeholder */}
                            <div className="h-7 bg-slate-200 rounded w-3/4"></div>
                            {/* Price placeholder */}
                            <div className="h-7 bg-slate-200 rounded w-1/6"></div>
                        </div>
                        <div className="my-2 w-full h-px bg-slate-200"></div>
                        <div className='flex flex-col justify-between h-full'>
                            {/* Time placeholder */}
                            <div className="mt-2 h-5 bg-slate-200 rounded w-4/5"></div>
                            {/* Button placeholder */}
                            <div className="w-full h-9 bg-slate-200 rounded mt-auto mb-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`h-80 min-w-[384px] max-w-[384px] flex flex-col overflow-hidden items-start border-2 border-gray-300 rounded-md hover:border-blue-500 hover:shadow-lg relative`}
        >
            {classInfo.online && (
                <div className="absolute top-2 left-2 z-[2] rounded-xl">
                    <Badge className="bg-blue-500 text-white shadow-md flex items-center gap-1 px-2 py-1">
                        <GlobeIcon width={14} height={14} />
                        <Text size="1" weight="bold">Online</Text>
                    </Badge>
                </div>
            )}
            <div className="w-full h-[50%] bg-slate-300 overflow-hidden">
                <Image
                    alt="class image"
                    src={`https://storage.googleapis.com/imagestorageclasshopper/${classInfo.image_1_Link}`}
                    width={"500"}
                    height={"160"}
                    priority
                />
            </div>
            <div className="px-4 py-2 w-full flex flex-col justify-between h-[50%]">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center w-full">
                        <Heading
                            as="h2"
                            size={"6"}
                            weight={"bold"}
                            className="line-clamp-1"
                        >
                            {classInfo.course_Name || "Lorem ipsum"}
                        </Heading>
                        <div className="flex justify-center items-center">
                            <Text
                                size={"5"}
                                weight={"bold"}
                                color="gray"
                                className="mr-1"
                            >
                                {/* Bug 15: Wrong field name - backend returns "course_Price" but reading "coursePrice" (camelCase vs snake_case) */}
                                {"$" + classInfo.coursePrice}
                            </Text>
                            {/* <StarFilledIcon width={18} height={18} /> */}
                        </div>
                    </div>
                    <Separator className="my-2 w-full" />
                    <div className='flex flex-col justify-between h-full'>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                                {new Date(startTime).toLocaleString([], {
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })} - {new Date(endTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </span>
                        </div>
                        <Link href={`/explore/v2/${course_id}`}>
                            <Button className='w-full mb-2 cursor-pointer'>See Class Details</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupCard