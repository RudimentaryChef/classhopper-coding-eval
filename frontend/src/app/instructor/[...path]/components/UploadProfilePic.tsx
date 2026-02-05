"use client"
import { ImagePlusIcon, CloudUploadIcon } from 'lucide-react'
import React from 'react'
import { Avatar, Button, Text } from '@radix-ui/themes'
import axios from 'axios'
import { toast } from 'sonner'
import { formatImgLink } from '@/app/utils/functions'


type Props = {
    teacherId: string
    pfpLink: string
}
const UploadProfilePic = (props: Props) => {
    const [uploadLoading, setUploadLoading] = React.useState<boolean>(false)
    const [pfpLink, setPfpLink] = React.useState<string>(props.pfpLink)
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
                await axios.put(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/update?instructor_id=${props.teacherId}`, {
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

    return (
        <div className='p-6 shadow-sm border mb-8 rounded-md'>
            <div className='flex-col'>
                <div className='flex items-center justify-start gap-2'>
                    <ImagePlusIcon width={20} height={20} />
                    <Text className='font-semibold' size={"4"}>Profile Picture</Text>
                </div>
                <div className='flex items-center justify-start gap-4 mt-4'>
                    <Avatar size={"6"} fallback="A" src={formatImgLink(pfpLink)} color="cyan" variant="solid" className='mr-4' radius="full" />
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
    )
}

export default UploadProfilePic