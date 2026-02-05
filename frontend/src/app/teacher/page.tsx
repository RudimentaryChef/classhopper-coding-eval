"use client";

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import UnderConstruction from './components/UnderConstruction';
import TeacherProfile from './components/TeacherProfile';
import CreateClass from './components/CreateClass';
import MyClasses from './components/MyClasses';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';

type Props = {}

const page = (props: Props) => {
    return (
        <>
            <Navbar scrollable fixed={false} />
            <div className='h-screen-minus-nav w-screen'>
                <TeacherView />
            </div>
        </>
    )
}

export default page

function TeacherView() {
    const [selected, setSelected] = useState<string>('Classes')
    const mainContent: { [key: string]: any } = {
        'Dashboard': <Dashboard />,
        'Classes': <MyClasses selected={selected} setSelected={setSelected} />,
        'Students': <UnderConstruction />,
        'Settings': <Settings />,
        'Classes Create': <CreateClass selected={selected} setSelected={setSelected} />,
        // 'Profile': <UnderConstruction />,
        // 'Classes Edit': (class_id: number) => <CreateClass selected={selected} setSelected={setSelected} class_id={class_id} />,
        'Profile': <TeacherProfile />
    }

    return (
        <div className='flex h-screen-minus-nav flex-col lg:flex-row w-full'>
            <TeacherSidebar selected={selected} setSelected={setSelected} />
            {mainContent[selected]}
        </div>
    )
}

type TeacherSidebarProps = {
    selected: string
    setSelected: React.Dispatch<React.SetStateAction<string>>
}

function TeacherSidebar({ selected, setSelected }: TeacherSidebarProps) {
    const sidebarItems = ["Dashboard", "Classes", "Students", "Settings", "Profile"]

    return (
        <aside className='lg:w-[300px] pt-4 flex-shrink-0 px-4 lg:border-r'>
            <nav className='flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 lg:w-full overflow-x-scroll no-scrollbar'>
                {sidebarItems.map((item) => (
                    <button className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 justify-start ${item === selected.split(" ")[0] ? "bg-gray-200 hover:bg-gray-200" : "hover:bg-gray-100"}`} key={item} onClick={() => setSelected(item)}>
                        {item}
                    </button>
                ))}
            </nav>
        </aside>
    )
}
