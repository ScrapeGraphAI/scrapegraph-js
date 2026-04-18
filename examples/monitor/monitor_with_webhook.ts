import { ScrapeGraphAI } from "scrapegraph-js";

const sgai = ScrapeGraphAI();

const res = await sgai.monitor.create({
	url: "https://time.is/",
	name: "Time Monitor with Webhook",
	interval: "*/10 * * * *",
	formats: [
		{ type: "markdown" },
		{
			type: "json",
			prompt: "Extract the current time and timezone",
			schema: {
				type: "object",
				properties: {
					time: { type: "string" },
					timezone: { type: "string" },
				},
				required: ["time"],
			},
		},
	],
	webhookUrl: "https://your-server.com/webhook",
});

if (res.status !== "success" || !res.data) {
	throw new Error(`Failed to create monitor: ${res.error}`);
}

const { cronId: monitorId, interval, config } = res.data;
console.log(`Monitor created: ${monitorId}`);
console.log(`Interval: ${interval}`);
console.log(`Webhook: ${config.webhookUrl}`);
console.log("\nPolling for activity (Ctrl+C to stop)...\n");

function cleanup() {
	console.log("\nStopping monitor...");
	sgai.monitor.delete(monitorId).then(() => {
		console.log("Monitor deleted");
		process.exit(0);
	});
}

process.on("SIGINT", cleanup);

const seenIds = new Set<string>();

while (true) {
	const activity = await sgai.monitor.activity(monitorId);
	if (activity.status === "success" && activity.data) {
		for (const tick of activity.data.ticks) {
			if (seenIds.has(tick.id)) continue;
			seenIds.add(tick.id);

			const changes = tick.changed ? "CHANGED" : "no change";
			console.log(`[${tick.createdAt}] ${tick.status} - ${changes} (${tick.elapsedMs}ms)`);
			if (tick.diffs && Object.keys(tick.diffs).length > 0) {
				console.log("  Diffs:", JSON.stringify(tick.diffs, null, 2));
			} else if (tick.changed) {
				console.log("  (no diffs data - first tick establishes baseline)");
			}
		}
	}
	await new Promise((r) => setTimeout(r, 30000));
}
