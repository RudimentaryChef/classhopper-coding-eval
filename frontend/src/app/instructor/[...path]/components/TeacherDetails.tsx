"use client";
import { CircleUserRoundIcon, PencilIcon, SaveIcon, X } from 'lucide-react'
import { Button, Text } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserInstructor } from '@/app/types'
import { formatPhoneNumber } from '@/app/utils/functions'
import { toast } from 'sonner'
import { AutoComplete } from '@/components/ui/autocomplete'
import { PlaceAutocompleteResult } from '@googlemaps/google-maps-services-js';
import { autocomplete } from '@/app/utils/google';
import axios from 'axios';

type Props = {
    userIntructor: UserInstructor;
}

const TeacherDetails = ({ userIntructor }: Props) => {
    const [mode, setMode] = useState<"view" | "edit">("view");
    // Keep original data separate from edited data
    const [originalData, setOriginalData] = useState<UserInstructor>(userIntructor);
    const [editedData, setEditedData] = useState<UserInstructor>(userIntructor);
    const [searchValue, setSearchValue] = useState('');
    const [addressItems, setAddressItems] = useState<PlaceAutocompleteResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Update original data if props change
    useEffect(() => {
        setOriginalData(userIntructor);
        setEditedData(userIntructor);
    }, [userIntructor]);

    // Fetch address predictions when search value changes
    useEffect(() => {
        const fetchPredictions = async () => {
            if (searchValue.length > 2) {
                const predictions = await autocomplete(searchValue);
                setAddressItems(predictions ?? []);
            } else {
                setAddressItems([]);
            }
        }

        fetchPredictions();
    }, [searchValue]);

    // Handle mode changes
    const handleEdit = () => setMode("edit");

    const handleCancel = () => {
        // Reset to original data when canceling
        setEditedData(originalData);
        setMode("view");
        setSearchValue('');
    };

    // Update a field in the edited data
    const updateUser = (field: string, value: string) => {
        setEditedData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value
            }
        }));
    };

    const updateInstructor = (field: string, value: string) => {
        setEditedData(prev => ({
            ...prev,
            instructor: {
                ...prev.instructor,
                [field]: value
            }
        }));
    };

    // Format phone number on blur
    const handlePhoneBlur = (value: string) => {
        const formatted = formatPhoneNumber(value);
        if (formatted === "invalid") {
            toast.error("Please enter a valid phone number.");
            updateInstructor("phone_number", "");
        } else {
            updateInstructor("phone_number", formatted);
        }
    };

    const handleSave = async () => {
        setLoading(true);

        // Validate all required fields
        const { user, instructor } = editedData;
        if (!instructor.phone_number ||
            !instructor.street_address ||
            !user.first_name ||
            !user.last_name ||
            !user.email ||
            !user.birthday ||
            !instructor.description) {
            toast.error("Please fill all the fields");
            setLoading(false);
            return;
        }

        try {
            // Create the request payloads
            const instructorFormData = {
                phone_number: instructor.phone_number,
                street_address: instructor.street_address,
                description: instructor.description
            };

            const userFormData = {
                email: user.email,
                birthday: user.birthday,
                first_name: user.first_name,
                last_name: user.last_name
            };

            // Bug 16: Wrong HTTP method - backend expects PUT with query param, frontend uses POST with body
            // Should be: axios.put(`/instructors/update?instructor_id=${instructor.id}`, instructorFormData)
            const instructorUpdate = axios.post(
                `${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/update`,
                { instructor_id: instructor.id, ...instructorFormData }
            );

            const userUpdate = axios.put(
                `${process.env.NEXT_PUBLIC_HOSTNAME}/users/update?user_id=${user.id}`,
                userFormData
            );

            // Wait for both updates to complete
            await Promise.all([instructorUpdate, userUpdate]);

            // Update original data after successful save
            setOriginalData(editedData);
            setMode("view");
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    // Use current data based on mode
    const displayData = mode === "edit" ? editedData : originalData;

    return (
        <form className='flex flex-col border rounded-md p-6 shadow-sm' onSubmit={(e) => e.preventDefault()}>
            <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center justify-start gap-2'>
                    <CircleUserRoundIcon width={20} height={20} />
                    <Text className='font-semibold' size={"4"}>Personal Information</Text>
                </div>
                {mode === "view" ? (
                    <Button variant='solid' className='flex items-center justify-start' onClick={handleEdit}>
                        <PencilIcon width={16} height={16} />
                        Edit
                    </Button>
                ) : (
                    <div className='flex gap-2'>
                        <Button color='red' variant='solid' className='flex items-center justify-start' onClick={handleCancel}>
                            <X width={16} height={16} />
                            Cancel
                        </Button>
                        <Button
                            variant='surface'
                            className='flex items-center justify-start'
                            onClick={handleSave}
                            disabled={loading}
                            loading={loading}
                        >
                            <SaveIcon width={16} height={16} />
                            Save
                        </Button>
                    </div>
                )}
            </div>

            <div className='flex items-center w-full gap-8'>
                <div className='flex-col mb-2 gap-1 flex flex-grow'>
                    <Text className='font-semibold' size={"3"}>First Name</Text>
                    {mode === "edit" ? (
                        <Input
                            className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                            value={editedData.user.first_name || ""}
                            onChange={(e) => updateUser("first_name", e.target.value)}
                        />
                    ) : (
                        <Text className='italic' size={"3"}>{displayData.user.first_name}</Text>
                    )}
                </div>
                <div className='flex-col mb-2 gap-1 flex flex-grow'>
                    <Text className='font-semibold' size={"3"}>Last Name</Text>
                    {mode === "edit" ? (
                        <Input
                            className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                            value={editedData.user.last_name || ""}
                            onChange={(e) => updateUser("last_name", e.target.value)}
                        />
                    ) : (
                        <Text className='italic' size={"3"}>{displayData.user.last_name}</Text>
                    )}
                </div>
            </div>

            <div className='flex items-center mt-6 mb-1 gap-2'>
                <Text className='font-semibold' size={"3"}>Instructor Description</Text>
            </div>
            {mode === "edit" ? (
                <Textarea
                    className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                    value={editedData.instructor.description || ""}
                    onChange={(e) => updateInstructor("description", e.target.value)}
                />
            ) : (
                <Text className='italic' size={"3"}>{displayData.instructor.description}</Text>
            )}

            <div className='flex items-center mt-6 mb-1 gap-2'>
                <Text className='font-semibold' size={"3"}>Email Address</Text>
            </div>
            {mode === "edit" ? (
                <Input
                    className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                    value={editedData.user.email || ""}
                    onChange={(e) => updateUser("email", e.target.value)}
                />
            ) : (
                <Text className='italic' size={"3"}>{displayData.user.email}</Text>
            )}

            <div className='flex items-center mt-6 mb-1 gap-2'>
                <Text className='font-semibold' size={"3"}>Phone Number</Text>
            </div>
            {mode === "edit" ? (
                <Input
                    className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                    value={editedData.instructor.phone_number || ""}
                    onChange={(e) => updateInstructor("phone_number", e.target.value)}
                    onBlur={(e) => handlePhoneBlur(e.target.value)}
                />
            ) : (
                <Text className='italic' size={"3"}>{displayData.instructor.phone_number}</Text>
            )}

            <div className='flex items-center mt-6 mb-1 gap-2'>
                <Text className='font-semibold' size={"3"}>Primary Address</Text>
            </div>
            {mode === "edit" ? (
                <div className='mb-2'>
                    <AutoComplete
                        searchValue={searchValue}
                        onSearchValueChange={setSearchValue}
                        selectedValue={editedData.instructor.street_address}
                        onSelectedValueChange={(s) => updateInstructor("street_address", s)}
                        items={addressItems.map((item) => ({ label: item.description, value: item.description }))}
                        placeholder='Enter address'
                    />
                </div>
            ) : (
                <Text className='italic' size={"3"}>{displayData.instructor.street_address}</Text>
            )}

            <div className='flex items-center mt-6 mb-1 gap-2'>
                <Text className='font-semibold' size={"3"}>Date of Birth</Text>
            </div>
            {mode === "edit" ? (
                <input
                    type='date'
                    className='h-10 w-full rounded-md border border-input bg-background py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-0 focus-visible:ring-0 mb-2 block'
                    value={editedData.user.birthday || ""}
                    onChange={(e) => updateUser("birthday", e.target.value)}
                />
            ) : (
                <Text className='italic' size={"3"}>{displayData.user.birthday}</Text>
            )}
        </form>
    );
};

export default TeacherDetails;