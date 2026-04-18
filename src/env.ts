export const env = {
	debug: process.env.SGAI_DEBUG === "1",
	timeout: process.env.SGAI_TIMEOUT ? Number(process.env.SGAI_TIMEOUT) : 120,
};
