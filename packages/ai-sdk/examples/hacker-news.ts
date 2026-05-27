import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import { scrapeTool } from "../src/index";

const { text } = await generateText({
	model: openai("gpt-5-nano"),
	prompt:
		"Scrape Hacker News and write a short, concise summary of what people are talking about today.",
	tools: {
		scrape: scrapeTool(),
	},
	stopWhen: stepCountIs(3),
});

console.log(text);
