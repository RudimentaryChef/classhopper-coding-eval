import React, { useState } from 'react';
import { ClassTime } from '../types';
import { Clock, Trash2, ShoppingCart, Calendar, Plus, Minus, X } from 'lucide-react';
import { Heading } from '@radix-ui/themes';
import { buyClass, signupTimeSlot } from '../utils/stripeactions';
import { toast } from 'sonner';

type ClassTimeCheckoutProps = {
    selectedTimes: ClassTime[];
    setSelectedTimes: React.Dispatch<React.SetStateAction<ClassTime[]>>;
}

const ClassTimeCheckout = ({ selectedTimes, setSelectedTimes }: ClassTimeCheckoutProps) => {
    const [mobileCartOpen, setMobileCartOpen] = useState(false);

    // Format time from "HH:MM:SS" to "h:mm a"
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date from ISO string to "M/D" format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const removeFromCart = (id: number, startTime: string) => {
        setSelectedTimes(selectedTimes.filter(time => !(time.id === id && time.startTime === startTime)));
    };

    const incrementQuantity = (id: number, startTime: string) => {
        setSelectedTimes(selectedTimes.map(time =>
            time.id === id && time.startTime === startTime ? { ...time, quantity: (time.quantity || 1) + 1 } : time
        ));
    };

    const decrementQuantity = (id: number, startTime: string) => {
        setSelectedTimes(selectedTimes.map(time => {
            if (time.id === id && time.startTime === startTime) {
                const newQuantity = (time.quantity || 1) - 1;
                return newQuantity > 0 ? { ...time, quantity: newQuantity } : time;
            }
            return time;
        }));
    };

    const getTotalItems = () => {
        return selectedTimes.reduce((total, time) => total + (time.quantity || 1), 0);
    };

    const CartContent = () => (
        <>
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                    <Heading size="3">Your Cart</Heading>
                    <div className="flex items-center text-sm font-medium text-gray-600">
                        <ShoppingCart size={16} className="mr-1" />
                        {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                    </div>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-2">
                {selectedTimes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                        <ShoppingCart size={24} className="mb-2" />
                        <p>Your cart is empty</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {selectedTimes.map((time: ClassTime) => (
                            <li key={String(time.id) + time.startTime} className="p-2 border rounded bg-gray-50 hover:bg-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm truncate">{time.description}</p>

                                        {/* Date display */}
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Calendar size={12} className="mr-1" />
                                            {formatDate(time.startTime)}
                                        </div>

                                        {/* Time display */}
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Clock size={12} className="mr-1" />
                                            {formatTime(time.startTime)} - {formatTime(time.endTime)}
                                        </div>

                                        {time.flexible && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                Flexible
                                            </span>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Available seats: {time.seats}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(time.id, time.startTime)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center justify-end mt-2">
                                    <button
                                        onClick={() => decrementQuantity(time.id, time.startTime)}
                                        className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 disabled:opacity-50"
                                        disabled={(time.quantity || 1) <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="w-10 text-center text-sm font-medium">{time.quantity || 1}</span>
                                    <button
                                        onClick={() => incrementQuantity(time.id, time.startTime)}
                                        className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 disabled:opacity-50"
                                        disabled={(time.quantity || 1) >= time.seats}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer/CTA */}
            {selectedTimes.length > 0 && (
                <div className="p-4 border-t mt-auto">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                        onClick={async () => {
                            try {
                                const signup = await signupTimeSlot(selectedTimes)

                                if (signup.success) {
                                    buyClass(String(selectedTimes[0].course_id), selectedTimes)
                                    setMobileCartOpen(false); // Close the mobile cart after checkout
                                } else {
                                    toast.error("Error during checkout. Please try again.");
                                    console.error("Error during checkout:", signup);
                                }
                            } catch (error) {
                                console.error("Error during checkout:", error);
                                toast.error("Error during checkout. Please try again.");
                            }
                        }}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </>
    );

    return (
        <>
            {/* Desktop cart - hidden on mobile */}
            <div className="hidden lg:flex max-h-screen flex-col bg-white min-w-80 rounded-md border shadow-sm overflow-hidden">
                <CartContent />
            </div>

            {/* Mobile cart button - shown only on mobile */}
            <div className="fixed bottom-4 right-4 lg:hidden z-10">
                <button
                    onClick={() => setMobileCartOpen(true)}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                    aria-label="Open cart"
                >
                    <ShoppingCart size={24} />
                    {getTotalItems() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {getTotalItems()}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile cart drawer - shown when mobileCartOpen is true */}
            {mobileCartOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
                    <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <Heading size="3">Your Cart</Heading>
                            <button
                                onClick={() => setMobileCartOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label="Close cart"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <CartContent />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClassTimeCheckout;