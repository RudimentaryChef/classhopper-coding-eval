"use client";
import { Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RedirectToSignIn, SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

type NavbarProps = {
	scrollable: boolean;
	fixed?: boolean;
};

const Navbar = ({ scrollable, fixed }: NavbarProps) => {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	const router = useRouter();

	const handleScroll = () => {
		if (window.scrollY > 5) {
			setScrolled(true);
		} else {
			setScrolled(false);
		}
	};

	useEffect(() => {
		if (scrollable) {
			window.addEventListener("scroll", handleScroll);
		}
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [scrollable]);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<nav
			className={`flex items-center justify-center h-20 w-full
				${!scrollable ? "border-b border-gray-200 bg-white" : "border-gray-200 "}
				${fixed ? "fixed top-0 z-40" : "border-b"}
			`}
		>
			<div className="hidden lg:flex w-[88rem] mx-auto justify-between items-center px-8">
				<h1
					className="font-bold text-3xl cursor-pointer"
					onClick={() => router.push("/")}
				>
					Classhopper
				</h1>
				<ul className="flex items-center gap-4">
					<li className="flex justify-center items-center">
						{mounted ? (
							<>
								<SignedIn>
									<UserButton appearance={{
										elements: {
											avatarImage: 'h-50 w-50',
											rootBox: 'h-50 w-50',
										}
									}} />
								</SignedIn>
								<SignedOut>
									<SignInButton />
								</SignedOut>
							</>
						) : (
							<div className="h-10 w-10"></div>
						)}
					</li>
					<Link href={"/student"}>
						<li className="inline-block text-md">
							My Signups
						</li>
					</Link>
					<li className="inline-block text-lg">
						<Button
							size={"3"}
							className="text-md rounded-2xl cursor-pointer"
							onClick={() => router.push("/choose")}
						>
							Explore Classes
						</Button>
					</li>
					<li className="inline-block text-lg">
						<Button
							size={"3"}
							className="text-md rounded-2xl cursor-pointer"
							onClick={() => router.push("/instructor/classes")}
							variant="surface"
						>
							Teach a Class
						</Button>
					</li>
				</ul>
			</div>
			<div className="flex justify-between items-center w-full rounded-md px-8 py-4 lg:hidden">
				<Link href={"/"}>
					<h1 className="font-bold text-xl">Classhopper</h1>
				</Link>
				<svg
					width="24"
					height="24"
					viewBox="0 0 15 15"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					onClick={() => setOpen(true)}
				>
					<path
						d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
						fill="currentColor"
						fillRule="evenodd"
						clipRule="evenodd"
					></path>
				</svg>
				{open && (
					<div className="fixed inset-0 bg-white z-50 flex flex-col items-start justify-start space-y-10 text-xl text-zinc-600  transition duration-200 hover:text-zinc-800">
						<div className="h-20 flex items-center justify-center w-full">
							<div className="flex justify-between items-center w-full rounded-md px-8 py-4 lg:hidden z-30">
								<Link href={"/"}>
									<h1 className="font-bold text-xl">
										Classhopper
									</h1>
								</Link>
								<svg
									width="24"
									height="24"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									onClick={() => setOpen(false)}
								>
									<path
										d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
										fill="currentColor"
										fillRule="evenodd"
										clipRule="evenodd"
									></path>
								</svg>
							</div>
						</div>
						<ul className="flex flex-col items-start justify-start gap-[16px] px-8">
							{/* <li className="inline-block text-xl">Register</li>
							<li className="inline-block text-xl">Login</li> */}
							<li className="inline-block text-xl">My Signups</li>
							<li className="inline-block text-xl">
								<Link href={"/choose"}>
									<Button
										size={"3"}
										className="text-lg rounded-2xl"
									>
										Explore Classes
									</Button>
								</Link>
							</li>
							<li className="inline-block text-xl">
								<Link href={"/instructor/classes"}>
									<Button
										size={"3"}
										className="text-lg rounded-2xl"
										variant="surface"
									>
										Teach a Class
									</Button>
								</Link>
							</li>
						</ul>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
