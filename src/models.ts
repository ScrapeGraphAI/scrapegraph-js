export const MODEL_NAMES = [
	"gpt-4o-mini",
	"gpt-4o-mini-2024-07-18",
	"llama-3.3-70b-versatile",
	"llama-3.1-8b-instant",
	"mixtral-8x7b-32768",
	"mistral-small-2501",
	"gpt-oss-120b",
	"openai/gpt-oss-120b",
	"claude-haiku-4-5-20251001",
] as const;

export type ApiModelName = (typeof MODEL_NAMES)[number];
