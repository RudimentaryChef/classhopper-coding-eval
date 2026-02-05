import React from 'react';
import Link from 'next/link';
import TallyComponent from "../components/tally/TallyComponent";
import { Search, BookOpen } from 'lucide-react';

export default function ClassSelectionInterface() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">How would you like to discover your next class?</h1>
                <div className="flex flex-col space-y-4">
                    <TallyComponent link="mJJvyR" courseName="sign up" title="Request a Class">
                        <button
                            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white p-4 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            <Search size={24} />
                            <span className="font-medium">I know what class I&apos;m looking for</span>
                        </button>
                    </TallyComponent>
                    <Link href={"/explore"} className='w-full'>
                        <button
                            className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white p-4 rounded-lg shadow-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                        >
                            <BookOpen size={24} />
                            <span className="font-medium">I&apos;m just looking around for classes</span>
                        </button>
                    </Link>
                </div>
                <div className="mt-8 text-center text-gray-500 text-sm">
                    Find the perfect class to match your interests and schedule
                </div>
            </div>
        </div>
    );
}