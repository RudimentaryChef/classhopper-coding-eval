import axios from "axios"
import { RedirectToSignIn, SignedOut, useUser } from "@clerk/nextjs"
import { PlusIcon } from "lucide-react"
import { Heading, IconButton, Separator, Text, Spinner, Button } from "@radix-ui/themes"
import { useCallback, useEffect, useState } from "react"
import TeacherClassCard from "@/app/teacher/components/TeacherClassCard"
import { CourseDetails } from "@/app/types"
import { CircleAlert, PencilIcon } from "lucide-react"
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

export default async function MyClasses() {
    const { userId } = await auth()
    let classes: CourseDetails[] = [];

    const instructorResponse: any = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
        user_id: userId
    })

    if (instructorResponse.data.length > 0) {
        const t_id = instructorResponse.data[0].id
        const coursesResponse = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/filter`, {
            instructor_id: t_id
        })

        classes = coursesResponse.data as CourseDetails[]
    }


    return (
        <>
            <div className='h-screen-minus-nav max-w-[1024px] p-6 flex-grow'>
                <div className='flex items-center justify-between'>
                    <Heading as='h1' size={'7'} className='ml-2'>My Classes</Heading>
                    <Link href={'/instructor/classes/create'}>
                        <IconButton className='mr-4' radius='full' variant='classic'>
                            <PlusIcon width={24} height={24} />
                        </IconButton>
                    </Link>
                </div>
                <Separator size={"4"} className='my-3' />

                {classes.length > 0 ? <DisplayClasses classes={classes} /> : <NoClassesFound />}
            </div>
        </>
    )
}

async function DisplayClasses({ classes }: { classes: CourseDetails[] }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {classes.map((cls, i) => {
                return <div className="relative" key={i}>
                    <TeacherClassCard classInfo={cls} />
                    <Link
                        href={{
                            pathname: '/instructor/classes/edit',
                            query: { id: cls.course_ID }
                        }}
                        prefetch={false}
                    >
                        <IconButton radius='full' variant='solid' className='absolute top-2 right-2 w-8 h-8 bg-white shadow-xl cursor-pointer hover:bg-muted hover:scale-110 transition-transform duration-300'>
                            <PencilIcon width={16} height={16} color="black" />
                        </IconButton>
                    </Link>
                </div>
            })}
        </div>
    )

}

async function ClassesLoading() {
    return (
        <div className='h-80 w-full rounded-md flex items-center justify-center'>
            <Spinner loading size={"3"} />
        </div>
    )
}

async function NoClassesFound() {
    return (
        <div className='flex flex-col items-center justify-center h-80 border rounded-md bg-muted p-4'>
            <CircleAlert size={75} className='text-gray-500 mb-4' />
            <div className="flex gap-2 items-center mb-2">
                <Heading as='h2' size={'5'}>No Classes Found.</Heading>
            </div>
            <Text size={"3"} color="gray" align={"center"} className="mb-8">Share your wisdom, inspire your community. Join us in building a world where anyone can teach and grow.</Text>
            <Link href={{
                pathname: '/instructor/classes/create',
                query: {}
            }}>
                <Button radius="full" size={"3"} className="w-56 px-6">
                    <div className="flex items-center justify-between w-full">
                        <Text size={"3"}>Create New Class</Text>
                        <PlusIcon width={24} height={24} />
                    </div>
                </Button>
            </Link>
        </div>
    )
}

