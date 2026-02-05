import React from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { HeartIcon, Share2Icon, ChevronLeftIcon } from "@radix-ui/react-icons";
import { Text } from "@radix-ui/themes";
import Link from "next/link";

type Props = {};

const MobileClassNavbar = (props: Props) => {
	return (
		<nav className="flex items-center justify-center h-16 w-full">
			<div className="flex w-[88rem] mx-auto justify-between items-center px-4">
				<Link href={"/choose"}>
					<div className="flex items-center justify-start h-full cursor-pointer">
						<FaChevronLeft size={16} className="mr-2" />
						{/* <ChevronLeftIcon width={20} height={20} className="mr-1" /> */}
						<Text className="font-semibold cursor-pointer hover:underline">
							Classes
						</Text>
					</div>
				</Link>
				<div className="flex items-center h-full">
					<HeartIcon width={20} height={20} className="mr-4" />
					<Share2Icon width={20} height={20} />
				</div>
			</div>
		</nav>
	);
};

export default MobileClassNavbar;
