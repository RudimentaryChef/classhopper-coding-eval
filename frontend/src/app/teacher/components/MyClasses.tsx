import axios from "axios"
import { RedirectToSignIn, SignedOut, useUser } from "@clerk/nextjs"
import { PlusIcon } from "lucide-react"
import { Heading, IconButton, Separator, Text, Spinner, Button } from "@radix-ui/themes"
import { useCallback, useEffect, useState } from "react"
import TeacherClassCard from "./TeacherClassCard"
import { CourseDetails } from "@/app/types"
import { CircleAlert, PencilIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type MyClassesProps = {
    selected: string,
    setSelected: React.Dispatch<React.SetStateAction<string>>
}
export default function MyClasses({ selected, setSelected }: MyClassesProps) {
    const { user } = useUser()
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchClasses() {
            setLoading(true)
            const instructorResponse: any = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
                user_id: user?.id
            })

            if (instructorResponse.data.length === 0) {
                setLoading(false)
                return
            }

            const t_id = instructorResponse.data[0].id
            const coursesResponse = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/filter`, {
                instructor_id: t_id
            })

            setClasses(coursesResponse.data)
            setLoading(false)
        }
        if (user) fetchClasses()
    }, [user])

    return (
        <>
            <div className='h-screen-minus-nav max-w-[1024px] p-6 flex-grow'>
                <div className='flex items-center justify-between'>
                    <Heading as='h1' size={'7'} className='ml-2'>My Classes</Heading>
                    <IconButton className='mr-4' radius='full' variant='classic' onClick={() => setSelected('Classes Create')}>
                        <PlusIcon width={24} height={24} />
                    </IconButton>
                </div>
                <Separator size={"4"} className='my-3' />

                <DisplayClasses classes={classes} loading={loading} setSelected={setSelected} />
            </div>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    )
}

function DisplayClasses({ classes, loading, setSelected }: { classes: CourseDetails[], loading: boolean, setSelected: React.Dispatch<React.SetStateAction<string>> }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    )


    if (loading) return <ClassesLoading />
    if (classes.length === 0) return <NoClassesFound setSelected={setSelected} />
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {classes.map((cls, i) => {
                return <div className="relative" key={i}>
                    <TeacherClassCard classInfo={cls} />
                    <IconButton radius='full' variant='solid' className='absolute top-2 right-2 w-8 h-8 bg-white shadow-xl cursor-pointer hover:bg-muted' onClick={(e) => {
                        e.stopPropagation();
                        router.push(`${pathname}?${createQueryString('class_id', String(cls.course_ID))}`)
                        setSelected('Classes Create')
                    }}>
                        <PencilIcon width={16} height={16} color="black" />
                    </IconButton>
                </div>
            })}
        </div>
    )

}

function ClassesLoading() {
    return (
        <div className='h-80 w-full rounded-md flex items-center justify-center'>
            <Spinner loading size={"3"} />
        </div>
    )
}

function NoClassesFound({ setSelected }: { setSelected: React.Dispatch<React.SetStateAction<string>> }) {
    return (
        <div className='flex flex-col items-center justify-center h-80 border rounded-md bg-muted p-4'>
            <CircleAlert size={75} className='text-gray-500 mb-4' />
            <div className="flex gap-2 items-center mb-2">
                <Heading as='h2' size={'5'}>No Classes Found.</Heading>
            </div>
            <Text size={"3"} color="gray" align={"center"} className="mb-8">Share your wisdom, inspire your community. Join us in building a world where anyone can teach and grow.</Text>
            <Button radius="full" size={"3"} className="w-56 px-6" onClick={() => setSelected('Classes Create')}>
                <div className="flex items-center justify-between w-full">
                    <Text size={"3"}>Create New Class</Text>
                    <PlusIcon width={24} height={24} />
                </div>
            </Button>

        </div>
    )
}

