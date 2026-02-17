import { generateSchema } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await generateSchema(apiKey, {
	user_prompt:
		"Find laptops with specifications like brand, processor, RAM, storage, and price",
});

if (res.status === "success") {
	console.log("Refined prompt:", res.data?.refined_prompt);
	console.log("\nGenerated schema:");
	console.log(JSON.stringify(res.data?.generated_schema, null, 2));
} else {
	console.error("Failed:", res.error);
}
