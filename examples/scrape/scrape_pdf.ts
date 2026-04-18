import { ScrapeGraphAI } from "scrapegraph-js";

// reads SGAI_API_KEY from env, or pass explicitly: ScrapeGraphAI({ apiKey: "..." })
const sgai = ScrapeGraphAI();

const res = await sgai.scrape({
	url: "https://pdfobject.com/pdf/sample.pdf",
	contentType: "application/pdf",
	formats: [{ type: "markdown" }],
});

if (res.status === "success") {
	const md = res.data?.results.markdown;
	const ocr = res.data?.metadata.ocr;

	console.log("=== PDF Extraction ===\n");
	console.log("Content Type:", res.data?.metadata.contentType);
	console.log("OCR Model:", ocr?.model);
	console.log("Pages Processed:", ocr?.pagesProcessed);

	if (ocr?.pages) {
		for (const page of ocr.pages) {
			console.log(`\nPage ${page.index + 1}:`);
			console.log(`  Dimensions: ${page.dimensions.width}x${page.dimensions.height} @ ${page.dimensions.dpi}dpi`);
			console.log(`  Images: ${page.images.length}`);
			console.log(`  Tables: ${page.tables.length}`);
			console.log(`  Hyperlinks: ${page.hyperlinks.length}`);
		}
	}

	console.log("\n=== Extracted Markdown ===\n");
	console.log(md?.data?.join("\n\n"));
} else {
	console.error("Failed:", res.error);
}
