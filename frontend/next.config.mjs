/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.googleapis.com",
				port: "",
				pathname: "/imagestorageclasshopper/**",
			},
		],
	},
};
// https://storage.googleapis.com/imagestorageclasshopper/potato.jpg
export default nextConfig;
