import { getCredits } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await getCredits(apiKey);

if (res.status === "success") {
	console.log("Remaining credits:", res.data?.remaining_credits);
	console.log("Total credits used:", res.data?.total_credits_used);
} else {
	console.error("Failed:", res.error);
}
