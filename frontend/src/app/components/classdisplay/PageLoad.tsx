import { HeartIcon, Share2Icon } from "@radix-ui/react-icons";
import {
	Skeleton,
	Heading,
	Text,
	Button,
	Separator,
	Avatar,
} from "@radix-ui/themes";

const PageLoad = () => {
	return (
		<div className={`flex items-center justify-center`}>
			<div className="mt-8 flex w-[88rem] mx-auto px-8">
				<div className="w-[70%] flex flex-col justify-start items-center">
					<div className="w-full flex justify-between items-center">
						<Skeleton>
							<Heading as="h2" size={"6"}>
								Lorem ipsum dolor sit.
							</Heading>
						</Skeleton>
						<div className="flex flex-row justify-center items-center gap-4">
							<Button variant="soft" radius="full">
								<div className="flex flex-row justify-center items-center">
									<Share2Icon />
									<Text className="ml-2" size="3">
										Share
									</Text>
								</div>
							</Button>
							<Button variant="soft" radius="full">
								<div className="flex flex-row justify-center items-center">
									<HeartIcon />
									<Text className="ml-2" size="3">
										Save
									</Text>
								</div>
							</Button>
						</div>
					</div>
					<Skeleton className="w-[88rem] max-h-[560px]" />
					<div className="flex justify-start items-center py-6 w-full">
						<Avatar
							size={"4"}
							fallback="A"
							src="h"
							color="cyan"
							variant="solid"
							className="mr-4"
							radius="full"
						/>
						<div className="flex flex-col">
							<Skeleton>
								<Text weight={"bold"} size={"4"}>
									Taught By Adi Krish
								</Text>
							</Skeleton>
							<Skeleton>
								<Text color="gray" size={"3"}>
									Professional GT Student
								</Text>
							</Skeleton>
						</div>
					</div>
					<Separator size={"4"} />
					<Skeleton>
						<Text className="mt-6 text-left w-full">
							Lorem ipsum dolor sit.
						</Text>
					</Skeleton>
				</div>
				<div className="w-[30%] flex flex-col items-start pl-8">
					<div className="sticky top-[24px] w-full mt-12">
						<Skeleton />
						<Skeleton />
					</div>
				</div>
			</div>
		</div>
	);
};

export default PageLoad;
