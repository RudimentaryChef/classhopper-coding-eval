import { Text, Heading, Separator, IconButton, Button, Checkbox } from '@radix-ui/themes';
import { PlusIcon, X, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import TimeSlotPopup from '@/app/components/TimeSlotPopup';
import Dropzone from '@/components/ui/dropzone';
import React, { useEffect, useState } from 'react';
import { DollarSignIcon, CalendarIcon, Clock, ArrowRight, UsersRoundIcon, Repeat, MapPinIcon, CalendarCogIcon, WaypointsIcon, SendIcon, EllipsisVerticalIcon } from 'lucide-react';
import { PhotoProvider, PhotoSlider, PhotoView } from 'react-photo-view';
import { BookTypeIcon, NotepadText, ImagePlusIcon, ImagesIcon, ImageOffIcon, SaveIcon, Trash2Icon, CirclePlayIcon, GlobeIcon } from 'lucide-react';
import 'react-photo-view/dist/react-photo-view.css';
import { CourseDetails, TimeSlot } from '@/app/types';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { AutoComplete } from '@/components/ui/autocomplete';
import { autocomplete } from '@/app/utils/google';
import { PlaceAutocompleteResult } from '@googlemaps/google-maps-services-js';
import { createTeacher } from '@/app/utils/actions';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatImgLink, parseCourseDetails } from '@/app/utils/functions';
import { useSearchParams } from 'next/navigation';


type MyClassesProps = {
    selected: string
    setSelected: React.Dispatch<React.SetStateAction<string>>
}

const numToDay: { [key: number]: string } = {
    0: "Mo",
    1: "Tu",
    2: "We",
    3: "Th",
    4: "Fr",
    5: "Sa",
    6: "Su"
}

export default function CreateClass({ selected, setSelected }: MyClassesProps) {
    const searchParams = useSearchParams();
    const class_id = searchParams.get('class_id');

    const [thumbnail, setThumbnail] = useState<File[]>([]);
    const [additionalPictures, setAdditionalPictures] = useState<File[]>([]);
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(false);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [price, setPrice] = useState<number | undefined>(undefined);
    const [minAge, setMinAge] = useState<number | undefined>(undefined);
    const [searchValue, setSearchValue] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [addressItems, setAddressItems] = useState<PlaceAutocompleteResult[]>([]);
    const [online, setOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [classLoading, setClassLoading] = useState(false);

    const { user } = useUser();

    useEffect(() => {

        const fetchPredictions = async () => {
            const predictions = await autocomplete(searchValue);
            setAddressItems(predictions ?? []);
        }

        fetchPredictions();

    }, [searchValue])

    useEffect(() => {
        async function fetchClass() {
            setClassLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_HOSTNAME}/courses/` +
                    class_id
                );

                const courseInfo: CourseDetails = parseCourseDetails(response.data);
                console.log(courseInfo)

                setTitle(courseInfo.course_Name);
                setDescription(courseInfo.description);
                setPrice(Number(courseInfo.course_Price));
                setOnline(courseInfo.online);
                setSelectedValue(courseInfo.address);
                setMinAge(Number(courseInfo.minimum_age));
                setTimeSlots([...courseInfo.section]);

                // setThumbnail([new File([formatImgLink(courseInfo.image_1_Link)], "thumbnail.jpg")]);
                // setAdditionalPictures([new File([forcourseInfo.image_2_Link], "additional.jpg")]);

                // if (courseInfo.)

            } catch (error) {
                console.log(error);
            }
            setClassLoading(false);
        }

        if (class_id) fetchClass()
    }, [class_id])


    async function handleSubmit() {
        if (class_id) {
            toast.error("edit")
            return
        }

        if (title.length === 0) {
            toast.error("Please enter a title");
            return
        }

        if (description.length < 10) {
            toast.error("Please enter a description longer than 10 characters.");
            return
        }

        if (thumbnail.length === 0) {
            toast.error("Please upload a thumbnail");
            return
        }

        if (additionalPictures.length === 0) {
            toast.error("Please upload at least one additional picture");
            return
        }

        if (timeSlots.length === 0) {
            toast.error("Please add at least one time slot");
            return
        }

        if (price === undefined) {
            toast.error("Please enter a price");
            return
        }

        if (minAge === undefined) {
            toast.error("Please enter a minimum age");
            return
        }

        if (!online || (selectedValue === "")) {
            toast.error("Please enter a valid location");
            return
        }

        setLoading(true);
        try {
            const fd1 = new FormData();
            fd1.append("file", thumbnail[0]);

            const fd2 = new FormData();
            fd2.append("file", additionalPictures[0]);


            const upload: any = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/cloud/upload`, fd1, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            const upload2: any = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/cloud/upload`, fd2, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })




            const image_1_Link = upload.data.image_name
            const image_2_Link = upload2.data.image_name

            const res: any = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
                user_id: user?.id
            })

            let t_id: number;
            if (res.data.length === 0) {
                t_id = await createTeacher()
                if (t_id < 0) {
                    toast.error("Something went wrong. Please try again later.");
                    return
                }
            } else {
                t_id = res.data[0].id
            }


            const created = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/course/create`, {
                course_Name: title,
                description: description,
                instructor_id: t_id,
                address: selectedValue,
                visibility: false,
                online: online,
                image_1_Link: image_1_Link,
                image_2_Link: image_2_Link,
                course_Price: price,
                minimum_age: minAge
            })
            const c_id = created.data.course_ID

            for (const ts of timeSlots) {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/timeslot/create`, {
                    description: ts.description,
                    spots: ts.spots,
                    dtstart: ts.dtstart?.toISOString(),
                    dtend: ts.dtend?.toISOString(),
                    rrule_string: ts.rrule ? ts.rrule.toLocaleString() : null,
                    exdates: [],
                    rdates: ts.rdates,
                    course_id: c_id,
                    visible: true,
                    flexible: ts.flexible
                })

                console.log({
                    description: ts.description,
                    spots: ts.spots,
                    dtstart: ts.dtstart?.toISOString(),
                    dtend: ts.dtend?.toISOString(),
                    rrule_string: ts.rrule ? ts.rrule.toLocaleString() : null,
                    exdates: [],
                    rdates: ts.rdates,
                    course_id: c_id,
                    visible: true,
                    flexible: ts.flexible
                })
            }

            setLoading(false);
            setSelected('Classes');
            toast.success("Class created successfully!");
        } catch (error) {
            setLoading(false);
            console.log(error)
        }

    }



    return (
        <div className='h-full w-full overflow-y-scroll mt-4'>
            <div className='h-full px-6 md:px-8 flex flex-col max-w-[1024px] bg-white relative'>
                <div className="md:flex items-center justify-between max-w-[1024px] w-full sticky top-0 bg-white z-10 py-6 border-b border-gray-200 hidden">
                    <div className="flex gap-4 flex-grow min-w-0">
                        <div className="w-36 h-20 bg-slate-200 rounded-md flex items-center justify-center shrink-0">
                            {thumbnail.length > 0 ? (
                                <img src={URL.createObjectURL(thumbnail[0])} alt="thumbnail" className="w-full h-full object-cover rounded-md" />
                            ) : (
                                <ImageOffIcon width={28} height={28} className="text-muted" />
                            )}
                        </div>
                        <div className="flex flex-col flex-grow min-w-0 pr-4">
                            <Heading as="h1" size={"8"} className={`${!title ? "text-gray-300" : ""} `}>
                                {!title ? "Class Title Here" : title}
                            </Heading>
                            <Text className={`${description === "" ? "text-gray-200" : "text-gray-500"} ml-[2px] truncate max-w-full`}>
                                {!description ? "enter a description" : description}
                            </Text>
                        </div>
                    </div>
                    <div className='flex gap-2 flex-col'>
                        <Button variant='surface' className='flex items-center justify-start' onClick={handleSubmit} loading={loading} disabled={loading}>
                            <SaveIcon width={16} height={16} />
                            Save
                        </Button>
                        <Button color='red' variant='solid' className='flex items-center justify-start' onClick={() => setSelected('Classes')}>
                            <Trash2Icon width={16} height={16} />
                            Delete
                        </Button>
                    </div>
                </div>
                <div className='md:hidden flex items-center max-w-[1024px] w-full sticky top-0 bg-white z-10 py-4 border-b border-gray-200'>
                    <div className="w-[108px] h-[60px] bg-slate-200 rounded-md flex items-center justify-center shrink-0 mr-4">
                        {thumbnail.length > 0 ? (
                            <img src={URL.createObjectURL(thumbnail[0])} alt="thumbnail" className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <ImageOffIcon width={28} height={28} className="text-muted" />
                        )}
                    </div>
                    <div className='flex flex-col min-w-0 flex-grow'>
                        <Heading as="h1" size={"5"} className={`${!title ? "text-gray-300" : ""} line-clamp-2`}>
                            {!title ? "Class Title" : title}
                        </Heading>
                        <Text size={"2"} className={`${description === "" ? "text-gray-200" : "text-gray-500"} ml-[2px] truncate max-w-full`}>
                            {!description ? "enter a description" : description}
                        </Text>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant='ghost' className='flex items-center justify-center rounded-full'>
                                <EllipsisVerticalIcon width={20} height={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* <DropdownMenuLabel>Class Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator /> */}
                            <DropdownMenuItem onClick={handleSubmit} disabled={loading}>
                                <SaveIcon width={16} height={16} />
                                Save
                            </DropdownMenuItem>
                            <DropdownMenuItem className='flex items-center justify-start' onClick={() => setSelected('Classes')}>
                                <Trash2Icon width={16} height={16} />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className='flex flex-col pb-8'>
                    <div className='flex items-center mt-8 mb-2 gap-2'>
                        <BookTypeIcon width={20} height={20} />
                        <Text className='font-semibold' size={"4"}>Title</Text>
                    </div>
                    <Input className='font-semibold focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Text color='gray' size={"3"}>A short, one sentence intro to your class.</Text>

                    <div className='mt-8 mb-2 gap-2 flex items-center'>
                        <NotepadText width={20} height={20} />
                        <Text className='font-semibold' size={"4"}>Description</Text>
                    </div>
                    <Textarea className='mt-1 focus-visible:ring-offset-0 focus-visible:ring-0 mb-2'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Text color='gray' size={"3"} className=''>Describe your class in a few sentences.</Text>

                    <div className='mt-8 mb-2 gap-2 flex items-center'>
                        <ImagePlusIcon width={20} height={20} />
                        <Text className='font-semibold' size={"4"}>Thumbnail</Text>
                    </div>
                    <Dropzone fileLimit={1} onFilesAccepted={(f: File[]) => setThumbnail(f)} className='mb-2' />
                    <Text color='gray' size={"3"} className=''>An image that should represent your class and attract users.</Text>
                    <div className='flex flex-row gap-2'>
                        {thumbnail.map((file, i) => (
                            <div key={i} className='flex flex-col gap-2 mt-2'>
                                <div className='w-52 h-12 object-cover rounded-md border border-gray-300 relative flex flex-row items-center justify-start gap-2 px-2 cursor-pointer select-none hover:bg-muted'>
                                    <IconButton radius='full' variant='ghost' className='absolute top-1 right-1 w-4 h-4' onClick={(e) => {
                                        e.stopPropagation();
                                        setThumbnail([])
                                    }}>
                                        <X width={12} height={12} />
                                    </IconButton>


                                    <ImageIcon width={24} height={24} className='flex-shrink-0' />
                                    <Text size={"2"} truncate>{file.name}</Text>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='mt-8 mb-2 gap-2 flex items-center'>
                        <ImagesIcon width={20} height={20} />
                        <Text className='font-semibold' size={"4"}>Additional Pictures</Text>
                    </div>
                    <Dropzone fileLimit={3} onFilesAccepted={(f: File[]) => setAdditionalPictures(f)} className='mb-2' />
                    <Text color='gray' size={"3"} className=''>Additional images for users to view.</Text>
                    <div className='flex flex-row gap-2'>
                        {additionalPictures.map((file, i) => (
                            <div key={i} className='flex flex-col gap-2 mt-2' onClick={() => {
                                setIdx(i);
                                setVisible(true);
                            }}>
                                <div className='w-52 h-12 object-cover rounded-md border border-gray-300 relative flex flex-row items-center justify-start gap-2 px-2 cursor-pointer select-none hover:bg-muted'>
                                    <IconButton radius='full' variant='ghost' className='absolute top-1 right-1 w-4 h-4' onClick={(e) => {
                                        e.stopPropagation();
                                        const files = additionalPictures.filter((f, index) => index !== i);
                                        setAdditionalPictures(files);
                                    }}>
                                        <X width={12} height={12} />
                                    </IconButton>


                                    <ImageIcon width={24} height={24} className='flex-shrink-0' />
                                    <Text size={"2"} truncate>{file.name}</Text>
                                </div>
                            </div>
                        ))}
                    </div>
                    <PhotoSlider
                        images={additionalPictures.map((f, idx) => ({ src: URL.createObjectURL(f), key: idx }))}
                        visible={visible}
                        onClose={() => setVisible(false)}
                        index={idx}
                        onIndexChange={setIdx}
                    />
                    <div className='mt-8 mb-2 gap-2 flex items-center'>
                        <CalendarCogIcon width={20} height={20} />
                        <Text className='font-semibold' size={"4"}>Sections</Text>
                    </div>
                    <div className='flex gap-2 mt-2 overflow-x-auto'>
                        <AddTimeSlot timeSlots={timeSlots} setTimeSlots={setTimeSlots} />
                        {timeSlots.map((timeSlot, i) => (
                            <ViewTimeSlot key={i} timeSlot={timeSlot} idx={i} handleDelete={() => {
                                const slots = timeSlots.filter((slot, index) => index !== i);
                                setTimeSlots(slots);
                            }} />
                        ))}
                    </div>
                    <div className='mt-8 mb-2 gap-2 flex items-center'>
                        <MapPinIcon width={20} height={20} />
                        <Text className='font-semibold' size={"4"}>Location</Text>
                    </div>
                    <div className='mb-2 flex items-center'>
                        <AutoComplete
                            searchValue={searchValue}
                            onSearchValueChange={setSearchValue}
                            selectedValue={selectedValue}
                            onSelectedValueChange={setSelectedValue}
                            items={addressItems.map((item) => ({ label: item.description, value: item.description }))}
                            placeholder=''
                            disabled={online}
                        />
                        <div className={`rounded-md border flex ml-4 items-center p-2 gap-1 h-full select-none cursor-pointer box-border border-gray-300 hover:bg-muted`}
                            onClick={() => {
                                setOnline(!online)
                                setSelectedValue('')
                                setSearchValue('')
                            }}
                        >
                            <div className={`flex items-center justify-between gap-1`}>
                                <GlobeIcon height={16} width={16} />
                                <Text className='font-semibold' size={"2"}>Online</Text>
                                <Checkbox size={"2"} className='ml-2 md:ml-3' checked={online} />
                            </div>
                        </div>
                    </div>
                    <Text color='gray' size={"3"} className=''>Enter the location where the class will be held.</Text>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-12 mt-8'>
                        <div>
                            <div className='mb-2'>
                                <Text className='font-semibold mt-8' size={"4"}>Price</Text>
                            </div>
                            <Input startIcon={DollarSignIcon} type='number' placeholder='Enter Amount' min={0} className='font-semibold focus-visible:ring-offset-0 focus-visible:ring-0'
                                onChange={(e) => setPrice(Number(e.target.value))}
                                value={price || ""}
                            />
                        </div>
                        <div>
                            <div className='mb-2'>
                                <Text className='font-semibold mt-8' size={"4"}>Minimum Age</Text>
                            </div>
                            <Input startIcon={CalendarIcon} type='number' placeholder='Enter Amount' min={0} max={100} className='font-semibold focus-visible:ring-offset-0 focus-visible:ring-0'
                                onChange={(e) => setMinAge(Number(e.target.value))}
                                value={minAge}
                            />
                        </div>
                    </div>
                    <div className='mt-12'>
                        <Button size={"3"} className='flex items-center justify-start' onClick={handleSubmit} loading={loading} disabled={loading}>
                            <SendIcon width={16} height={16} />
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ViewTimeSlot({ timeSlot, handleDelete, idx }: { timeSlot: TimeSlot, handleDelete: () => void, idx: number }) {

    const numToDay: { [key: number]: string } = {
        0: "Mo",
        1: "Tu",
        2: "We",
        3: "Th",
        4: "Fr",
        5: "Sa",
        6: "Su"
    }

    if (timeSlot.flexible) {
        return (
            <div className='flex w-[160px] h-[100px] border rounded-md relative p-2 flex-col flex-shrink-0'>
                <IconButton radius='full' variant='ghost' className='absolute top-1 right-1 w-4 h-4' onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                }}>
                    <X width={12} height={12} />
                </IconButton>
                <Text size={"3"} trim={"both"} className='mb-1'>{timeSlot.description}</Text>
                <div className='flex gap-1 items-center'>
                    <WaypointsIcon width={12} height={12} />
                    <Text size={"1"}>Flexible</Text>
                </div>
            </div>
        )
    }

    return (
        <div className='flex w-[160px] h-[100px] border rounded-md relative p-2 flex-col flex-shrink-0'>
            <Text size={"3"} trim={"both"} className='mb-1'>{timeSlot.description}</Text>
            {timeSlot.rrule ? (
                <div className='flex flex-col'>
                    <IconButton radius='full' variant='ghost' className='absolute top-1 right-1 w-4 h-4' onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}>
                        <X width={12} height={12} />
                    </IconButton>
                    <div className='flex gap-1 items-center'>
                        <UsersRoundIcon width={12} height={12} />
                        <Text size={"1"}>
                            {timeSlot.spots}
                        </Text>
                    </div>
                    <div className='flex gap-1 items-center'>
                        <CirclePlayIcon width={12} height={12} />
                        <Text size={"1"}>
                            {timeSlot.dtstart?.toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </Text>
                        <ArrowRight width={12} height={12} />
                        <Text size={"1"}>
                            {timeSlot.dtend?.toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </Text>
                    </div>
                    <div className='flex gap-1 items-center'>
                        <Clock width={12} height={12} className='flex-shrink-0' />
                        <div className='flex items-center gap-1'>
                            <Text size={"1"}>
                                {timeSlot.dtstart?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                            </Text>
                            <ArrowRight width={12} height={12} />
                            <Text size={"1"}>
                                {timeSlot.dtend?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                            </Text>
                        </div>
                    </div>
                    <div className='flex gap-1 items-center'>
                        <Repeat width={12} height={12} />
                        <Text size={"1"}>
                            {timeSlot.rrule.options.byweekday.map((day) => numToDay[day]).join(" ")}
                        </Text>
                    </div>

                </div>
            ) : (
                <div className='flex flex-col'>
                    <IconButton radius='full' variant='ghost' className='absolute top-1 right-1 w-4 h-4' onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}>
                        <X width={12} height={12} />
                    </IconButton>
                    <div className='flex gap-1 items-center'>
                        <UsersRoundIcon width={12} height={12} />
                        <Text size={"1"}>
                            {timeSlot.spots}
                        </Text>
                    </div>
                    <div className='flex gap-1 items-center'>
                        <CirclePlayIcon width={12} height={12} />
                        <Text size={"1"}>
                            {timeSlot.dtstart?.toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </Text>
                    </div>
                    <div className='flex gap-1 items-center'>
                        <Clock width={12} height={12} className='flex-shrink-0' />
                        <div className='flex items-center gap-1'>
                            <Text size={"1"}>
                                {timeSlot.dtstart?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                            </Text>
                            <ArrowRight width={12} height={12} />
                            <Text size={"1"}>
                                {timeSlot.dtend?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                            </Text>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

function AddTimeSlot({ timeSlots, setTimeSlots }: { timeSlots: TimeSlot[], setTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>> }) {
    return (
        <TimeSlotPopup timeSlots={timeSlots} setTimeSlots={setTimeSlots} onAdd={async () => { toast.error("old component not suppoerted") }}>
            <button className='flex items-center justify-center w-[160px] h-[100px] rounded-md border-dashed border-2 border-blue-400 flex-shrink-0'>
                <PlusIcon width={36} height={36} className='text-blue-400' />
            </button>
        </TimeSlotPopup>
    )
}
