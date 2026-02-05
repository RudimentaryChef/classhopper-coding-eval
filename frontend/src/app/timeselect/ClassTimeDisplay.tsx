"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Filter } from 'lucide-react';
import { rrulestr } from 'rrule';
import axios from 'axios';
import { ClassTime, TimeSlot } from '@/app/types';
import SeatsDisplay from './SeatsDisplay';
import ClassTimeCard from './ClassTimeCard';
import { toast } from 'sonner';

type ClassTimeDisplayProps = {
    selectedTimes: ClassTime[];
    setSelectedTimes: React.Dispatch<React.SetStateAction<ClassTime[]>>;
    class_id: string;
}

export const ClassTimeDisplay = ({ class_id, selectedTimes, setSelectedTimes }: ClassTimeDisplayProps) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('week');
    const [generatedClassTimes, setGeneratedClassTimes] = useState<ClassTime[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<number[]>([]);
    const [mockTimeSlots, setMockTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTimeSlots() {
            setLoading(true)
            const response = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/timeslot/filter`, {
                course_id: class_id
            })
            const parsed = response.data.map((slot: any) => {
                if (!slot.flexible) {
                    slot.dtstart = new Date(slot.dtstart + "Z")
                    slot.dtend = new Date(slot.dtend + "Z")
                }

                if (slot.rrule_string) {
                    slot.rrule = rrulestr(slot.rrule_string)
                }

                return slot;
            })
            setMockTimeSlots(parsed as TimeSlot[])
            setLoading(false)
        }
        fetchTimeSlots()
    }, [class_id]);

    // Generate class times based on time slots and selected date range
    useEffect(() => {
        const classTimes: ClassTime[] = [];
        let startDate = new Date(selectedDate);
        let endDate = new Date(selectedDate);

        // Set date range based on view
        if (selectedView === 'day') {
            // Keep as is - just one day
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else if (selectedView === 'week') {
            // Set to start of week (Sunday)
            const day = startDate.getDay();
            startDate.setDate(startDate.getDate() - day);
            startDate.setHours(0, 0, 0, 0);

            // Set to end of week (Saturday)
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (selectedView === 'month') {
            // Set to start of month
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0);

            // Set to end of month
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // For each time slot, generate occurrences that fall within the date range
        mockTimeSlots.forEach(slot => {
            // Skip if filtered out
            if (filteredCourses.length > 0 && !filteredCourses.includes(slot.id!)) {
                return;
            }

            if (slot.rrule) {
                // Get the time zone offset for the first occurrence
                const firstOccurrence = slot.dtstart!
                const initialOffset = firstOccurrence.getTimezoneOffset();

                // Get all occurrences in the date range
                const occurrences = slot.rrule.between(
                    new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())),
                    new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)),
                    true
                );

                occurrences.forEach((occurrence, index) => {
                    // For each occurrence, check if daylight saving has changed
                    const currentOffset = occurrence.getTimezoneOffset();
                    const offsetDiff = currentOffset - initialOffset;

                    // Create a new date and adjust for any daylight savings changes
                    // to maintain the same local time
                    const localStartDate = new Date(occurrence);
                    if (offsetDiff !== 0) {
                        localStartDate.setMinutes(localStartDate.getMinutes() + offsetDiff);
                    }

                    // Calculate end time based on duration
                    const localEndDate = new Date(localStartDate);
                    localEndDate.setMinutes(localStartDate.getMinutes() + (slot.duration || 60));

                    classTimes.push({
                        id: slot.id!,
                        course_id: slot.course_id!,
                        seats: slot.spots!,
                        description: slot.description,
                        startTime: localStartDate.toISOString(),
                        endTime: localEndDate.toISOString(),
                        flexible: slot.flexible,
                    });
                });
            } else if (slot.dtstart && slot.dtend) {
                // Single occurrence - properly convert UTC to local
                const startDateTime = new Date(slot.dtstart.toISOString());
                const endDateTime = new Date(slot.dtend.toISOString());

                // Check if this class is within our date range
                if (startDateTime >= startDate && startDateTime <= endDate) {
                    classTimes.push({
                        id: slot.id || 0,
                        course_id: slot.course_id || 0,
                        seats: slot.spots || 0,
                        description: slot.description,
                        startTime: startDateTime.toISOString(),
                        endTime: endDateTime.toISOString(),
                        flexible: slot.flexible,
                    });
                }
            }
        });

        // Sort by start time
        classTimes.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setGeneratedClassTimes(classTimes);
    }, [selectedDate, selectedView, filteredCourses, mockTimeSlots]);

    // Function to toggle course filtering
    const toggleCourseFilter = (ts_id: number) => {
        setFilteredCourses(prev =>
            prev.includes(ts_id)
                ? prev.filter(id => id !== ts_id)
                : [...prev, ts_id]
        );
    };

    // Generate the days to display based on the selected view
    const getDaysToDisplay = () => {
        const days = [];
        let startDate = new Date(selectedDate);

        if (selectedView === 'day') {
            days.push(new Date(startDate));
        } else if (selectedView === 'week') {
            // Start with Sunday
            const day = startDate.getDay();
            startDate.setDate(startDate.getDate() - day);

            // Add 7 days of the week
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                days.push(date);
            }
        } else if (selectedView === 'month') {
            // Start with the first day of the month
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

            // Add days for the month view (including padding for complete weeks)
            const firstDay = startDate.getDay(); // Get day of week for the 1st

            // Add padding days from previous month
            for (let i = 0; i < firstDay; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() - (firstDay - i));
                days.push(date);
            }

            // Add all days in the month
            const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            const daysInMonth = lastDay.getDate();

            for (let i = 0; i < daysInMonth; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                days.push(date);
            }

            // Add padding days for the next month to complete the grid
            const remainingDays = (7 - (days.length % 7)) % 7;
            const lastDate = days[days.length - 1];

            for (let i = 1; i <= remainingDays; i++) {
                const date = new Date(lastDate);
                date.setDate(date.getDate() + i);
                days.push(date);
            }
        }

        return days;
    };

    // Get the class times for a specific day
    const getClassTimesForDay = (date: Date) => {
        return generatedClassTimes.filter(classTime => {
            const classDate = new Date(classTime.startTime);
            return (
                classDate.getFullYear() === date.getFullYear() &&
                classDate.getMonth() === date.getMonth() &&
                classDate.getDate() === date.getDate()
            );
        });
    };

    // Navigation functions
    const goToPrevious = () => {
        const newDate = new Date(selectedDate);
        if (selectedView === 'day') {
            newDate.setDate(newDate.getDate() - 1);
        } else if (selectedView === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (selectedView === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setSelectedDate(newDate);
    };

    const goToNext = () => {
        const newDate = new Date(selectedDate);
        if (selectedView === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        } else if (selectedView === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (selectedView === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Format time nicely
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for header
    const formatDateHeader = () => {
        if (selectedView === 'day') {
            return selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        } else if (selectedView === 'week') {
            const days = getDaysToDisplay();
            const firstDay = days[0];
            const lastDay = days[days.length - 1];
            return `${firstDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else if (selectedView === 'month') {
            return selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        }
        return '';
    };

    const isSelected = (classTime: ClassTime) => {
        return selectedTimes.some(ct => ct.id === classTime.id && ct.startTime === classTime.startTime);
    }

    // Handle selecting a class time
    const handleSelectClassTime = (classTime: ClassTime) => {
        if (isSelected(classTime)) {
            setSelectedTimes((selectedTimes.filter(ct => !(ct.id === classTime.id && ct.startTime === classTime.startTime))));
        } else {
            setSelectedTimes([...selectedTimes, classTime]);
        }
    };

    const goToNextAvailableDate = () => {
        let nextAvailableDate: Date | null = null;

        const startCheckDate = new Date(selectedDate);
        startCheckDate.setDate(startCheckDate.getDate() + 1);
        startCheckDate.setHours(0, 0, 0, 0);

        mockTimeSlots.forEach(slot => {
            if (filteredCourses.length > 0 && !filteredCourses.includes(slot.id!)) {
                return;
            }

            let slotNextDate: Date | null = null;

            if (slot.rrule) {
                const nextOccurrence = slot.rrule.after(
                    new Date(Date.UTC(startCheckDate.getFullYear(), startCheckDate.getMonth(), startCheckDate.getDate())),
                    true
                );

                if (nextOccurrence) {
                    slotNextDate = new Date(nextOccurrence);
                }
            } else if (slot.dtstart && slot.dtend) {
                const startDateTime = new Date(slot.dtstart.toISOString());
                if (startDateTime >= startCheckDate) {
                    slotNextDate = new Date(startDateTime);
                }
            }

            if (slotNextDate && (!nextAvailableDate || slotNextDate < nextAvailableDate)) {
                nextAvailableDate = slotNextDate;
            }
        });

        if (nextAvailableDate === null) {
            toast.error("No more available class times in the future for this course.");
            return;
        }

        nextAvailableDate = new Date(nextAvailableDate);
        nextAvailableDate.setHours(0, 0, 0, 0);
        setSelectedDate(nextAvailableDate);

        if (selectedView === 'week') {
            const dayOfWeek = nextAvailableDate.getDay();
            const beginningOfWeek = new Date(nextAvailableDate);
            beginningOfWeek.setDate(beginningOfWeek.getDate() - dayOfWeek);
            setSelectedDate(beginningOfWeek);
        } else if (selectedView === 'month') {
            const firstDayOfMonth = new Date(nextAvailableDate.getFullYear(), nextAvailableDate.getMonth(), 1);
            setSelectedDate(firstDayOfMonth);
        }
    }

    const displayGrid = () => {
        return (
            <div className="grid grid-cols-7 gap-1 mb-6">
                {/* Weekday headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-sm bg-gray-50">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {daysToDisplay.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayClassTimes = getClassTimesForDay(date);

                    return (
                        <div
                            key={index}
                            className={`min-h-24 p-1 border rounded-sm ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} 
                  ${isToday ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-200'}`}
                            onClick={() => {
                                setSelectedView('day');
                                setSelectedDate(date)
                            }}
                        >
                            <div className={`text-right p-1 ${isCurrentMonth ? '' : 'text-gray-400'}`}>
                                {date.getDate()}
                            </div>
                            <div className="overflow-y-auto max-h-20">
                                {dayClassTimes.map(classTime => {
                                    return (
                                        <div
                                            key={classTime.id}
                                            className={`p-1 mb-1 text-xs rounded cursor-pointer truncate border-l-4 bg-blue-100 border-blue-400 
                          ${isSelected(classTime) ? 'bg-blue-300 border-blue-700 shadow-sm transform scale-95 font-medium' : ''}`}
                                        >
                                            {formatTime(classTime.startTime)} - {classTime.description}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    const displayList = () => {
        return (
            <div className="mb-6">
                <div className="grid grid-cols-1 gap-2">
                    {daysToDisplay.map((date: Date, dateIndex) => {
                        const dayClassTimes = getClassTimesForDay(date);
                        const isToday = date.toDateString() === new Date().toDateString();

                        if (dayClassTimes.length === 0 && selectedView === 'week') {
                            return null;
                        }

                        return dayClassTimes.length > 0 ? (
                            <div key={dateIndex} className="px-3 py-2 border-l-4 border-blue-400 pl-4 mb-4">
                                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h3>
                                <div className="space-y-2">
                                    {dayClassTimes.map((time) => {
                                        // const course = mockCourses.find(c => c.id === time.course_id);
                                        return (
                                            <ClassTimeCard time={time} isSelected={isSelected(time)} handleSelectClassTime={handleSelectClassTime} key={time.startTime + String(time.id)} />
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No class times available for this period. Please try a different date range.</p>
                                <button
                                    onClick={goToNextAvailableDate}
                                    className="px-3 py-1 bg-radix-blue text-white rounded text-sm mt-4 outline"
                                    disabled={loading}
                                >
                                    Go To Next Available
                                </button>
                            </div>
                        );
                    })}
                    {selectedView == 'week' && daysToDisplay.every((d: Date) => {
                        const dayClassTimes = getClassTimesForDay(d);
                        return dayClassTimes.length === 0;
                    }) && (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No class times available for this period. Please try a different date range.</p>
                                <button
                                    onClick={goToNextAvailableDate}
                                    className="px-3 py-1 bg-radix-blue text-white rounded text-sm mt-4 outline"
                                    disabled={loading}
                                >
                                    Go To Next Available
                                </button>
                            </div>
                        )}
                </div>
            </div >
        );
    }

    const daysToDisplay = getDaysToDisplay();

    return (
        <div className="p-4 bg-white flex-grow mr-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Class Schedule</h1>
                <p className="text-gray-600">Select a class time to continue to checkout</p>
            </div>

            {/* Calendar Controls */}
            <div className="md:flex-row flex flex-col justify-between md:items-center mb-4">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToPrevious}
                        className="p-2 rounded hover:bg-gray-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-2 rounded hover:bg-gray-100"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <h2 className="text-md md:text-lg font-semibold">{formatDateHeader()}</h2>
                </div>
                <div className="flex items-center space-x-2 md:m-0 mt-4">
                    <button
                        onClick={() => setSelectedView('day')}
                        className={`px-3 py-1 rounded text-sm ${selectedView === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => setSelectedView('week')}
                        className={`px-3 py-1 rounded text-sm ${selectedView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setSelectedView('month')}
                        className={`px-3 py-1 rounded text-sm ${selectedView === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                        Month
                    </button>
                </div>
            </div>

            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded">
                <Filter size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span className="text-sm font-medium mr-3">Filter Sections:</span>
                <div className="flex gap-2 overflow-x-scroll">
                    {mockTimeSlots.map(ts => (
                        <button
                            key={ts.id}
                            onClick={() => toggleCourseFilter(ts.id!)}
                            className={`px-3 py-1 text-xs rounded-full border 
                ${filteredCourses.includes(ts.id!)
                                    ? 'bg-gray-200 border-gray-400'
                                    : 'bg-blue-50 border-blue-200'}`
                            }
                        >
                            {ts.description}
                        </button>
                    ))}
                </div>
            </div>
            {
                (selectedView === 'month') ? (
                    displayGrid()
                ) : (
                    displayList()
                )
            }
        </div >
    );
};



export default ClassTimeDisplay;