'use server'
import { Separator } from '@radix-ui/themes';
import axios from 'axios';
import { auth } from '@clerk/nextjs/server';
import UploadProfilePic from './UploadProfilePic';
import { UserInstructor } from '@/app/types';
import TeacherDetails from './TeacherDetails';
import { createTeacher } from '@/app/utils/actions';

export default async function TeacherProfile() {
    const { userId } = await auth()

    const teacher = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
        user_id: userId
    })

    console.log(teacher.data)

    let t;
    if (teacher.data.length === 0) {
        t = await createTeacher();
    } else {
        t = teacher.data[0].id;
    }

    console.log(t)
    const details = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/instructor_and_user/${t}`)
    const user: UserInstructor = details.data as UserInstructor

    return (
        <div className='flex-1 lg:max-w-[1024px] px-8 overflow-y-scroll'>
            <div className='flex flex-col mt-8'>
                <h3 className='text-lg font-medium'>Profile</h3>
                <p className='text-sm text-muted-foreground'>
                    Update your profile information.
                </p>
            </div>
            <Separator size={"4"} className='my-8' />
            <UploadProfilePic pfpLink={user.instructor.pfp_link} teacherId={t} />
            <TeacherDetails userIntructor={user} />
        </div>
    )
}