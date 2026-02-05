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

import { useUser } from "@clerk/nextjs";
import { CourseDetails, TimeSlot } from "@/app/types";

type Props = {
	tallyID?: string;
	price: string;
	courseName: string;
	availability: any[];
	children: React.ReactNode;
	flexible?: boolean;
};

const ClassDetails = (props: Props) => {
	const [selected, setSelected] = React.useState<number[]>([]);

	return (
		<Card variant="classic" className="flex flex-col p-6 mb-8 w-full overflow-hidden">
			<Heading align={"left"} size={"5"}>
				Book Class
			</Heading>
			<div className="w-full flex justify-between items-center my-2">
				<Text weight={"bold"}>
					Pricing
				</Text>
				<Text>
					${props.price || "0"}/class
				</Text>
			</div>
			{/* {props.flexible ? (
				<Text color="gray">{"Flexible Times"}</Text>
			) : (

				<Text color="gray">{openClasses + " sections available"}</Text>
			)} */}
			<Separator size={"4"} className="mb-3" />
			{props.children}
		</Card>
	);
};

export default ClassDetails;
