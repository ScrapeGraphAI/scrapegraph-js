type ZodDef = { type?: string; typeName?: string; shape?: unknown; [k: string]: unknown };

function getDef(schema: unknown): ZodDef | null {
	if (schema && typeof schema === "object" && "_def" in schema)
		return (schema as { _def: ZodDef })._def;
	return null;
}

export function toJsonSchema(schema: unknown): Record<string, unknown> {
	if (!schema || typeof schema !== "object") return {};

	const def = getDef(schema);
	if (!def) return schema as Record<string, unknown>;

	// [NOTE] @Claude Zod v4 uses _def.type, v3 uses _def.typeName
	const type = def.type ?? def.typeName;
	const isV4 = def.type !== undefined;

	if (type === "object" || type === "ZodObject") {
		const shape = isV4
			? def.shape
			: typeof def.shape === "function"
				? (def.shape as () => Record<string, unknown>)()
				: def.shape;
		if (!shape || typeof shape !== "object") return {};

		const properties: Record<string, unknown> = {};
		const required: string[] = [];

		for (const [key, val] of Object.entries(shape as Record<string, unknown>)) {
			const fieldDef = getDef(val);
			if (!fieldDef) continue;

			const fieldType = fieldDef.type ?? fieldDef.typeName;
			if (fieldType === "optional" || fieldType === "ZodOptional") {
				const inner = (fieldDef.innerType ?? fieldDef.value) as unknown;
				properties[key] = zodTypeToJson(inner ?? val);
			} else {
				properties[key] = zodTypeToJson(val);
				required.push(key);
			}
		}
		return { type: "object", properties, required };
	}

	return zodTypeToJson(schema);
}

function zodTypeToJson(schema: unknown): Record<string, unknown> {
	const def = getDef(schema);
	if (!def) return {};

	const type = def.type ?? def.typeName;

	switch (type) {
		case "string":
		case "ZodString":
			return { type: "string" };
		case "number":
		case "ZodNumber":
			return { type: "number" };
		case "boolean":
		case "ZodBoolean":
			return { type: "boolean" };
		case "array":
		case "ZodArray":
			return { type: "array", items: zodTypeToJson(def.element as unknown) };
		case "enum":
		case "ZodEnum":
			return { type: "string", enum: (def.values ?? def.entries) as string[] };
		case "object":
		case "ZodObject":
			return toJsonSchema(schema);
		default:
			return {};
	}
}
