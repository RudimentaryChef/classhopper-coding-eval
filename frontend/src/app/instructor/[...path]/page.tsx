"use server"
import Navbar from '@/app/components/Navbar';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import MyClasses from './components/MyClasses';
import TeacherProfile from './components/TeacherProfile';
import Link from 'next/link';
import UnderConstruction from './components/UnderConstruction';
import { Spinner } from '@radix-ui/themes';
import CreateClass from './components/CreateClass';
import Settings from './components/Settings';

const sidebarItems = ["dashboard", "classes", "students", "settings", "profile"];

const page = async ({ params, searchParams }: {
    params: Promise<{ path: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
    const { userId, redirectToSignIn } = await auth()

    if (!userId) {
        redirectToSignIn()
    }

    const { path } = await params;
    const currentPage = path?.[0] || 'Dashboard';
    const class_id = (await searchParams).id as string

    function getPageComponent(page: string) {
        switch (page.toLowerCase()) {
            case 'classes':
                if (path.length > 1) {
                    if (path[1] === 'create') {
                        return (<CreateClass userId={userId!} />)
                    } else if (path[1] === 'edit') {
                        return (<CreateClass userId={userId!} class_id={class_id} />)
                    }
                } else {
                    return (
                        <Suspense fallback={<Spinner />}>
                            <MyClasses />
                        </Suspense>
                    )
                }
            case 'profile':
                return (
                    <Suspense fallback={<Spinner />}>
                        <TeacherProfile />
                    </Suspense>
                )
            case 'settings':
                return (
                    <Suspense fallback={<Spinner />}>
                        <Settings />
                    </Suspense>
                )
            default:
                if (sidebarItems.includes(page.toLowerCase())) {
                    return <UnderConstruction />
                }
                return notFound();
        }
    }

    return (
        <>
            <Navbar scrollable fixed={false} />
            <div className='h-screen-minus-nav w-screen'>
                <div className='flex h-screen-minus-nav flex-col lg:flex-row w-full'>
                    <aside className='lg:w-[300px] pt-4 flex-shrink-0 px-4 lg:border-r'>
                        <nav className='flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 lg:w-full overflow-x-scroll no-scrollbar'>
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item}
                                    href={`/instructor/${item.toLowerCase()}`}
                                    className='lg:w-full block'
                                >
                                    <button className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 justify-start lg:w-full ${item.toLowerCase() === currentPage.toLowerCase()
                                        ? "bg-gray-200 hover:bg-gray-200"
                                        : "hover:bg-gray-100"
                                        }`}>
                                        {item[0].toUpperCase() + item.slice(1)}
                                    </button>
                                </Link>
                            ))}
                        </nav>
                    </aside>
                    {getPageComponent(currentPage)}
                </div>
            </div >
        </>
    )
}

export default page