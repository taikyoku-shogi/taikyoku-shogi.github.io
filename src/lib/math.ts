export const { sign, max, abs, min, hypot, sqrt } = Math;
/** Flips a 2D dictionary's rows and columns, so d[x][y] becomes x[y][x]. Only the keys of the first column will be used.  */
export function flipAxes<A extends string, B extends string, T>(dict: Record<A, Record<B, T>>): Record<B, Record<A, T>> {
	const entries = Object.entries(dict) as [A, Record<B, T>][];
	const first = entries?.[0][1];
	const keys = Object.keys(first ?? {}) as B[];
	// yes this works
	return Object.fromEntries(keys.map(key => [key, Object.fromEntries(entries.map(entry => [entry[0], entry[1][key]]))]));
}