import { Card, Heading, Text, Separator } from '@radix-ui/themes'
import { LiaExternalLinkAltSolid } from 'react-icons/lia'
import { BsTelephoneOutbound } from 'react-icons/bs'
import { MdOutlineDirections } from 'react-icons/md'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'

type Props = {
    orgID: string
}

type OrganizationResponse = {
    description: string;
    id: number;
    image1_link: string;
    name: string;
    pfp_link: string;
    rating: number;
};

// Not in Use
const OrgDetails = (props: Props) => {
    const { data, error, isLoading, isSuccess } = useQuery({
        queryKey: ["org", props.orgID],
        queryFn: async () => {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/organizations/orgByID/` + props.orgID);
            return response.data as OrganizationResponse
        },
        staleTime: Infinity,
    });

    if (isLoading || error) return;

    return (
        <Card variant="classic" className="p-6 mb-8 w-full">
            <Heading align={"left"} size={"5"} className="mb-0">
                Organization Details
            </Heading>
            <Text className="mb-4"> {isSuccess && data.name}</Text>
            <Link href={data?.pfp_link as string}>
                <div className="w-full flex justify-between items-center hover:bg-gray-200 rounded-lg">
                    <Text size={"4"} wrap={"wrap"} className="m-2 flex-shrink overflow-hidden whitespace-nowrap text-overflow-ellipsis">
                        {isSuccess && data.pfp_link}
                    </Text>
                    <LiaExternalLinkAltSolid className="flex-shrink-0" size={24} />
                </div>
            </Link>
            <Separator className="my-2" size="4" />
            <div className="w-full flex justify-between items-center">
                <Text size={"4"} wrap={"wrap"} className="m-2 flex-shrink">
                    {isSuccess && data.description}
                </Text>
                <BsTelephoneOutbound className="flex-shrink-0" size={20} />
            </div>
            <Separator className="my-2" size="4" />
            <div className="w-full flex justify-between items-center">
                <Text size={"4"} wrap={"wrap"} className="m-2 flex-shrink">
                    {isSuccess && data.pfp_link}
                </Text>
                <MdOutlineDirections className="flex-shrink-0" size={22} />
            </div>
        </Card>
    )
}

export default OrgDetails