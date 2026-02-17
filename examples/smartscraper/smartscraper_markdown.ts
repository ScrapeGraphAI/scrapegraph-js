import { smartScraper } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const markdown = `
# Product Catalog

## Laptop Pro 15
- **Brand**: TechCorp
- **Price**: $1,299.99
- **Rating**: 4.5/5
- **In Stock**: Yes
- **Description**: High-performance laptop with 15-inch display, 16GB RAM, and 512GB SSD

## Wireless Mouse Elite
- **Brand**: PeripheralCo
- **Price**: $29.99
- **Rating**: 4.8/5
- **In Stock**: Yes
- **Description**: Ergonomic wireless mouse with precision tracking

## USB-C Hub Pro
- **Brand**: ConnectTech
- **Price**: $49.99
- **Rating**: 4.3/5
- **In Stock**: No
- **Description**: 7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader
`;

const res = await smartScraper(apiKey, {
	user_prompt: "Extract all products with name, brand, price, rating, and stock status",
	website_markdown: markdown,
});

if (res.status === "success") {
	console.log("Products:", JSON.stringify(res.data?.result, null, 2));
	console.log(`Took ${res.elapsedMs}ms`);
} else {
	console.error("Failed:", res.error);
}
