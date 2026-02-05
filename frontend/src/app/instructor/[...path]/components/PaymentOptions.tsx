"use client"
import { Button } from "@radix-ui/themes";
import ConnectButton from "./ConnectButton";
import { UserInstructor } from "@/app/types";
import { useState } from "react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/app/utils/functions";
import axios from "axios";

const PaymentOptions = ({ user }: { user: UserInstructor }) => {
    const [selectedOption, setSelectedOption] = useState('optionA');
    const [phoneNumber, setPhoneNumber] = useState(user.instructor.phone_number || '');
    const [paymentMethod, setPaymentMethod] = useState(user.instructor.payment_method || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSubmitOptionA = async (e: any) => {
        e.preventDefault();
        setSaved(false);
        setIsSubmitting(true);

        if (!phoneNumber || !paymentMethod) {
            toast.error("Please fill in all fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            const upd = await axios.put(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/update?instructor_id=${user.instructor.id}`, {
                phone_number: phoneNumber,
                payment_method: paymentMethod
                // stripeConnectedId: "platform"
            });

            // Success state
            toast.success("Payment preferences saved successfully!");
            setSaved(true);

            // Optional: Update any state or local data if needed
            // For example, you might want to update the user object in the parent component

        } catch (e: any) {
            toast.error(e.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhoneBlur = (value: string) => {
        const formatted = formatPhoneNumber(value);
        if (formatted === "invalid") {
            toast.error("Please enter a valid phone number.");
            setPhoneNumber('');
        } else {
            setPhoneNumber(formatted);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-base font-medium mb-4">Payment Setup</h4>
                <p className="text-sm text-muted-foreground mb-6">
                    Choose how you&apos;d like to receive payments for your courses.
                </p>
            </div>

            <div className="space-y-4">
                {/* Option A */}
                <div className={`border rounded-lg p-4 ${selectedOption === 'optionA' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2"
                        onClick={() => setSelectedOption('optionA')}
                    >
                        <input
                            type="radio"
                            id="optionA"
                            name="paymentOption"
                            checked={selectedOption === 'optionA'}
                            onChange={() => { }}
                            className="h-4 w-4"
                        />
                        <label htmlFor="optionA" className="font-medium">Weekly Manual Payments</label>
                    </div>

                    {selectedOption === 'optionA' && (
                        <div className="mt-4 pl-6 space-y-4">
                            <p className="text-sm">
                                Payments will be directed to Classhopper. We&apos;ll manually send you payments at the end of every week.
                            </p>

                            <form onSubmit={handleSubmitOptionA} className="space-y-4">
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        onBlur={(e) => handlePhoneBlur(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="(123) 456-7890"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">
                                        Preferred Payment Method
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select a payment method</option>
                                        <option value="zelle">Zelle</option>
                                        <option value="venmo">Venmo</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save Preferences"}
                                    </Button>

                                    {saved && (
                                        <span className="text-green-600 text-sm flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Preferences saved
                                        </span>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Option B */}
                <div className={`border rounded-lg p-4 ${selectedOption === 'optionB' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2"
                        onClick={() => setSelectedOption('optionB')}
                    >
                        <input
                            type="radio"
                            id="optionB"
                            name="paymentOption"
                            checked={selectedOption === 'optionB'}
                            onChange={() => { }}
                            className="h-4 w-4"
                        />
                        <label htmlFor="optionB" className="font-medium">Connect Bank Account</label>
                    </div>

                    {selectedOption === 'optionB' && (
                        <div className="mt-4 pl-6 space-y-4">
                            <p className="text-sm">
                                Connect your bank account for easier access to payments. This gives you a dedicated payment profile and dashboard to track your earnings.
                            </p>
                            <ConnectButton />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentOptions;