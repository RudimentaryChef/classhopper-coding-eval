import Link from "next/link";
import Image from "next/image";
import { Heading, Text, Badge } from "@radix-ui/themes";
import { Separator } from "@radix-ui/themes";
import { CourseDetails } from "../../types";
import { useState } from "react";
import { GlobeIcon, StarFilledIcon } from "@radix-ui/react-icons";

const ClassCard = ({ classInfo }: { classInfo: CourseDetails }) => {
	const [imageLoaded, setImageLoaded] = useState(false);

	return (
		<Link href={`/explore/v2/${classInfo.course_ID}`}>
			<div
				className={`h-80 flex flex-col overflow-hidden items-start border-2 border-gray-300 rounded-md hover:border-blue-500 hover:shadow-lg relative`}
			>
				{classInfo.online && (
					<div className="absolute top-2 left-2 z-[2] rounded-xl">
						<Badge className="bg-blue-500 text-white shadow-md flex items-center gap-1 px-2 py-1">
							<GlobeIcon width={14} height={14} />
							<Text size="1" weight="bold">Online</Text>
						</Badge>
					</div>
				)}
				<div className="w-full h-[50%] bg-slate-300 overflow-hidden">
					<Image
						alt="class image"
						src={`https://storage.googleapis.com/imagestorageclasshopper/${classInfo.image_1_Link}`}
						width={"500"}
						height={"160"}
						priority
						onLoad={() => setImageLoaded(true)}
					/>
				</div>
				<div className="px-4 py-2 w-full flex flex-col justify-between h-[50%]">
					<div className="flex flex-col h-full">
						<div className="flex justify-between items-center w-full">
							<Heading
								as="h2"
								size={"6"}
								weight={"bold"}
								className="line-clamp-1"
							>
								{classInfo.course_Name || "Lorem ipsum"}
							</Heading>
							<div className="flex justify-center items-center">
								<Text
									size={"5"}
									weight={"bold"}
									color="gray"
									className="mr-1"
								>
									{classInfo.rating || "5.0"}
								</Text>
								<StarFilledIcon width={18} height={18} />
							</div>
						</div>
						<Text
							color="gray"
							className="mt-2 line-clamp-2"
							wrap={"pretty"}
						>
							{classInfo.description}
						</Text>
					</div>

					<div className="mt-4 flex items-center justify-between">
						<Heading as="h2" color="blue">
							${classInfo.course_Price || "0"}/class
						</Heading>
						<div className="flex flex-row items-center justify-start">
							<Text>{classInfo.address != null && classInfo.address}</Text>
							{classInfo.distance && (
								<>
									<Separator
										orientation={"vertical"}
										className="mx-2"
									/>
									<Badge className="shadow-sm">
										<Text size={"2"}>
											{Math.floor(classInfo.distance) +
												" mi"}
										</Text>
									</Badge>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default ClassCard;
