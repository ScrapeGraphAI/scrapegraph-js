import {
	type CreditsResponse,
	type HealthResponse,
	type MarkdownifyResponse,
	type ScrapeResponse,
	type SearchScraperResponse,
	type SitemapResponse,
	type SmartScraperResponse,
	checkHealth,
	getCredits,
	markdownify,
	scrape,
	searchScraper,
	sitemap,
	smartScraper,
} from "./src/index.js";

const maybeKey = process.env.SGAI_API_KEY;
if (!maybeKey) {
	console.error("Set SGAI_API_KEY env var");
	process.exit(1);
}
const apiKey: string = maybeKey;

function assert(condition: boolean, msg: string) {
	if (!condition) {
		console.error(`FAIL: ${msg}`);
		process.exit(1);
	}
}

function logResult(name: string, data: unknown) {
	console.log(`\n=== ${name} ===`);
	console.log(JSON.stringify(data, null, 2));
}

async function testHealth() {
	const res = await checkHealth(apiKey);
	logResult("checkHealth", res);
	assert(res.status === "success", "health status should be success");
	const d = res.data as HealthResponse;
	assert(typeof d.status === "string", "health.status should be string");
}

async function testCredits() {
	const res = await getCredits(apiKey);
	logResult("getCredits", res);
	assert(res.status === "success", "credits status should be success");
	const d = res.data as CreditsResponse;
	assert(typeof d.remaining_credits === "number", "remaining_credits should be number");
	assert(typeof d.total_credits_used === "number", "total_credits_used should be number");
}

async function testSmartScraper() {
	const res = await smartScraper(apiKey, {
		user_prompt: "Extract the page title and description",
		website_url: "https://example.com",
	});
	logResult("smartScraper", res);
	assert(res.status === "success", "smartScraper status should be success");
	const d = res.data as SmartScraperResponse;
	assert(typeof d.request_id === "string", "request_id should be string");
	assert(typeof d.status === "string", "status should be string");
	assert(typeof d.website_url === "string", "website_url should be string");
	assert(typeof d.user_prompt === "string", "user_prompt should be string");
	assert(d.result !== undefined, "result should exist");
}

async function testSearchScraper() {
	const res = await searchScraper(apiKey, {
		user_prompt: "What is the capital of France?",
	});
	logResult("searchScraper", res);
	assert(res.status === "success", "searchScraper status should be success");
	const d = res.data as SearchScraperResponse;
	assert(typeof d.request_id === "string", "request_id should be string");
	assert(typeof d.user_prompt === "string", "user_prompt should be string");
	assert(Array.isArray(d.reference_urls), "reference_urls should be array");
	assert(
		d.result !== undefined || d.markdown_content !== undefined,
		"result or markdown_content should exist",
	);
}

async function testMarkdownify() {
	const res = await markdownify(apiKey, {
		website_url: "https://example.com",
	});
	logResult("markdownify", res);
	assert(res.status === "success", "markdownify status should be success");
	const d = res.data as MarkdownifyResponse;
	assert(typeof d.request_id === "string", "request_id should be string");
	assert(typeof d.website_url === "string", "website_url should be string");
	assert(typeof d.result === "string" || d.result === null, "result should be string or null");
}

async function testScrape() {
	const res = await scrape(apiKey, {
		website_url: "https://example.com",
	});
	logResult("scrape", res);
	assert(res.status === "success", "scrape status should be success");
	const d = res.data as ScrapeResponse;
	assert(typeof d.scrape_request_id === "string", "scrape_request_id should be string");
	assert(typeof d.html === "string", "html should be string");
	assert(typeof d.status === "string", "status should be string");
}

async function testSitemap() {
	const res = await sitemap(apiKey, {
		website_url: "https://scrapegraphai.com",
	});
	logResult("sitemap", res);
	assert(res.status === "success", "sitemap status should be success");
	const d = res.data as SitemapResponse;
	assert(typeof d.request_id === "string", "request_id should be string");
	assert(Array.isArray(d.urls), "urls should be array");
}

console.log("Running API battle tests...\n");

await testHealth();
await testCredits();
await testSmartScraper();
await testSearchScraper();
await testMarkdownify();
await testScrape();
await testSitemap();

console.log("\nAll tests passed.");
