"use client"
import { ClassTime } from "@/app/types";
import { get } from "http";

type DisplayClassTimesProps = {
    classTimes?: ClassTime[];
    onSelectTime?: (classTime: ClassTime) => void;
    selectedTimeId?: string;
};

export default function DisplayClassTimes({ classTimes = [], onSelectTime, selectedTimeId }: DisplayClassTimesProps) {
    // Group class times by date
    const groupedByDate = classTimes?.reduce((groups, classTime) => {
        const dateStr = new Date(classTime.startTime).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });

        if (!groups[dateStr]) {
            groups[dateStr] = [];
        }

        groups[dateStr].push(classTime);
        return groups;
    }, {} as Record<string, ClassTime[]>) || {};

    // Function to format time
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Generate a unique ID for each class time (for selection)
    const getTimeId = (classTime: ClassTime) => {
        return `${new Date(classTime.startTime).getTime()}-${classTime.description}`;
    };

    // console.log(getTimeId(classTimes[0]));

    if (!classTimes || classTimes.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500 text-sm">
                No upcoming class times available.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Object.entries(groupedByDate).map(([dateStr, times]) => (
                <div key={dateStr} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-radix-blue text-white px-3 py-2 text-sm font-medium">
                        {dateStr}
                    </div>

                    <div className="divide-y divide-gray-100">
                        {times.map((classTime, index) => {
                            const timeId = getTimeId(classTime);
                            const isSelected = selectedTimeId === timeId;

                            return (
                                <div
                                    key={index}
                                    className={`px-3 py-2 transition-colors ${onSelectTime ? 'cursor-pointer hover:bg-gray-50' : ''
                                        } ${isSelected ? 'bg-indigo-50 border-l-3 border-indigo-500' : ''}`}
                                    onClick={() => onSelectTime && onSelectTime(classTime)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="min-w-32">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatTime(new Date(classTime.startTime))} - {formatTime(new Date(classTime.endTime))}
                                                </span>
                                            </div>

                                            <div className="ml-4">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {classTime.description}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {classTime.seats !== undefined && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {classTime.seats}
                                                </span>
                                            )}

                                            {classTime.flexible && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Flex
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
