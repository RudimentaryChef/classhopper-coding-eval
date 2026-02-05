"use server"
import { getTeacher, getUser } from '@/app/utils/actions';
import { Button, Separator } from '@radix-ui/themes';
import React from 'react';
import DashboardButton from './DashboardButton';
import ConnectButton from './ConnectButton';
import PaymentOptions from './PaymentOptions';

const Settings = async () => {
    const user = await getTeacher();
    if (!user) {
        return (
            <div>Something went wrong</div>
        )
    }

    user.instructor.stripeConnectedLinked = false;

    return (
        <div className='flex-1 lg:max-w-[1024px] px-8 overflow-y-scroll'>
            <div className='flex flex-col mt-8'>
                <h3 className='text-lg font-medium'>Settings</h3>
                <p className='text-sm text-muted-foreground'>Manage Preferences and Billing.</p>
            </div>
            <Separator size={"4"} className='my-8' />

            {user && user.instructor.stripeConnectedLinked ? (
                <DashboardButton />
            ) : (
                <PaymentOptions user={user} />
            )}
        </div>
    )
}



export default Settings;