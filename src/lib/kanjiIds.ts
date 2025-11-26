// IDS here referring to Ideographic Description Characters, not the plural of identification.

export const idsChars = new Set(["⿱", "⿰"]);

export function getNextKanjiI(chars: string[]): number {
	let idsCharCounter = 0;
	let i = 0;
	while(idsCharCounter >= 0) {
		idsCharCounter += idsChars.has(chars[i++])? 1 : -1;
	}
	return i;
}
export function kanjiStringLength(str: string): number {
	const chars = [...str];
	let count = 0;
	while(chars.length) {
		chars.splice(0, getNextKanjiI(chars));
		count++;
	}
	return count;
}