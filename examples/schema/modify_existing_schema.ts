import { generateSchema } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const existingSchema = {
	title: "ProductList",
	type: "object",
	properties: {
		products: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					price: { type: "number" },
				},
				required: ["name", "price"],
			},
		},
	},
	required: ["products"],
};

const res = await generateSchema(apiKey, {
	user_prompt: "Add brand, category, and rating fields to the existing product schema",
	existing_schema: existingSchema,
});

if (res.status === "success") {
	console.log("Modified schema:");
	console.log(JSON.stringify(res.data?.generated_schema, null, 2));
} else {
	console.error("Failed:", res.error);
}
