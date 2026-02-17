export const env = {
	debug: process.env.SGAI_DEBUG === "1",
	timeoutS: process.env.SGAI_TIMEOUT_S ? Number(process.env.SGAI_TIMEOUT_S) : 120,
};
