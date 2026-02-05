"use server"

import { stripe } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"
import axios from "axios"
import { redirect } from "next/navigation"
import { createTeacher, getTeacher, getUser } from "./actions"
import { toast } from "sonner"
import { formatImgLink } from "./functions"
import { ClassTime } from "../types"
import Stripe from "stripe"

export async function createStripeAccount() {

    const user = await getUser();

    if (!user) {
        throw new Error("User not authenticated")
    }

    try {
        const account: Stripe.Account = await stripe.accounts.create({
            controller: {
                stripe_dashboard: {
                    type: "express",
                },
                fees: {
                    payer: "application"
                },
                losses: {
                    payments: "application"
                },
            },
            capabilities: {
                transfers: { requested: true }
            },
            country: "US",
            email: user.email || null,
        })

        return {
            account_id: account.id,
            success: true
        }
    } catch (err: any) {
        console.error('An error occurred when calling the Stripe API to create an account:', err);
        return {
            error: err.message,
            success: false
        }
    }
}

export async function createStripeAccountLink() {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("User not authenticated")
    }

    let instructor;
    const res = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
        user_id: userId
    })

    instructor = res.data[0]
    if (instructor.length === 0) {
        const instructor_id = await createTeacher()
        if (instructor_id === -1) {
            toast.error("Error creating instructor")
            throw new Error("Error creating instructor")
        }
        instructor = {
            id: instructor_id
        }
    } else {
        instructor = instructor[0]
    }

    if (!instructor.stripeConnectedId) {
        const account = await createStripeAccount()
        if (!account.success) {
            throw new Error(account.error)
        }

        instructor.stripeConnectedId = account.account_id
        const res = await axios.put(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/update?instructor_id=${instructor.id}`, {
            stripeConnectedId: account.account_id
        })
    }

    const accountLink = await stripe.accountLinks.create({
        account: instructor.stripeConnectedId,
        refresh_url: `${process.env.FRONTEND_URL}/stripe/refresh/${instructor.stripeConnectedId}`,
        return_url: `${process.env.FRONTEND_URL}/stripe/return/${instructor.stripeConnectedId}`,
        type: "account_onboarding",
    })

    return redirect(accountLink.url)
}

export async function buyClass(class_id: string, cart: ClassTime[]) {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/${class_id}`);

    if (!res.data.instructor.stripeConnectedId || res.data.instructor.stripeConnectedId === "platform") {
        return buyClassToPlatform(class_id, cart);
    } else {
        return buyClassToInstructor(class_id, cart);
    }
}

export async function buyClassToPlatform(class_id: string, cart: ClassTime[]) {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/${class_id}`);

    const lineItems = cart.map((time) => {
        const start = new Date(time.startTime);

        const t = start.toLocaleString([], {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            price_data: {
                currency: "usd",
                unit_amount: Math.round(Number(res.data.course_Price) * 100) * 100,
                product_data: {
                    name: res.data.course_Name,
                    description: t,
                    images: [formatImgLink(res.data.image_1_Link)]
                },
            },
            quantity: time.quantity || 1,
        }
    })

    const stripeSessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        line_items: lineItems,
        metadata: cart.reduce((acc, time, index) => {
            acc[`time_${index + 1}`] = JSON.stringify(time);
            return acc;
        }, {} as { [key: string]: string }),
        payment_intent_data: {
            application_fee_amount: Math.round(Number(res.data.course_Price) * 100),
            transfer_data: {
                destination: 'acct_1R5XZfI5ILHo16Ia',
            }
        },
        success_url: `${process.env.FRONTEND_URL}/stripe/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/stripe/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
        expires_at: Math.floor(Date.now() / 1000) + (3600), // 1 hour from now
    }

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create(stripeSessionParams);

    return redirect(session.url!);
}

export async function buyClassToInstructor(class_id: string, cart: ClassTime[]) {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/courses/${class_id}`);

    const lineItems = cart.map((time) => {
        const start = new Date(time.startTime);

        const t = start.toLocaleString([], {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            price_data: {
                currency: "usd",
                unit_amount: Math.round(Number(res.data.course_Price)) * 100,
                product_data: {
                    name: res.data.course_Name,
                    description: t,
                    images: [formatImgLink(res.data.image_1_Link)]
                },
            },
            quantity: time.quantity || 1,
        }
    })

    const stripeSessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        line_items: lineItems,
        metadata: cart.reduce((acc, time, index) => {
            acc[`time_${index}`] = JSON.stringify(time);
            return acc;
        }, {} as { [key: string]: string }),
        payment_intent_data: {
            application_fee_amount: Math.round(Number(res.data.course_Price) * 100) * 0.1,
            transfer_data: {
                destination: res.data.instructor.stripeConnectedId,
            }
        },
        success_url: `${process.env.FRONTEND_URL}/stripe/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/stripe/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
        expires_at: Math.floor(Date.now() / 1000) + (3600), // 1 hour from now
    }

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create(stripeSessionParams);

    return redirect(session.url!);
}

export async function signupTimeSlot(time: ClassTime[]) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("User not authenticated")
    }

    const signupBatch: any[] = time.map((t) => {
        return {
            user_id: userId,
            course_id: t.course_id,
            time_slot_id: t.id,
            startTime: t.startTime,
            endTime: t.endTime,
            transaction_id: "pending",
            quantity: t.quantity || 1
        }
    })

    try {
        // console.log(signupBatch)
        const signup = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/signups/batch_create`,
            signupBatch
        );

        return {
            success: true
        }
    } catch (err: any) {
        // console.error(err.response)
        // toast.error("Error creating signup")
        console.log("failed")
        console.log(JSON.stringify(err.data))
        return {
            success: false
        }
    }
}

export async function createStripeDashboardLink() {
    const user = await getTeacher();

    if (!user) {
        throw new Error("User not authenticated")
    }

    const loginLink = await stripe.accounts.createLoginLink(
        user.instructor.stripeConnectedId,
    )

    return redirect(loginLink.url);
}