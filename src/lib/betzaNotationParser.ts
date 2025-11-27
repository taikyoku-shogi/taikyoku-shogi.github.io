import { PieceMovements, Vec2 } from "../types/TaikyokuShogi";
import { abs } from "./math";
import { isNumber } from "./utils";
import * as vec2 from "./vec2";

const stepAtoms = {
	W: [1, 0] as Vec2,
	F: [1, 1] as Vec2,
	D: [2, 0] as Vec2,
	N: [2, 1] as Vec2,
	A: [2, 2] as Vec2,
	H: [3, 0] as Vec2,
	C: [3, 1] as Vec2,
	Z: [3, 2] as Vec2,
	G: [3, 3] as Vec2
};
const abbreviations = {
	B: "FF",
	R: "WW",
	K: "WF"
	// Q is handled differently (K should be as well but no pieces in taikyoku shogi use that notation)
};

export const directions = {
	F: [0, 1] as Vec2,
	FR: [1, 1] as Vec2,
	R: [1, 0] as Vec2,
	BR: [1, -1] as Vec2,
	B: [0, -1] as Vec2,
	BL: [-1, -1] as Vec2,
	L: [-1, 0] as Vec2,
	FL: [-1, 1] as Vec2
};
export type MovementDir = keyof typeof directions;

export function parseBetzaNotation(betza: string): PieceMovements {
	// keep original string for error logging
	const ogBetza = betza;
	Object.entries(abbreviations).forEach(([abbreviation, atoms]) => {
		betza = betza.replaceAll(abbreviation, atoms);
	});
	// strings like "fQ2" need to be expanded into "fF2fW2" - a simple replacement would product "fFW2"
	betza = betza.replaceAll(/([a-z]*)Q(\d)?/g, (_, mods, range) => {
		if(range) {
			return `${mods}F${range}${mods}W${range}`;
		}
		return `${mods}FF${mods}WW`;
	});
	
	const slideMoves: PieceMovements["slides"] = {};
	const jumpMoves: Vec2[] = [];
	
	let dirModifiers = "";
	let i = 0;
	while(i < betza.length) {
		const char = betza[i];
		
		if(char == "(") {
			// TODO: make it actually look at brackets
			let brackets = 1;
			while(i < betza.length) {
				i++;
				if(betza[i] == "(") brackets++;
				else if(betza[i] == ")" && !--brackets) break;
			}
			i++;
		}
		if(char.toLowerCase() == char) {
			dirModifiers += char;
		} else {
			if(isValidAtomChar(char)) {
				let range = 1;
				if(isNumber(betza[i + 1])) {
					range = +betza[++i];
				} else if(betza[i + 1] == char) {
					// this comes from the B -> FF and R -> WW substitutions. I guess they should be doing a more advanced one like the queen.
					if(isNumber(betza[i + 2])) {
						range = +betza[i += 2];
					} else {
						range = Infinity;
						i++;
					}
				}
				if(char == "W") {
					let dirsToAdd = ["F", "R", "B", "L"] as ("F" | "R" | "B" | "L")[];
					if(dirModifiers.length) {
						dirsToAdd = dirsToAdd.filter(dir => {
							if(dir == "R" && (dirModifiers.includes("s") || dirModifiers.includes("r"))) return true;
							if(dir == "L" && (dirModifiers.includes("s") || dirModifiers.includes("l"))) return true;
							if(dir == "F" && (dirModifiers.includes("v") || dirModifiers.includes("f"))) return true;
							if(dir == "B" && (dirModifiers.includes("v") || dirModifiers.includes("b"))) return true;
						});
					}
					dirsToAdd.forEach(dir => {
						if(slideMoves[dir]) {
							// console.log(`${ogNotation}: double slide in ${dir}`);
							slideMoves[dir] = Math.max(range, slideMoves[dir]);
						} else {
							slideMoves[dir] = range;
						}
					});
				} else if(char == "F") {
					let dirsToAdd = ["FR", "FL", "BR", "BL"] as ("FR" | "FL" | "BR" | "BL")[];
					// console.log(dirModifiers, dirsToAdd, range)
					if(dirModifiers.length) {
						dirsToAdd = dirsToAdd.filter(dir => {
							if(dirModifiers.includes("s") || dirModifiers.includes("v")) return true;
							if(dir == "FR" && (dirModifiers == "fr" || dirModifiers == "f" || dirModifiers == "r")) return true;
							if(dir == "FL" && (dirModifiers == "fl" || dirModifiers == "f" || dirModifiers == "l")) return true;
							if(dir == "BR" && (dirModifiers == "br" || dirModifiers == "b" || dirModifiers == "r")) return true;
							if(dir == "BL" && (dirModifiers == "bl" || dirModifiers == "b" || dirModifiers == "l")) return true;
						})
					}
					dirsToAdd.forEach(dir => {
						if(slideMoves[dir]) {
							// console.log(`${ogNotation}: double slide in ${dir}`);
							slideMoves[dir] = Math.max(range, slideMoves[dir]);
						} else {
							slideMoves[dir] = range;
						}
					});
				} else {
					char
					let rots = generateRotations(stepAtoms[char]);
					if(dirModifiers.length) {
						rots = rots.filter(([x, y]) => {
							if(x && y && abs(x) != abs(y)) {
								if(abs(y) > abs(x) && (dirModifiers.includes("v"))) return true;
								// if(abs(x) > abs(y) && (dirModifiers.includes("s"))) return true;
								if(abs(y) > abs(x) && y > 0 && (dirModifiers.includes("ff"))) return true;
								// if(abs(y) > abs(x) && y < 0 && (dirModifiers.includes("bb"))) return true;
								return false;
							}
							if(x > 0 && (dirModifiers.includes("s") || dirModifiers.includes("r"))) return true;
							if(x < 0 && (dirModifiers.includes("s") || dirModifiers.includes("l"))) return true;
							if(y > 0 && (dirModifiers.includes("v") || dirModifiers.includes("f"))) return true;
							if(y < 0 && (dirModifiers.includes("v") || dirModifiers.includes("b"))) return true;
							return false;
						});
					}
					jumpMoves.push(...rots);
				}
			} else {
				throw new Error(`Error parsing Betza notation ${ogBetza}: "${char}" is not a valid character`);
			}
			dirModifiers = "";
		}
		i++;
	}
	
	return {
		slides: slideMoves,
		jumps: jumpMoves
	};
}
function isValidAtomChar(char: string): char is keyof typeof stepAtoms {
	// why oh why doesn't typescript do this automatically...
	return char in stepAtoms;
}
function generateRotations(step: Vec2): Vec2[] {
	const allDirections: Vec2[] = [
		step,
		[step[0], -step[1]],
		[-step[0], step[1]],
		[-step[0], -step[1]],
		[step[1], step[0]],
		[step[1], -step[0]],
		[-step[1], step[0]],
		[-step[1], -step[0]]
	];
	return (new vec2.Set(allDirections)).values;
}