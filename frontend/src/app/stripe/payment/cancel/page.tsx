"use server"
import { ClassTime, CourseDetails } from '@/app/types'
import { formatImgLink } from '@/app/utils/functions'
import { stripe } from '@/lib/utils'
import axios from 'axios'
import { AlertCircle, ChevronRight, Home, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Stripe from 'stripe'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const page = async ({ searchParams }: Props) => {
    const session_id = (await searchParams).session_id as string;
    let errorMessage = "Your payment could not be processed.";
    let times: ClassTime[] = [];
    let courseInfo: CourseDetails | null = null;

    try {
        const session: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(
            session_id,
        )

        // Get the payment intent to check for specific error messages
        if (session.payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(
                session.payment_intent as string
            );

            if (paymentIntent.last_payment_error) {
                errorMessage = paymentIntent.last_payment_error.message || errorMessage;
            }
        }

        // Retrieve cart items even if payment failed
        for (const key in session.metadata) {
            const time = JSON.parse(session.metadata[key] as string) as ClassTime
            times.push(time)
        }

        if (times.length > 0) {
            const c_id = times[0].course_id;
            const course = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/${c_id}`);
            courseInfo = course.data as CourseDetails;
        }
    } catch (error) {
        console.error("Error retrieving session:", error);
        errorMessage = "We couldn't retrieve your payment information. Please try again.";
    }

    const totalClasses = times.reduce((sum, classTime) =>
        sum + (classTime.quantity || 1), 0
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-red-50 border-b border-red-100">
                    <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full">
                            <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-800">Payment Unsuccessful</h1>
                            <p className="text-gray-600">{errorMessage}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Items in Your Cart</h2>
                    {times.length > 0 ? (
                        <>
                            <p className="text-gray-600 mb-6">Your cart contains {totalClasses} class session{totalClasses !== 1 ? 's' : ''}.</p>

                            <div className="space-y-4">
                                {times.map((classItem) => (
                                    <div key={classItem.id} className="flex border rounded-lg overflow-hidden">
                                        <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                                            {courseInfo && (
                                                <img
                                                    src={formatImgLink(courseInfo.image_1_Link)}
                                                    alt={classItem.description}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 p-4">
                                            <div className='flex justify-between items-center'>
                                                <h3 className="font-semibold text-gray-800">{classItem.description}</h3>
                                                {(classItem.quantity && classItem.quantity > 1) && (
                                                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full inline-block">
                                                        {classItem.quantity}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                {classItem.startTime && (
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
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-600 mb-6">We couldn&apos;t retrieve your cart information.</p>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                        <Link href={{
                            pathname: `/explore/v2/${courseInfo?.course_ID}`,
                        }}>
                            <button
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                                <RefreshCcw className="h-5 w-5 mr-2" />
                                <span>Try Payment Again</span>
                                <ChevronRight className="h-5 w-5 ml-2" />
                            </button>
                        </Link>

                        <Link href={"/"}>
                            <button
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center mt-2"
                            >
                                <Home className="h-5 w-5 mr-2" />
                                <span>Return to Home</span>
                            </button>
                        </Link>

                        <p className="text-center text-gray-500 text-sm mt-4">
                            If you continue to experience issues, please contact our support team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page