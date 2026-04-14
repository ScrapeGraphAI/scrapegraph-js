import { generateSchema } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await generateSchema(apiKey, {
	prompt: "Find laptops with specifications like brand, processor, RAM, storage, and price",
});

if (res.status === "success") {
	console.log("Refined prompt:", res.data?.refinedPrompt);
	console.log("\nGenerated schema:");
	console.log(JSON.stringify(res.data?.schema, null, 2));
} else {
	console.error("Failed:", res.error);
}
