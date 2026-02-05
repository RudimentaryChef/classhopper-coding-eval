import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
	ClerkProvider,
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton
} from '@clerk/nextjs'
import "@radix-ui/themes/styles.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
import { Theme } from "@radix-ui/themes";

import { QueryProvider } from "./components/query/QueryClient";
import { Toaster } from "sonner";
import { CSPostHogProvider } from './providers'

export const metadata: Metadata = {
	title: "Classhopper",
	description: "Discover, host, and market classes effortlessly with Classhopper, powered by your social connections!",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		}
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider dynamic>
			<html lang="en" className="bg-white">
				<CSPostHogProvider>
					<body className="bg-white">
						<Toaster richColors />
						<QueryProvider>
							<Theme>{children}</Theme>
						</QueryProvider>
					</body>
				</CSPostHogProvider>
			</html>
		</ClerkProvider>
	);
}
