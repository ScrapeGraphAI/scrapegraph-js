import { scrapegraphai } from "./src/index.js";

const maybeKey = process.env.SGAI_API_KEY;
if (!maybeKey) {
	console.error("Set SGAI_API_KEY env var");
	process.exit(1);
}

const apiKey = maybeKey;
const sgai = scrapegraphai({ apiKey });

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
	const res = await fetch("https://api.scrapegraphai.com/api/v1/health");
	logResult("health", await res.json());
	assert(res.ok, "health should return 200");
}

async function testCredits() {
	const res = await sgai.credits();
	logResult("credits", res);
	assert(typeof res._requestId === "string", "credits requestId should be present");
	assert(typeof res.data === "object" && res.data !== null, "credits data should be an object");
}

async function testScrape() {
	const res = await sgai.scrape("https://example.com", { format: "markdown" });
	logResult("scrape", res);
	assert(typeof res._requestId === "string", "scrape requestId should be present");
	assert(typeof res.data === "object" && res.data !== null, "scrape data should be an object");
}

async function testExtract() {
	const res = await sgai.extract("https://example.com", {
		prompt: "What is this page about? Return a short description.",
		schema: { type: "object", properties: { description: { type: "string" } } },
	});
	logResult("extract", res);
	assert(typeof res._requestId === "string", "extract requestId should be present");
	assert(typeof res.data === "object" && res.data !== null, "extract data should be an object");
}

async function testSearch() {
	const res = await sgai.search("What is the capital of France?");
	logResult("search", res);
	assert(typeof res._requestId === "string", "search requestId should be present");
	assert(typeof res.data === "object" && res.data !== null, "search data should be an object");
}

async function testSchema() {
	const res = await sgai.schema("A product with name and price");
	logResult("schema", res);
	assert(typeof res._requestId === "string", "schema requestId should be present");
	assert(typeof res.data === "object" && res.data !== null, "schema data should be an object");
}

console.log("Running SDK v2 integration tests...\n");

await testHealth();
await testCredits();
await testScrape();
await testExtract();
await testSearch();
await testSchema();

console.log("\nAll integration tests passed.");
