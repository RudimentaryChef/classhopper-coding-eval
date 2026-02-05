"use client";
import { Dialog, Text, VisuallyHidden } from "@radix-ui/themes";
import TallyEmbed from "./TallyEmbed";
import { useState } from "react";

type TallyComponentProps = {
	link: string;
	children: React.ReactNode;
	courseName: string;
	title?: string
};

const TallyComponent = ({
	link,
	courseName,
	children,
	title
}: TallyComponentProps) => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Dialog.Root open={open} onOpenChange={() => setOpen(!open)}>
				<Dialog.Trigger>{children}</Dialog.Trigger>
				<Dialog.Content>

					<Dialog.Title><Text size={"7"}>{title ? title : "Register"}</Text></Dialog.Title>
					<VisuallyHidden asChild>
						<Dialog.Description>tally register form</Dialog.Description>
					</VisuallyHidden>
					<TallyEmbed
						tallyID={link as string}
						courseName={courseName}
					/>
				</Dialog.Content>
			</Dialog.Root>
		</>
	);
};

export default TallyComponent;
