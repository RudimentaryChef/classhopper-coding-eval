import { Button, Text } from "@radix-ui/themes";
import { IoIosArrowForward } from "react-icons/io";
import Image from "next/image";
// import FormPopup from "./FormPopup";
import Link from "next/link";
// import TallyComponent from "../tally/TallyComponent";

const Hero = () => {
	return (
		<div>
			<div className="h-[60rem] w-full bg-white bg-grid-black/[0.10] relative flex md:items-center justify-center">
				<div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>
				<div className="grid grid-cols-1 px-8 w-[88rem] mx-auto xl:grid-cols-2 gap-10 pb-10 py-28 md:pt-36 overflow-hidden relative">
					<div className="flex flex-col items-start z-10 ">
						<h1 className="text-4xl md:text-7xl font-bold mb-10 relative text-left text-zinc-700 max-w-4xl">
							Find Your Next Class with Classhopper.
						</h1>
						<h2 className="relative text-sm sm:text-xl text-zinc-500 tracking-wide mb-12 text-left max-w-2xl antialiased leading-loose">
							Discover, host, and market classes effortlessly with
							Classhopper, powered by your social connections!
						</h2>
						<div className="flex sm:flex-row flex-col space-y-2 justify-center sm:space-y-0 sm:space-x-4 sm:justify-start mb-6 w-full">
							<Link href={"/choose"} className="rounded-2xl">
								<Button
									size="4"
									className="rounded-2xl min-w-52 flex w-full flex-grow items-center justify-between cursor-pointer"
								>
									Explore Classes
									<IoIosArrowForward />
								</Button>
							</Link>
							<Link href={"/instructor/classes"} className="rounded-2xl">
								<Button
									size="4"
									className="rounded-2xl min-w-52 flex items-center justify-between cursor-pointer flex-grow w-full"
									variant="surface"
								>
									Teach a Class
									<IoIosArrowForward />
								</Button>
							</Link>
							{/* <FormPopup /> */}
						</div>
					</div>
					<div className="hidden xl:block w-full h-full relative">
						<div className="bg-[#1d1c20] relative overflow-hidden w-full h-56 rounded-xl shadow-2xl">
							<div className="relative w-full h-full">
								<Image
									alt="art"
									src="/artclass.jpg"
									layout="fill"
									objectFit="cover"
									priority
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 mt-4">
							<div className="w-80 h-56 bg-black rounded-2xl mb-4 overflow-hidden shadow-2xl">
								<div className="relative w-full h-full">
									<Image
										alt="tutor1"
										src="/tutor1.jpg"
										layout="fill"
										objectFit="cover"
										priority
									/>
								</div>
							</div>
							<div className="w-80 h-56 bg-black rounded-2xl overflow-hidden shadow-2xl">
								<div className="relative w-full h-full">
									<Image
										alt="tutor3"
										src="/tutor3.jpeg"
										layout="fill"
										objectFit="cover"
										priority
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
