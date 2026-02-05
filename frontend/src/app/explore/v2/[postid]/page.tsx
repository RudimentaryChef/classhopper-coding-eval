"use server"
import Navbar from '@/app/components/Navbar'
import SharePopup from '@/app/components/SharePopup'
import Image from 'next/image'
import { ClassTime, CourseDetails } from '@/app/types'
import { auth, currentUser } from '@clerk/nextjs/server'
import { HeartIcon, Share2Icon } from 'lucide-react'
import { Avatar, Button, Heading, Separator, Text } from '@radix-ui/themes'
import axios from 'axios'
import React from 'react'
import ClassDetails from '@/app/components/classdisplay/ClassDetails'
import TimeDisplay from '@/app/components/classdisplay/TimeDisplay'
import TeacherDetails from '@/app/components/classdisplay/TeacherDetails'
import MobileClassNavbar from '@/app/components/MobileClassNavbar'
import { rrulestr } from 'rrule'
import { convertToLocal, generateUpcomingClassDates, getMinutesDifference, getNextMonthDate } from '@/app/utils/functions'
import DisplayClassTimes from './DisplayTimeSlots'
import Link from 'next/link'

type Props = { params: Promise<{ postid: string }> }
const page = async ({ params }: Props) => {
    const { userId, redirectToSignIn } = await auth()
    const postid = (await params).postid
    const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/courses/` +
        postid
    );

    function parseCourseDetails(data: any) {
        data.section.map((section: any) => {
            if (!section.flexible) {
                section.dtstart = new Date(section.dtstart + "Z")
                section.dtend = new Date(section.dtend + "Z")
            }

            if (section.rrule_string) {
                section.rrule = rrulestr(section.rrule_string)
            }
        })

        return data
    }

    const courseInfo: CourseDetails = parseCourseDetails(response.data)
    // console.log(courseInfo);
    let dates = generateUpcomingClassDates(courseInfo.section)
    console.log(dates)

    return (
        <>
            <div className="hidden md:flex flex-col overflow-hidden">
                <Navbar scrollable={false} />
                {/* <DisplayClassTimes classTimes={dates as ClassTime[]} /> */}
                <div className={`flex items-center justify-center`}>
                    <div className="mt-8 flex w-[88rem] mx-auto px-8">
                        <div className="w-full flex flex-col justify-start items-center lg:w-[70%]">
                            <div className="w-full flex justify-between items-center">
                                <Heading as="h2" size={"6"}>
                                    {courseInfo.course_Name}
                                </Heading>
                                <div className="flex flex-row justify-center items-center gap-4">
                                    <SharePopup
                                        title={courseInfo.course_Name}
                                        img={courseInfo.image_1_Link}
                                    >
                                        <Button variant="soft" radius="full">
                                            <div className="flex flex-row justify-center items-center">
                                                <Share2Icon />
                                                <Text className="ml-2" size="3">
                                                    Share
                                                </Text>
                                            </div>
                                        </Button>
                                    </SharePopup>
                                    <Button variant="soft" radius="full">
                                        <div className="flex flex-row justify-center items-center">
                                            <HeartIcon />
                                            <Text className="ml-2" size="3">
                                                Save
                                            </Text>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                            <div className="max-h-[520px] w-full overflow-hidden rounded-lg mt-4">
                                <Image
                                    src={`https://storage.googleapis.com/imagestorageclasshopper/${courseInfo.image_2_Link}`}
                                    alt="class hero img"
                                    width={500}
                                    height={500}
                                    className="object-cover h-full w-full"
                                    priority
                                />
                            </div>
                            <div className="flex justify-start items-center py-6 w-full">
                                <Avatar
                                    size={"4"}
                                    fallback="A"
                                    // src="h"
                                    color="cyan"
                                    variant="solid"
                                    className="mr-4"
                                    radius="full"
                                />
                                <div className="flex flex-col">
                                    <Text weight={"bold"} size={"4"}>
                                        Taught By {courseInfo.instructor.name}
                                    </Text>
                                </div>
                            </div>
                            <Separator size={"4"} />
                            <Text className="mt-6 text-left w-full">
                                {courseInfo.description}
                            </Text>

                            <div className="flex flex-col lg:hidden">
                                <div className="w-full mt-8">
                                    <ClassDetails
                                        // availability={courseInfo.section}
                                        availability={[]}
                                        price={courseInfo.course_Price}
                                        courseName={courseInfo.course_Name}
                                        flexible={courseInfo.flexible}
                                    >
                                        {/* <DisplayClassTimes classTimes={dates.slice(3) as ClassTime[]} /> */}
                                        {/* <TimeDisplay
                                            instructor={courseInfo.instructor.name}
                                            flexible={courseInfo.flexible}
                                            class_id={courseInfo.course_ID}
                                            // meetingtimes={courseInfo.section}
                                            meetingtimes={[]}
                                            title={courseInfo.course_Name}
                                            img={courseInfo.image_1_Link}
                                        > */}
                                        <Link href={{
                                            pathname: `/timeselect`,
                                            query: {
                                                class_id: courseInfo.course_ID
                                            }
                                        }}>
                                            <Button className="w-full h-10 mt-4">
                                                <Text size={"3"}>Book Now</Text>
                                            </Button>
                                        </Link>
                                        {/* <Button className="w-full h-10 mt-4" onClick={() => buyClass(String(courseInfo.course_ID), 1)}>
                                            <Text size={"3"}>Book Now</Text>
                                        </Button> */}
                                        {/* </TimeDisplay> */}
                                    </ClassDetails>
                                </div>
                                <div className="w-full mt-8">
                                    <TeacherDetails instructorID={courseInfo.instructor.id} courseAddress={courseInfo.address} online={courseInfo.online} />
                                </div>
                            </div>
                        </div>
                        <div className="w-[30%] hidden flex-col items-start pl-8 lg:flex">
                            <div className="sticky top-[24px] w-full mt-12">
                                <ClassDetails
                                    // availability={courseInfo.section}
                                    availability={dates}
                                    price={courseInfo.course_Price}
                                    courseName={courseInfo.course_Name}
                                    flexible={courseInfo.flexible}
                                >
                                    {/* <TimeDisplay
                                        instructor={courseInfo.instructor.name}
                                        flexible={courseInfo.flexible}
                                        class_id={courseInfo.course_ID}
                                        // meetingtimes={courseInfo.section}
                                        meetingtimes={[]}
                                        title={courseInfo.course_Name}
                                        img={courseInfo.image_1_Link}
                                    >
                                        <Button className="w-full h-10 mt-4">
                                            <Text size={"3"}>Book Now</Text>
                                        </Button>
                                    </TimeDisplay> */}
                                    {/* <DisplayClassTimes classTimes={dates.slice(3) as ClassTime[]} /> */}
                                    <Link href={{
                                        pathname: `/timeselect`,
                                        query: {
                                            class_id: courseInfo.course_ID
                                        }
                                    }}>
                                        <Button className="w-full h-10 mt-4">
                                            <Text size={"3"}>Book Now</Text>
                                        </Button>
                                    </Link>

                                    {/* <BookButton
                                        course_ID={courseInfo.course_ID.toString()}
                                        quantity={1}
                                        destination={courseInfo.instructor.stripeConnectedId}
                                    /> */}
                                </ClassDetails>
                                <TeacherDetails instructorID={courseInfo.instructor.id} courseAddress={courseInfo.address} online={courseInfo.online} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:hidden pb-20">
                <MobileClassNavbar />
                <div className="max-h-[520px] w-full overflow-hidden">
                    <Image
                        src={`https://storage.googleapis.com/imagestorageclasshopper/${courseInfo.image_2_Link}`}
                        alt="class hero img"
                        width={500}
                        height={500}
                        className="object-cover h-full w-full"
                        priority
                    />
                </div>
                <div className="px-4">
                    <Heading
                        as="h2"
                        size={"6"}
                        className="my-6 font-semibold"
                    >
                        {courseInfo.course_Name}
                    </Heading>
                    <div className="flex justify-start items-center pb-4 w-full">
                        <Avatar
                            size={"3"}
                            fallback="A"
                            color="cyan"
                            variant="solid"
                            className="mr-4"
                            radius="full"
                        />
                        <div className="flex flex-col">
                            <Text weight={"bold"} size={"3"}>
                                Taught By {courseInfo.instructor.name}
                            </Text>
                        </div>
                    </div>
                    <Separator size={"4"} className="mb-4" />
                    <div className="my-4">
                        <Text className="my-4 text-left w-full">
                            {courseInfo.description}
                        </Text>
                    </div>
                    <TeacherDetails instructorID={courseInfo.instructor.id} courseAddress={courseInfo.address} online={courseInfo.online} />
                </div>

                <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg border-t border-gray-300 h-20">
                    <div className="w-full h-full flex justify-between items-center">
                        <Text
                            size={"5"}
                            weight={"bold"}
                        >
                            {`$${courseInfo.course_Price}/class`}
                        </Text>
                        <Link href={{
                            pathname: `/timeselect`,
                            query: {
                                class_id: courseInfo.course_ID
                            }
                        }}>
                            <Button className="w-full h-10 mt-4">
                                <Text size={"3"}>Book Now</Text>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );// 
};


export default page