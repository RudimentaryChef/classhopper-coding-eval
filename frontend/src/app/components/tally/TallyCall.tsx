import React from "react";

const TallyCall = () => {
	const websiteUrl = "https://tally.so/r/w4jxvA?name=Bob";

	return (
		<div className="w-full h-full">
			<object
				data={websiteUrl}
				type="text/html"
				title="TallyEmbed"
				className="w-full h-[600px]"
			></object>
		</div>
	);
};

export default TallyCall;
