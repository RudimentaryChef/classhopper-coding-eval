"use server"
import React from 'react'
import Navbar from '../components/Navbar'
import { Text, Heading, Separator, IconButton, Button } from '@radix-ui/themes';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import SignupCard from './SignupCard';

type Props = {}
const page = async (props: Props) => {
    const { userId, redirectToSignIn } = await auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const signups = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/signup/filter`, {
        user_id: userId
    })

    return (
        <>
            <Navbar scrollable fixed={false} />
            <div className='h-screen-minus-nav py-16 pl-16'>
                <div className=''>
                    <Heading as='h2' size={"8"}>Upcoming Classes</Heading>
                    {signups.data.length > 0 ? (

                        <div className='flex gap-2 h-80 mt-4 overflow-x-scroll no-scrollbar'>
                            {signups.data.map((signup: any, i: number) => {
                                return <SignupCard key={i} course_id={signup.course_id} startTime={signup.startTime} endTime={signup.endTime} />
                            })}
                        </div>
                    ) : (
                        <div className="h-80 w-full bg-muted flex items-center justify-center mt-4 rounded-md">
                            <Text size='2'>You have no upcoming classes.</Text>
                        </div>
                    )}
                </div>
            </div>
            {/* <div className=''>
                    <Heading as='h2' size={"8"}>Saved Classes</Heading>
                    <div className='flex gap-2 h-80 mt-4 overflow-x-scroll no-scrollbar'>
                        {Array.from({ length: 7 }).map((_, i) => <DummyClassCard key={i} />)}
                    </div>
                </div> */}
        </>
    )
}

export default page

function DummyClassCard() {
    return (
        <div className='h-60 w-96 bg-gray-500 rounded-md flex-shrink-0 last:mr-16'></div>
    )
}