import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, type ModelMessage } from "ai";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { crawlTools } from "../src/index";

const initialPrompt =
	"Find 10 https://scrapegraphai.com/ blog posts. Start a crawl, poll its status, fetch crawled pages with getCrawlPages, then summarize what you found.";
const messages: ModelMessage[] = [];
let activeController: AbortController | undefined;

async function run(prompt: string) {
	messages.push({ role: "user", content: prompt });
	const controller = new AbortController();
	activeController = controller;

	try {
		const result = await generateText({
			model: openai("gpt-5-nano"),
			messages,
			tools: { ...crawlTools() },
			stopWhen: stepCountIs(20),
			abortSignal: controller.signal,
			onStepFinish: ({ text, toolCalls, toolResults }) => {
				if (text) {
					console.log(`\n[assistant]\n${text}`);
				}

				for (const toolCall of toolCalls) {
					console.log(`\n[tool] ${toolCall.toolName}`);
					console.log(JSON.stringify(toolCall.input, null, 2));
				}

				for (const toolResult of toolResults) {
					console.log(`\n[result] ${toolResult.toolName}`);
					console.log(JSON.stringify(toolResult.output, null, 2));
				}
			},
		});

		messages.push(...result.response.messages);
		console.log(`\n${result.text}\n`);
	} catch (error) {
		if (controller.signal.aborted) {
			console.error("[aborted]");
		} else {
			console.error(error instanceof Error ? error.message : error);
		}
	} finally {
		if (activeController === controller) {
			activeController = undefined;
		}
	}
}

const rl = createInterface({ input, output });

process.on("SIGINT", () => {
	output.write("\n");
	if (activeController) {
		activeController.abort();
		return;
	}

	rl.close();
	process.exit(0);
});

await run(initialPrompt);

while (true) {
	const prompt = (await rl.question("> ")).trim();

	if (prompt) {
		await run(prompt);
	}
}
