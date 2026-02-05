"use client"
import { createStripeAccountLink } from '@/app/utils/stripeactions'
import { Button } from '@radix-ui/themes'
import { LinkIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

const ConnectButton = () => {
    const [loading, setLoading] = React.useState<boolean>(false)

    async function stripeConnect() {
        try {
            setLoading(true);
            await createStripeAccountLink();
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            toast.error("Oops! Something went wrong. Are you logged in?")
        }
    }

    return (
        <Button size={"3"} className='flex items-center justify-start' onClick={stripeConnect} loading={loading} disabled={loading}>
            <LinkIcon height={16} width={16} />
            Connect Stripe
        </Button>
    )
}

export default ConnectButton