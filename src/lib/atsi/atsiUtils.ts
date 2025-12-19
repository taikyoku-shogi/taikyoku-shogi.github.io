import { Vec2 } from "../../types/TaikyokuShogi";

export function boardPosToVec(pos: string): Vec2 {
	const match = pos.match(/^([1-9]|(?:[1-2][0-9])|(?:3[0-6]))([a-z]|[a-j]{2})$/);
	if(!match) {
		throw new Error(`Invalid board position: "${pos}"`);
	}
	const [, fileStr, rankStr] = match;
	if(rankStr.length > 1 && rankStr[0] != rankStr[1]) {
		throw new Error(`Invalid board position rank: "${rankStr}" in "${pos}"`);
	}
	const file = 36 - +fileStr;
	const rank = rankStr.charCodeAt(0) - "a".charCodeAt(0) + 26 * (rankStr.length - 1);
	return [file, rank];
}