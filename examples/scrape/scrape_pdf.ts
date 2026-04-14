import { scrape } from "scrapegraph-js";

const apiKey = process.env.SGAI_API_KEY!;

const res = await scrape(apiKey, {
	url: "https://pdfobject.com/pdf/sample.pdf",
	contentType: "application/pdf",
	formats: [{ type: "markdown" }],
});

if (res.status === "success") {
	console.log("PDF Content:", res.data?.results.markdown?.data);
	console.log("\nPages processed:", res.data?.metadata.ocr?.pagesProcessed);
} else {
	console.error("Failed:", res.error);
}
