"use client"
import React from "react";
import { toast } from "sonner";
import { Dialog, Text, IconButton, Button } from "@radix-ui/themes";
import {
	Cross2Icon,
	CopyIcon,
	TwitterLogoIcon,
	DiscordLogoIcon,
	InstagramLogoIcon,
	ChatBubbleIcon,
	EnvelopeOpenIcon,
} from "@radix-ui/react-icons";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

type Props = {
	children: React.ReactNode;
	title: string;
	img: string;
};

const SharePopup = (props: Props) => {
	return (
		<Dialog.Root>
			<Dialog.Trigger>{props.children}</Dialog.Trigger>

			<Dialog.Content maxWidth="550px">
				<Dialog.Title className="mb-6">
					<div className="flex flex-row items-center justify-between">
						<Text size={"7"}>Share this class</Text>
						<Dialog.Close>
							<IconButton variant="ghost" radius="full">
								<Cross2Icon width={20} height={20} />
							</IconButton>
						</Dialog.Close>
					</div>
				</Dialog.Title>
				<Dialog.Description className="mb-6">
					<div className="flex flex-row items-center justify-start">
						<Image
							src={`https://storage.googleapis.com/imagestorageclasshopper/${props.img}`}
							width={64}
							height={64}
							className="w-16 h-16 rounded-sm object-cover"
							alt="class image"
						/>
						<Text size="4" className="ml-4 font-semibold">
							{props.title}
						</Text>
					</div>
				</Dialog.Description>

				{/* Main Content */}

				<div className="grid grid-cols-2 gap-4">
					<Button
						variant="outline"
						color="gray"
						className="h-12 rounded-xl px-4"
						onClick={() => {
							if (typeof window === "undefined") return;
							navigator.clipboard.writeText(
								window?.location.href
							);
							toast.success("Link copied to clipboard");
						}}
					>
						<div className="flex flex-row justify-start items-center w-full text-black">
							<CopyIcon height={20} width={20} className="mr-4" />
							<Text size={"3"} className="font-semibold">
								Copy Link
							</Text>
						</div>
					</Button>
					<Link
						target="_top"
						href={`sms://;?&body=Check out ${props.title
							} on Classhopper! Class Link: ${typeof window !== "undefined"
								? window?.location.href
								: ""
							}`}
						className="w-full"
					>
						<Button
							variant="outline"
							color="gray"
							className="h-12 rounded-xl px-4 w-full"
						>
							<div className="flex flex-row justify-start items-center w-full text-black">
								<ChatBubbleIcon
									height={20}
									width={20}
									className="mr-4"
								/>
								<Text size={"3"} className="font-semibold">
									Messages
								</Text>
							</div>
						</Button>
					</Link>
					<Link
						target="_top"
						href={`mailto:?subject=Check out ${props.title
							} on Classhopper!
                                &body=Link to Class: ${typeof window !== "undefined"
								? window?.location.href
								: ""
							}`}
						className="w-full"
					>
						<Button
							variant="outline"
							color="gray"
							className="h-12 rounded-xl px-4 w-full"
						>
							<div className="flex flex-row justify-start items-center w-full text-black">
								<EnvelopeOpenIcon
									height={20}
									width={20}
									className="mr-4"
								/>
								<Text size={"3"} className="font-semibold">
									Email
								</Text>
							</div>
						</Button>
					</Link>
					<Link
						href={"https://wa.me/?text=HELLO"}
						className="w-full h-full"
					>
						<Button
							variant="outline"
							color="gray"
							className="h-12 rounded-xl px-4 w-full"
						>
							<div className="flex flex-row justify-start items-center w-full text-black">
								<FaWhatsapp size={20} className="mr-4" />
								<Text size={"3"} className="font-semibold">
									Whatsapp
								</Text>
							</div>
						</Button>
					</Link>
					<Button
						variant="outline"
						color="gray"
						className="h-12 rounded-xl px-4"
					>
						<div className="flex flex-row justify-start items-center w-full text-black">
							<FaFacebook size={20} className="mr-4" />
							<Text size={"3"} className="font-semibold">
								Facebook
							</Text>
						</div>
					</Button>
					<Button
						variant="outline"
						color="gray"
						className="h-12 rounded-xl px-4"
					>
						<div className="flex flex-row justify-start items-center w-full text-black">
							<DiscordLogoIcon
								height={20}
								width={20}
								className="mr-4"
							/>
							<Text size={"3"} className="font-semibold">
								Discord
							</Text>
						</div>
					</Button>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default SharePopup;
