"use client"
import { createStripeDashboardLink } from '@/app/utils/stripeactions'
import { Button } from '@radix-ui/themes'
import { LineChartIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

const DashboardButton = () => {

    const [loading, setLoading] = React.useState<boolean>(false)

    async function stripeDashboard() {
        try {
            setLoading(true);
            await createStripeDashboardLink();
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            toast.error("Oops! Something went wrong. Are you logged in?")
        }
    }

    return (
        <Button size={"3"} className='flex items-center justify-start' onClick={stripeDashboard} loading={loading} disabled={loading}>
            <LineChartIcon height={16} width={16} />
            View Dashboard
        </Button>
    )
}

export default DashboardButton