import { stripe } from "@/lib/utils";
import axios from "axios";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    console.log("hello stripe webhook");

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err: unknown) {
        console.error('Error verifying Stripe webhook signature:', err);
        return new Response('Webhook signature verification failed', { status: 400 });
    }

    switch (event.type) {
        case 'account.updated':
            const account = event.data.object;

            const instructor = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
                stripeConnectedId: account.id
            });

            await axios.put(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/update?instructor_id=${instructor.data[0].id}`, {
                stripeConnectedLinked: account.capabilities?.transfers === 'pending' || account.capabilities?.transfers === 'inactive' ? false : true
            });

            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    return new Response(null, { status: 200 });
}