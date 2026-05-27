const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IPV6_RE =
	/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^:(?::[0-9a-fA-F]{1,4}){1,7}$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}$|^::(?:ffff:)?(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

function isIPv4(s: string): boolean {
	return IPV4_RE.test(s);
}

function isIPv6(s: string): boolean {
	return IPV6_RE.test(s);
}

const PRIVATE_HOSTNAME_PATTERNS = [/^localhost$/i, /\.local$/i, /\.internal$/i, /\.localhost$/i];

function isPrivateIPv4(ip: string): boolean {
	const parts = ip.split(".").map(Number);
	if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return false;
	const [a, b] = parts;
	if (a === 127) return true;
	if (a === 10) return true;
	if (a === 172 && b >= 16 && b <= 31) return true;
	if (a === 192 && b === 168) return true;
	if (a === 169 && b === 254) return true;
	if (a === 0) return true;
	return false;
}

function isPrivateIPv6(ip: string): boolean {
	const normalized = ip.replace(/^\[|]$/g, "").toLowerCase();
	if (normalized === "::1") return true;
	if (normalized === "::") return true;
	if (normalized.startsWith("fe80:")) return true;
	if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
	if (normalized.startsWith("::ffff:")) {
		const v4 = normalized.slice(7);
		if (isIPv4(v4)) return isPrivateIPv4(v4);
	}
	return false;
}

export function isInternal(hostname: string): boolean {
	if (PRIVATE_HOSTNAME_PATTERNS.some((r) => r.test(hostname))) return true;
	if (isIPv4(hostname)) return isPrivateIPv4(hostname);
	if (isIPv6(hostname) || hostname.startsWith("[")) return isPrivateIPv6(hostname);
	return false;
}
