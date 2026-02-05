"use client";
import {
	Dialog,
	Button,
	Flex,
	TextField,
	Text,
	RadioCards,
} from "@radix-ui/themes";
import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import axios from "axios";
import "dotenv/config";

const FormPopup = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("");

	const handleSubmit = async (name: string, email: string, role: string) => {
		console.log(name, email, role);

		try {
			const res = await axios.post(
				`${process.env.NEXT_PUBLIC_HOSTNAME}/users`,
				{
					name,
					email,
					status: role,
				}
			);
			console.log(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<Dialog.Root>
			<Dialog.Trigger>
				<Button
					size="4"
					className="rounded-2xl min-w-52 flex items-center justify-between cursor-pointer"
					variant="surface"
				>
					Post a Class
					<IoIosArrowForward />
				</Button>
			</Dialog.Trigger>

			<Dialog.Content
				maxWidth="450px"
				size={"4"}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<Dialog.Title>Join Us!</Dialog.Title>
				<Dialog.Description size="2" mb="4">
					Receive the latest updates on our services.
				</Dialog.Description>

				<Flex direction="column" gap="3">
					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							Name
						</Text>
						<TextField.Root
							placeholder="Enter your full name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</label>
					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							Email
						</Text>
						<TextField.Root
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</label>

					<RadioCards.Root
						columns={"2"}
						className="my-5"
					>
						<RadioCards.Item
							value="1"
							onClick={() => setRole("Student")}
						>
							<Flex direction="column" width="100%">
								<Text weight="bold">Student</Text>
							</Flex>
						</RadioCards.Item>
						<RadioCards.Item
							value="2"
							onClick={() => setRole("Teacher")}
						>
							<Flex direction="column" width="100%">
								<Text weight="bold">Instructor</Text>
							</Flex>
						</RadioCards.Item>
					</RadioCards.Root>
				</Flex>

				<Flex gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</Dialog.Close>
					<Dialog.Close>
						<Button onClick={() => handleSubmit(name, email, role)}>
							Save
						</Button>
					</Dialog.Close>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default FormPopup;
