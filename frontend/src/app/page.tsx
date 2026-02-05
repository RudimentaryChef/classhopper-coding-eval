"use server"
import Navbar from "./components/Navbar";
import Hero from "./components/home/Hero";

export default async function Home() {
	return (
		<>
			<Navbar scrollable={true} fixed={true} />
			<Hero />
		</>
	);
}
