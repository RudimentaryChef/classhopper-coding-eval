"use client"
import React, { useState } from 'react';
import { Calendar, Clock, User, DollarSign } from 'lucide-react';

// Type definitions
interface TimeSlot {
    user_id: string;
    course_id: number;
    time_slot_id: number;
    student_name: string;
    startTime: string;
    endTime: string;
    created_at: string;
    transaction_id: string;
    quantity: number;
}

type CourseMap = {
    [key: number]: string;
};

type CourseDistribution = {
    [courseName: string]: number;
};

type SortByField = 'created_at' | 'startTime' | 'student_name' | 'quantity' | 'earnings';
type SortOrder = 'asc' | 'desc';

// Sample data - in a real app, this would come from an API
const sampleData: TimeSlot[] = [
    {
        user_id: "user123",
        course_id: 101,
        time_slot_id: 1001,
        student_name: "Jane Smith",
        startTime: "2025-03-10T14:00:00.000Z",
        endTime: "2025-03-10T15:30:00.000Z",
        created_at: "2025-03-09T12:30:22.053Z",
        transaction_id: "trans_781234",
        quantity: 1
    },
    {
        user_id: "user456",
        course_id: 102,
        time_slot_id: 1002,
        student_name: "John Doe",
        startTime: "2025-03-11T10:00:00.000Z",
        endTime: "2025-03-11T11:30:00.000Z",
        created_at: "2025-03-10T09:45:22.053Z",
        transaction_id: "trans_781235",
        quantity: 2
    },
    {
        user_id: "user789",
        course_id: 101,
        time_slot_id: 1003,
        student_name: "Alex Johnson",
        startTime: "2025-03-12T16:00:00.000Z",
        endTime: "2025-03-12T17:30:00.000Z",
        created_at: "2025-03-10T14:20:22.053Z",
        transaction_id: "trans_781236",
        quantity: 1
    },
    {
        user_id: "user321",
        course_id: 103,
        time_slot_id: 1004,
        student_name: "Taylor Williams",
        startTime: "2025-03-13T13:00:00.000Z",
        endTime: "2025-03-13T14:30:00.000Z",
        created_at: "2025-03-10T16:10:22.053Z",
        transaction_id: "trans_781237",
        quantity: 3
    }
];

// Course map - in a real app, this would come from an API
const courseMap: CourseMap = {
    101: "Introduction to Web Development",
    102: "Advanced JavaScript",
    103: "UI/UX Design Principles"
};

// Price per signup
const PRICE_PER_SIGNUP: number = 10;

const InstructorDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortByField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Format date and time
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Filter, search, and sort data
    const processedData: TimeSlot[] = sampleData
        .filter(signup => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                signup.student_name.toLowerCase().includes(searchLower) ||
                signup.user_id.toLowerCase().includes(searchLower) ||
                courseMap[signup.course_id].toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'created_at') {
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            } else if (sortBy === 'startTime') {
                comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            } else if (sortBy === 'student_name') {
                comparison = a.student_name.localeCompare(b.student_name);
            } else if (sortBy === 'quantity') {
                comparison = a.quantity - b.quantity;
            } else if (sortBy === 'earnings') {
                comparison = a.quantity - b.quantity; // Since earnings is directly proportional to quantity
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Calculate metrics
    const totalSignups: number = processedData.length;
    const totalStudents: number = processedData.reduce((sum, signup) => sum + signup.quantity, 0);
    const totalEarnings: number = processedData.reduce((sum, signup) => sum + (signup.quantity * PRICE_PER_SIGNUP), 0);
    const courseDistribution: CourseDistribution = processedData.reduce((acc: CourseDistribution, signup) => {
        const courseName = courseMap[signup.course_id];
        acc[courseName] = (acc[courseName] || 0) + signup.quantity;
        return acc;
    }, {});

    const toggleSort = (field: SortByField): void => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your course signups and student enrollments</p>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Compact Stats Bar */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="flex flex-col border-r border-gray-200">
                            <span className="text-sm text-gray-500">Signups</span>
                            <span className="text-xl font-semibold text-gray-900">{totalSignups}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-200">
                            <span className="text-sm text-gray-500">Students</span>
                            <span className="text-xl font-semibold text-gray-900">{totalStudents}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-200">
                            <span className="text-sm text-gray-500">Courses</span>
                            <span className="text-xl font-semibold text-gray-900">{Object.keys(courseDistribution).length}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-200">
                            <span className="text-sm text-gray-500">Rate</span>
                            <span className="text-xl font-semibold text-gray-900">{formatCurrency(PRICE_PER_SIGNUP)}/student</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Earnings</span>
                            <span className="text-xl font-semibold text-green-600">{formatCurrency(totalEarnings)}</span>
                        </div>
                    </div>
                </div>

                {/* Filters and search */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div>
                            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">Sort By</label>
                            <select
                                id="sort"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value as SortByField);
                                    setSortOrder('desc');
                                }}
                            >
                                <option value="created_at">Date Signed Up</option>
                                <option value="startTime">Class Date</option>
                                <option value="student_name">Student Name</option>
                                <option value="quantity">Quantity</option>
                                <option value="earnings">Earnings</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="text"
                                name="search"
                                id="search"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="Search student or course"
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Signup Table */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => toggleSort('student_name')}
                                    >
                                        Student
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => toggleSort('startTime')}
                                    >
                                        Schedule
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => toggleSort('quantity')}
                                    >
                                        Qty
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => toggleSort('earnings')}
                                    >
                                        Earnings
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => toggleSort('created_at')}
                                    >
                                        Signed Up
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {processedData.map((signup) => (
                                    <tr key={signup.transaction_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">{signup.student_name.charAt(0)}</span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{signup.student_name}</div>
                                                    <div className="text-xs text-gray-500">{signup.user_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{courseMap[signup.course_id]}</div>
                                            <div className="text-xs text-gray-500">ID: {signup.course_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                                                <span className="text-sm text-gray-900">{formatDate(signup.startTime)}</span>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(signup.startTime)} - {formatTime(signup.endTime)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {signup.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {formatCurrency(signup.quantity * PRICE_PER_SIGNUP)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(signup.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                                            <button className="text-gray-600 hover:text-gray-900">Contact</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {processedData.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No signups match your search criteria</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboard;