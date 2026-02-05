"use client";
import axios from "axios";
import ClassCard from "../components/classdisplay/ClassCard";
import { Button, Heading, Text, TextField } from "@radix-ui/themes";
import Navbar from "../components/Navbar";
import { Separator } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { CourseDetails } from "../types";
import { handleLocationClick } from "../utils/functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import TallyComponent from "../components/tally/TallyComponent";
import { BsPlusCircle } from "react-icons/bs";
import Class2Card from "../components/classdisplay/Class2Card";

const Page = () => {
	const [coords, setCoords] = useState<[number | null, number | null]>([
		null,
		null,
	]);
	const [selected, setSelected] = useState<string | null>(null);
	const [search, setSearch] = useState<string>("");

	const classQuery = useQuery({
		queryKey: ["classes", coords[0], coords[1]],
		queryFn: async () => {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_HOSTNAME}/course/display/50`,
				{
					by: "None",
					latitude: coords[0],
					longitude: coords[1],
				}
			);
			// console.log(response.data);
			return response.data as CourseDetails[];
		},
		staleTime: Infinity,
	});

	const classByOrderQuery = useQuery({
		queryKey: ["classes", selected, coords[0], coords[1]],
		queryFn: async () => {
			// console.log(coords[0], coords[1]);

			let class_type = "both";
			if (selected === "online") {
				class_type = "online";
			} else if (selected == "location" && coords[0] && coords[1]) {
				class_type = "in_person";
			}

			// Bug 14: Wrong field name - backend expects "class_type" but frontend sends "classType" (camelCase vs snake_case)
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_HOSTNAME}/course/display/50`,
				{
					sorted: selected === "rating" ? "desc" : "asc",
					by: selected === "online" ? "None" : selected,
					latitude: coords[0],
					longitude: coords[1],
					classType: class_type,
				}
			);
			console.log(response.data);
			return response.data as CourseDetails[];
		},
		enabled: selected !== null,
		staleTime: Infinity,
	});

	return (
		<>
			<Navbar scrollable={true} fixed={false} />

			<div className="w-full py-4 mt-6 flex justify-center items-center z-10 sticky top-0 bg-inherit">
				<div className="w-[88rem] mx-auto px-8 gap-2 flex-col justify-between items-center">
					<div className="flex justify-between items-center">
						<Heading>Explore Classes</Heading>
						<div className="flex flex-row gap-4">
							<Button
								variant={
									selected === "location"
										? "solid"
										: "outline"
								}
								className="w-16 md:w-20"
								radius="full"
								onClick={() => {
									(async () => {
										if (!coords[0] || !coords[1]) {
											try {
												console.log("before");
												const coordsfrom =
													await axios.get(
														"https://ipapi.co/json/"
													);
												setCoords([
													coordsfrom.data.latitude,
													coordsfrom.data.longitude,
												]);
												console.log("after");
											} catch (error) {
												console.log(error);
											}
										}
										// console.log(coords[0], coords[1]);
										if (selected === "location") {
											setSelected(null);
										} else {
											setSelected("location");
										}
										// queryClient.invalidateQueries({
										// 	queryKey: ["classes"],
										// 	exact: true,
										// });
									})();
								}}
							>
								<span className="text-xs md:text-sm">
									location
								</span>
							</Button>
							<Button
								variant={
									selected === "rating" ? "solid" : "outline"
								}
								className="w-16 md:w-20"
								radius="full"
								onClick={() => {
									if (selected === "rating") {
										setSelected(null);
									} else {
										setSelected("rating");
									}
								}}
							>
								<span className="text-xs md:text-sm">
									rating
								</span>
							</Button>
							<Button
								variant={
									selected === "price" ? "solid" : "outline"
								}
								className="w-16 md:w-20"
								radius="full"
								onClick={() => {
									if (selected === "price") {
										setSelected(null);
									} else {
										setSelected("price");
									}
								}}
							>
								<span className="text-xs md:text-sm">
									price
								</span>
							</Button>
							<Button
								variant={
									selected === "online" ? "solid" : "outline"
								}
								className="w-16 md:w-20"
								radius="full"
								onClick={() => {
									if (selected === "online") {
										setSelected(null);
									} else {
										setSelected("online");
									}
								}}
							>
								<span className="text-xs md:text-sm">
									online
								</span>
							</Button>
						</div>
					</div>
					<div className="flex flex-row gap-4 mt-4 items-center">
						<TextField.Root
							size="3"
							className="w-full"
							placeholder="Search for classes..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							data-ps-mask="false"
						>
							<TextField.Slot>
								<MagnifyingGlassIcon height="16" width="16" />
							</TextField.Slot>
						</TextField.Root>



						{/* <TallyComponent link="mJJvyR" courseName="sign up">
							<Button className="h-[38px]" radius="large" variant="solid">Request class</Button>
						</TallyComponent> */}
					</div>
				</div>
			</div>
			<div className="w-full h-full flex justify-center items-center pt-1 mb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-[88rem] mx-auto px-8 gap-2 h-full">
					<TallyComponent link="mJJvyR" courseName="sign up" title="Request a Class">
						<Button
							variant="soft"
							className={`h-80 flex flex-col overflow-hidden items-center border-2 border-gray-300 rounded-md hover:border-blue-500 hover:shadow-lg p-4`}
						>
							<BsPlusCircle size={128} className="mt-8 mb-6" />
							<Text size={"4"} className="max-w-64">Click me if you can&apos;t find the class you want!</Text>
						</Button>
					</TallyComponent>

					{classQuery.isLoading || classByOrderQuery.isLoading ? (
						<Text className="ml-8">Loading...</Text>
					) : selected !== null && classByOrderQuery.isSuccess ? (
						classByOrderQuery.data.map((cls, i) => (
							<ClassCard key={i} classInfo={cls} />
						))
					) : classQuery.isSuccess && search === "" ? (
						classQuery.data.map((cls, i) => (
							<ClassCard key={i} classInfo={cls} />
						))
					) : (
						classQuery.isSuccess &&
						(classQuery.data.filter(
							(cls) =>
								cls.course_Name
									.toLowerCase()
									.includes(search.toLowerCase()) ||
								cls.description
									.toLowerCase()
									.includes(search.toLowerCase())
						).length > 0 ? (
							classQuery.data
								.filter(
									(cls) =>
										cls.course_Name
											.toLowerCase()
											.includes(search.toLowerCase()) ||
										cls.description
											.toLowerCase()
											.includes(search.toLowerCase())
								)
								.map((cls, i) => (
									<ClassCard key={i} classInfo={cls} />
								))
						) : (
							<Text>No classes found</Text>
						))
					)}
				</div>
			</div>
		</>
	);
};

export default Page;
