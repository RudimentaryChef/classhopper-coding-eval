"use server"
import { ClassTime, CourseDetails } from '@/app/types'
import { formatImgLink } from '@/app/utils/functions'
import { stripe } from '@/lib/utils'
import axios from 'axios'
import { Check, ChevronRight, Clock, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Stripe from 'stripe'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};


const page = async ({ searchParams }: Props) => {
    const session_id = (await searchParams).session_id;

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(
        session_id,
    )

    if (session.payment_status === 'paid') {
        return <div>Payment not successful</div>
    }

    const times: ClassTime[] = []
    for (const key in session.metadata) {
        const time = JSON.parse(session.metadata[key] as string) as ClassTime
        times.push(time)
    }

    console.log(times)

    const totalClasses = times.reduce((sum, classTime) =>
        sum + (classTime.quantity || 1), 0
    );

    const c_id = times[0].course_id;
    const course = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/${c_id}`);
    const courseInfo = course.data as CourseDetails;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-green-50 border-b border-green-100">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Check className="h-8 w-8 text-green-600 flex-shrink-0" />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-800">Payment Successful</h1>
                            <p className="text-gray-600">Thank you for your purchase!</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Purchase Summary</h2>
                    <p className="text-gray-600 mb-6">You&apos;ve purchased {totalClasses} class sessions{totalClasses === 1 ? '' : 's'}.</p>

                    <div className="space-y-4">
                        {times.map((classItem) => (
                            <div key={classItem.id} className="flex border rounded-lg overflow-hidden">
                                <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                                    {/* Replace {PHOTO} with actual image component in real implementation */}
                                    <img src={formatImgLink(courseInfo.image_1_Link)} alt={classItem.description} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 p-4">

                                    <div className='flex justify-between items-center'>
                                        <h3 className="font-semibold text-gray-800">{classItem.description}</h3>
                                        {(classItem.quantity && classItem.quantity > 1) && (
                                            <div className=" text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full inline-block">
                                                {classItem.quantity}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-600">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>
                                            {new Date(classItem.startTime).toLocaleString([], {
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} - {new Date(classItem.endTime).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </span>
                                    </div>
                                    {classItem.flexible && (
                                        <div className="mt-1 text-sm text-blue-600">Flexible scheduling available</div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <Link href={"/"}>
                            <button
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                                <Home className="h-5 w-5 mr-2" />
                                <span>Continue to Home</span>
                                <ChevronRight className="h-5 w-5 ml-2" />
                            </button>
                        </Link>
                        <p className="text-center text-gray-500 text-sm mt-4">You&apos;ll be redirected to the home page in a few seconds...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page