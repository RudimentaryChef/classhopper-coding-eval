"use client"
import React from "react";
import {
	Card,
	Heading,
	Text,
	Separator,
	Button,
	SegmentedControl,
} from "@radix-ui/themes";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { BsTelephoneOutbound } from "react-icons/bs";
import { MdOutlineDirections } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

type Props = {
	instructorID: number;
	courseAddress?: string;
	online: boolean;
};

type TeacherResponse = {
	description: string;
	id: number;
	image1_link: string;
	name: string;
	pfp_link: string;
	phone_number: string;
	rating: number;
	street_address: string;
	website_link: string;
};

const TeacherDetails = (props: Props) => {
	const { data, error, isLoading, isSuccess } = useQuery({
		queryKey: ["teacher", props.instructorID],
		queryFn: async () => {
			const response = await axios.get(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/instructorByID/` + props.instructorID);
			return response.data as TeacherResponse;
		},
		staleTime: Infinity,
	});

	if (isLoading || error) return;
	// console.log(data)

	return (
		<Card variant="classic" className="p-6 mb-8 w-full">
			<Heading align={"left"} size={"5"} className="mb-0">
				Course Details
			</Heading>
			<Text className="mb-4">{isSuccess && data.name}</Text>
			{/* {data?.website_link && (
				<Link href={data.website_link}>
					<div className="w-full flex justify-between items-center hover:bg-gray-200 rounded-lg">
						<Text size={"4"} wrap={"wrap"} className="m-2 flex-shrink overflow-hidden whitespace-nowrap text-overflow-ellipsis">
							{isSuccess && data.website_link}
						</Text>
						<LiaExternalLinkAltSolid className="flex-shrink-0" size={24} />
					</div>
				</Link>

			)}
			<Separator className="my-2" size="4" /> */}
			<Link href={`tel:${data?.phone_number as string}`}>
				<div className="w-full flex justify-between items-center hover:bg-gray-200 rounded-lg mt-2">
					<Text size={"4"} wrap={"wrap"} className="m-2">
						{isSuccess && data.phone_number}
					</Text>
					<BsTelephoneOutbound className="flex-shrink-0" size={20} />
				</div>
			</Link>
			<Separator className="my-2" size="4" />
			{props.online ? (
				<>
					{props.courseAddress ? (
						<Link href={`http://maps.google.com/?q=${props.courseAddress}`}>
							<div className="w-full flex justify-between items-center hover:bg-gray-200 rounded-lg">
								<Text size={"4"} wrap={"wrap"} className="m-2 flex-shrink overflow-hidden whitespace-nowrap text-overflow-ellipsis">
									{props.courseAddress}
								</Text>
								<MdOutlineDirections className="flex-shrink-0" size={22} />
							</div>
						</Link>
					) : (
						<Link href={`http://maps.google.com/?q=${data?.street_address as string}`}>
							<div className="w-full flex justify-between items-center hover:bg-gray-200 rounded-lg">
								<Text size={"4"} wrap={"wrap"} className="m-2 flex-shrink">
									{isSuccess && data.street_address}
								</Text>
								<MdOutlineDirections className="flex-shrink-0" size={22} />
							</div>
						</Link>
					)}
				</>
			) : (
				<div className="w-full flex justify-between items-center hover:bg-gray-200 rounded-lg">
					<Text size={"4"} wrap={"wrap"} className="m-2 flex-shrink">
						{"Online"}
					</Text>
					<MdOutlineDirections className="flex-shrink-0" size={22} />
				</div>
			)}
		</Card >
	);
};

export default TeacherDetails;
