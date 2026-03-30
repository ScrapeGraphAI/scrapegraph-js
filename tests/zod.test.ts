import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { toJsonSchema } from "../src/zod";

describe("toJsonSchema", () => {
	test("converts Zod object", () => {
		const schema = z.object({ name: z.string(), price: z.number() });
		const result = toJsonSchema(schema) as any;
		expect(result.type).toBe("object");
		expect(result.properties.name.type).toBe("string");
		expect(result.properties.price.type).toBe("number");
		expect(result.required).toContain("name");
		expect(result.required).toContain("price");
	});

	test("passes raw object through", () => {
		const raw = { type: "object", properties: { x: { type: "string" } } };
		expect(toJsonSchema(raw)).toEqual(raw);
	});

	test("handles optional fields", () => {
		const schema = z.object({ name: z.string(), bio: z.string().optional() });
		const result = toJsonSchema(schema) as any;
		expect(result.required).toContain("name");
		expect(result.required).not.toContain("bio");
		expect(result.properties.bio.type).toBe("string");
	});

	test("handles arrays", () => {
		const schema = z.object({ tags: z.array(z.string()) });
		const result = toJsonSchema(schema) as any;
		expect(result.properties.tags.type).toBe("array");
		expect(result.properties.tags.items.type).toBe("string");
	});

	test("handles nested objects", () => {
		const schema = z.object({ address: z.object({ city: z.string() }) });
		const result = toJsonSchema(schema) as any;
		expect(result.properties.address.type).toBe("object");
		expect(result.properties.address.properties.city.type).toBe("string");
	});
});
