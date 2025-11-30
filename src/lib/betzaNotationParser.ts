import { CompoundPieceMovement, PieceMovements, Vec2 } from "../types/TaikyokuShogi";
import { abs } from "./math";
import { cacheUnaryFunc, isNumber, replaceAllIncrementally } from "./utils";
import * as vec2 from "./vec2";

const baseAtoms = {
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

export const parseBetzaNotation = ((betzaString: string, name: string): PieceMovements => {
	// keep original string for error logging
	const ogBetza = betzaString;
	
	// these are for range capturing pieces (the actual range capturing move generation and logic is handled elsewhere)
	betzaString = betzaString.replaceAll(/\(\(c([A-Z])cd\1\)-\1\)/g, "$1");
	Object.entries(abbreviations).forEach(([abbreviation, atoms]) => {
		betzaString = betzaString.replaceAll(abbreviation, atoms);
	});
	// strings like "fQ2" need to be expanded into "fF2fW2" - a simple replacement would product "fFW2"
	betzaString = betzaString.replaceAll(/([a-z]*)Q(\d)?/g, (_, mods, range) => {
		if(range) {
			return `${mods}F${range}${mods}W${range}`;
		}
		return `${mods}FF${mods}WW`;
	});
	const newAtoms: Record<symbol, Vec2> = {};
	const atomReplacements: [number, symbol][] = [];
	betzaString = replaceAllIncrementally(betzaString, /\((\d+),(\d+)\)/, (_, xStep, yStep, i) => {
		const step: Vec2 = [+xStep, +yStep];
		const symbol = Symbol(`Step: ${vec2.stringify(step)}`);
		newAtoms[symbol] = step;
		atomReplacements.push([i, symbol]);
		return "_"; // this is a dummy character and will be replaced with the symbol once the string is turned into an array
	});
	const betza: (string | symbol)[] = [...betzaString];
	atomReplacements.forEach(([i, symbol]) => {
		betza[i] = symbol;
	});
	const allAtoms: Record<keyof typeof baseAtoms | symbol, Vec2> = { ...baseAtoms, ...newAtoms };
	
	const slideMoves: PieceMovements["slides"] = {};
	const jumpMoves: Vec2[] = [];
	const compoundMoves: CompoundPieceMovement[] = [];
	
	let dirModifiers = "";
	for(let i = 0; i < betza.length; i++) {
		const char = betza[i];
		
		if(char == "(") {
			// TODO: make it actually look at brackets
			let brackets = 1;
			const bracketsStart = i + 1;
			let hyphenI: number = -1;
			while(i < betza.length) {
				i++;
				if(betza[i] == "(") brackets++;
				else if(betza[i] == ")" && !--brackets) break;
				else if(betza[i] == "-") hyphenI = i;
			}
			const betzaInsideBracketsWithNewAtoms = betza.slice(bracketsStart, i);
			const rawBetzaInsideBrackets = betzaInsideBracketsWithNewAtoms.map(char => typeof char == "symbol"? `(${newAtoms[char]})` : char).join("");
			// if(hyphenI == -1) {
			// 	console.error(`Couldn't find hyphen inside bracketed Betza expression: "${rawBetzaInsideBrackets}"`);
			// }
			i++;
			// console.log(`${name}: brackets from ${bracketsStart} to ${i}:`, rawBetzaInsideBrackets);
			// if(hyphenI > -1) {
			// 	const [a, b] = rawBetzaInsideBrackets.split("-");
			// 	console.log(parseBetzaNotation(a, name), parseBetzaNotation(b, name))
			// }
		} else if(typeof char == "string" && char.toLowerCase() == char) {
			dirModifiers += char;
		} else {
			if(isValidAtomChar(char)) {
				let range = 1;
				const nextChar = betza[i + 1];
				if(isNumber(nextChar)) {
					range = +nextChar;
					i++;
				} else if(char == nextChar) {
					// this comes from the B -> FF and R -> WW substitutions. I guess they should be doing a more advanced one like the queen.
					let nextNextChar = betza[i + 2];
					if(isNumber(nextNextChar)) {
						range = +nextNextChar;
						i += 2;
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
				} else {
					const atom = allAtoms[char];
					let rots = generateRotations(atom);
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
	}
	
	return {
		slides: slideMoves,
		jumps: jumpMoves,
		compoundMoves
	};
});
function isValidAtomChar(char: any): char is (keyof typeof baseAtoms | symbol) {
	// why oh why doesn't typescript do this automatically...
	return char in baseAtoms || typeof char == "symbol";
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