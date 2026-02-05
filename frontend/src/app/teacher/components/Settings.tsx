import { createStripeAccountLink, createStripeDashboardLink } from '@/app/utils/stripeactions';
import { Button, Separator } from '@radix-ui/themes'
import React, { useEffect } from 'react'
import { toast } from 'sonner';
import { LinkIcon, LineChartIcon } from 'lucide-react';
import { getTeacher } from '@/app/utils/actions';

type Props = {}

const Settings = (props: Props) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [user, setUser] = React.useState<any>(null)

    async function stripeConnect() {
        try {
            setLoading(true);
            await createStripeAccountLink();
            setLoading(false);
        } catch (error) {
            toast.error("Oops! Something went wrong. Are you logged in?")
        }
    }

    async function stripeDashboard() {
        try {
            setLoading(true);
            await createStripeDashboardLink();
            setLoading(false);
        } catch (error) {
            toast.error("Oops! Something went wrong. Are you logged in?")
        }
    }

    useEffect(() => {
        async function getUser() {
            setLoading(true);
            const user = await getTeacher();
            if (!user) {
                toast.error("Oops! Something went wrong. Are you logged in?")
                setLoading(false);
                return;
            }
            console.log(user)
            setUser(user);
            setLoading(false);
        }

        getUser();
    }, [])

    return (
        <div className='flex-1 lg:max-w-[1024px] px-8 overflow-y-scroll'>
            <div className='flex flex-col mt-8'>
                <h3 className='text-lg font-medium'>Settings</h3>
                <p className='text-sm text-muted-foreground'>Manage Preferences and Billing.</p>
            </div>
            <Separator size={"4"} className='my-8' />

            {user && user.instructor.stripeConnectedLinked ? (
                <Button size={"3"} className='flex items-center justify-start' onClick={stripeDashboard} loading={loading} disabled={loading}>
                    <LineChartIcon height={16} width={16} />
                    View Dashboard
                </Button>

            ) : (
                <Button size={"3"} className='flex items-center justify-start' onClick={stripeConnect} loading={loading} disabled={loading}>
                    <LinkIcon height={16} width={16} />
                    Connect Stripe
                </Button>

            )}
        </div>
    )
}

export default Settings