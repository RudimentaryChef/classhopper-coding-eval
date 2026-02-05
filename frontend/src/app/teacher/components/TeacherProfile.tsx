import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Separator, Avatar, Button, Text, Spinner } from '@radix-ui/themes';
import { CircleUserRoundIcon, InboxIcon, PhoneCallIcon, MapPinnedIcon, SaveIcon, PencilIcon, ImagePlusIcon, CloudUploadIcon, Trash2Icon, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { createStripeAccount, createStripeAccountLink } from '@/app/utils/stripeactions';
import { toast } from 'sonner';
import { PlaceAutocompleteResult } from '@googlemaps/google-maps-services-js';
import { autocomplete } from '@/app/utils/google';
import { AutoComplete } from '@/components/ui/autocomplete';
import { formatPhoneNumber } from '@/app/utils/functions';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';

export default function TeacherProfile() {
    const [searchValue, setSearchValue] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const [addressItems, setAddressItems] = useState<PlaceAutocompleteResult[]>([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [teacherId, setTeacherId] = useState<number | null>(null);
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [pfpLink, setPfpLink] = useState<string | undefined>(undefined);
    const [fname, setFname] = useState('')
    const [lname, setLname] = useState('')
    const [dob, setDob] = useState('')
    const [email, setEmail] = useState('')
    const [description, setDescription] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { isSignedIn, user, isLoaded } = useUser()

    async function handleFileChange(event: any) {
        setUploadLoading(true)
        try {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const upload: any = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/cloud/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })

                console.log(upload.data.image_name)
                await axios.put(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/update?instructor_id=${teacherId}`, {
                    pfp_link: upload.data.image_name
                })
                setPfpLink(upload.data.image_name)
                toast.success("Profile picture updated successfully")
            } else {
                toast.error("Please select a file")
            }
        } catch (err) {
            toast.error("Error uploading file")
            console.log(err)
        }
        setUploadLoading(false)
    }

    function handleSubmit() {
        if (!phoneNumber || !selectedValue || !fname || !lname || !email || !dob || !description) {
            toast.error("Please fill all the fields")
            return
        }

        const instructorFormData = {
            phone_number: phoneNumber,
            street_address: selectedValue,
            description: description
        }

        const userFormData = {
            email: email,
            birthday: dob,
            first_name: fname,
            last_name: lname
        }

        const insUpdate = axios.put(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/update?instructor_id=${teacherId}`, instructorFormData)
        const userUpdate = axios.put(`${process.env.NEXT_PUBLIC_HOSTNAME}/users/update?user_id=${user?.id}`, userFormData)

        Promise.all([insUpdate, userUpdate]).then(() => {
            toast.success("Profile updated successfully")
            setMode("view")
        }).catch((err) => {
            toast.error("Error updating profile")
        })
    }

    useEffect(() => {
        const fetchPredictions = async () => {
            const predictions = await autocomplete(searchValue);
            setAddressItems(predictions ?? []);
        }

        fetchPredictions();
    }, [searchValue])

    useEffect(() => {
        async function fetchUserDetails() {
            setLoading(true)

            try {

                const teacher = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
                    user_id: user?.id
                })

                if (!teacher.data) {
                    throw new Error("No teacher found")
                }

                setTeacherId(teacher.data[0].id)
                const details = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/instructor_and_user/${teacher.data[0].id}`)
                const userDetails = details.data

                if (!userDetails) {
                    throw new Error("No user details found")
                }

                if (userDetails.instructor.phone_number) {
                    setPhoneNumber(formatPhoneNumber(userDetails.instructor.phone_number))
                }

                if (userDetails.instructor.street_address) {
                    setSearchValue(userDetails.instructor.street_address)
                    setSelectedValue(userDetails.instructor.street_address)
                }

                if (userDetails.instructor.description) {
                    setDescription(userDetails.instructor.description)
                }

                if (userDetails.user.first_name) {
                    setFname(userDetails.user.first_name)
                }

                if (userDetails.user.last_name) {
                    setLname(userDetails.user.last_name)
                }

                if (userDetails.user.email) {
                    setEmail(userDetails.user.email)
                }

                if (userDetails.user.birthday) {
                    setDob(userDetails.user.birthday)
                }

                if (userDetails.instructor.pfp_link) {
                    setPfpLink(userDetails.instructor.pfp_link)
                }

            } catch (error) {
                console.log(error)
                toast.error("Something went wrong. Please try again later.")
            }
            setLoading(false)
        }

        if (isLoaded && isSignedIn && user) {
            fetchUserDetails();
        }
    }, [isLoaded, isSignedIn, user])

    return (
        <div className='flex-1 lg:max-w-[1024px] px-8 overflow-y-scroll'>
            <div className='flex flex-col mt-8'>
                <h3 className='text-lg font-medium'>Profile</h3>
                <p className='text-sm text-muted-foreground'>
                    Update your profile information.
                </p>
            </div>
            <Separator size={"4"} className='my-8' />
            {loading ?
                <div className='w-full flex items-center justify-center h-80'>
                    <Spinner size={'3'} />
                </div>
                :
                (
                    <>
                        <div className='p-6 shadow-sm border mb-8 rounded-md'>
                            <div className='flex-col'>
                                <div className='flex items-center justify-start gap-2'>
                                    <ImagePlusIcon width={20} height={20} />
                                    <Text className='font-semibold' size={"4"}>Profile Picture</Text>
                                </div>
                                <div className='flex items-center justify-start gap-4 mt-4'>
                                    <Avatar size={"6"} fallback="A" src={`https://storage.googleapis.com/imagestorageclasshopper/${pfpLink}`} color="cyan" variant="solid" className='mr-4' radius="full" />
                                    <input type='file' hidden ref={fileInputRef} onChange={handleFileChange} />
                                    <Button size={'3'} variant='soft' className='flex items-center justify-start gap-2'
                                        onClick={() => fileInputRef.current?.click()}
                                        loading={uploadLoading}
                                    >
                                        <CloudUploadIcon width={16} height={16} />
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <form className='flex flex-col border rounded-md p-6 shadow-sm' onSubmit={e => e.preventDefault()} >
                            <div className='flex items-center justify-between mb-8'>
                                <div className='flex items-center justify-start gap-2'>
                                    <CircleUserRoundIcon width={20} height={20} />
                                    <Text className='font-semibold' size={"4"}>Personal Information</Text>
                                </div>
                                {mode === "view" ?
                                    <Button variant='solid' className='flex items-center justify-start' onClick={() => setMode("edit")}>
                                        <PencilIcon width={16} height={16} />
                                        Edit
                                    </Button> :
                                    <div className='flex gap-2'>
                                        <Button color='red' variant='solid' className='flex items-center justify-start' onClick={() => setMode("view")}>
                                            <X width={16} height={16} />
                                            Cancel
                                        </Button>
                                        <Button variant='surface' className='flex items-center justify-start' onClick={handleSubmit} loading={loading} disabled={loading}>
                                            <SaveIcon width={16} height={16} />
                                            Save
                                        </Button>
                                    </div>
                                }
                            </div>

                            <div className='flex items-center w-full gap-8'>
                                <div className='flex-col mb-2 gap-1 flex flex-grow'>
                                    <Text className='font-semibold' size={"3"}>First Name</Text>
                                    {mode === "edit" ?
                                        <Input className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                                            value={fname} onChange={(e) => setFname(e.target.value)}
                                        /> :
                                        <Text className='italic' size={"3"}>{fname}</Text>
                                    }
                                </div>
                                <div className='flex-col mb-2 gap-1 flex flex-grow'>
                                    <Text className='font-semibold' size={"3"}>Last Name</Text>
                                    {mode === "edit" ?
                                        <Input className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                                            value={lname} onChange={(e) => setLname(e.target.value)}
                                        /> :
                                        <Text className='italic' size={"3"}>{lname}</Text>
                                    }
                                </div>
                            </div>
                            {/* <Text color='gray' size={"3"}>A short, one sentence intro to your class.</Text> */}

                            <div className='flex items-center mt-6 mb-1 gap-2'>
                                <Text className='font-semibold' size={"3"}>Instructor Description</Text>
                            </div>
                            {mode === "edit" ?
                                <Textarea className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                /> :
                                <Text className='italic' size={"3"}>{description}</Text>

                            }

                            <div className='flex items-center mt-6 mb-1 gap-2'>
                                <Text className='font-semibold' size={"3"}>Email Address</Text>
                            </div>
                            {mode === "edit" ?
                                <Input className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                /> :
                                <Text className='italic' size={"3"}>{email}</Text>

                            }
                            {/* <Text color='gray' size={"3"}>A short, one sentence intro to your class.</Text> */}

                            <div className='flex items-center mt-6 mb-1 gap-2'>
                                <Text className='font-semibold' size={"3"}>Phone Number</Text>
                            </div>
                            {mode === "edit" ?
                                <Input className='focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    onBlur={(e) => {
                                        const formatted = formatPhoneNumber(e.target.value)

                                        if (formatted === "invalid") {
                                            toast.error("Please enter a valid phone number.")
                                            setPhoneNumber("")
                                        }

                                        setPhoneNumber(formatted)
                                    }}
                                /> :
                                <Text className='italic' size={"3"}>{phoneNumber}</Text>
                            }

                            <div className='flex items-center mt-6 mb-1 gap-2'>
                                <Text className='font-semibold' size={"3"}>Primary Address</Text>
                            </div>
                            {mode === "edit" ?
                                <div className='mb-2'>
                                    <AutoComplete
                                        searchValue={searchValue}
                                        onSearchValueChange={setSearchValue}
                                        selectedValue={selectedValue}
                                        onSelectedValueChange={setSelectedValue}
                                        items={addressItems.map((item) => ({ label: item.description, value: item.description }))}
                                        placeholder=''
                                    />
                                </div> :
                                <Text className='italic' size={"3"}>{selectedValue}</Text>
                            }

                            {/* <Text color='gray' size={"3"}>A short, one sentence intro to your class.</Text> */}

                            <div className='flex items-center mt-6 mb-1 gap-2'>
                                <Text className='font-semibold' size={"3"}>Date of Birth</Text>
                            </div>
                            {mode === "edit" ?
                                <input type='date' className='h-10 w-full rounded-md border border-input bg-background py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-0 focus-visible:ring-0 mb-2 block'
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                /> :
                                <Text className='italic' size={"3"}>{dob}</Text>
                            }
                        </form>
                    </>)
            }

        </div>
    )
}


{/* <Separator size={"4"} className='my-3' />
            <h3 className='text-lg font-medium'>Finances</h3>
            <p className='text-sm text-muted-foreground'>Manage your financials with Stripe Banking.</p>
            <Button className='my-8'
                onClick={stripeConnect}
                loading={accountCreatePending}
            >
                Connect
            </Button> */}