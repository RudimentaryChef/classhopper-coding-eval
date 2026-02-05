import React, { useEffect, useState } from 'react'
import { ClassTime } from '../types'
import { Clock } from 'lucide-react';
import SeatsDisplay from './SeatsDisplay';
import { getSeats } from '../utils/actions';
import { toast } from 'sonner';

type Props = {
    time: ClassTime;
    isSelected: boolean;
    handleSelectClassTime: (time: ClassTime) => void;
}

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ClassTimeCard = ({ time, isSelected, handleSelectClassTime }: Props) => {
    const [seats, setSeats] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        async function fetchSeats() {
            setLoading(true);
            try {
                const res = await getSeats(time.id, time.startTime, time.endTime);

                if (!signal.aborted) {
                    setSeats(res.available_seats);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Error fetching seats:", error);
                    toast.error("Failed to fetch seats. Please try again later.");
                    setSeats(0);
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        }
        fetchSeats();

        return () => {
            controller.abort();
        }
    }, [time.id, time.startTime, time.endTime]);


    return (
        <div
            key={time.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
            onClick={() => {
                if (!loading && seats >= 1) handleSelectClassTime({ ...time, seats });
                if (seats < 1) {
                    toast.error("No seats available for this time slot.");
                }
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium text-gray-800">{time.description}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {time.flexible
                            ? "Flexible Timing"
                            : `${formatTime(time.startTime)} - ${formatTime(time.endTime)}`}
                    </div>
                </div>

                <div className="flex items-center">
                    <SeatsDisplay loading={loading} seats={seats} />
                    {time.flexible && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Flexible
                        </span>
                    )}
                    {isSelected && (
                        <span className="ml-2 bg-blue-500 text-white rounded-full p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClassTimeCard