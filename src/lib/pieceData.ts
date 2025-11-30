import { PieceMovements, PieceSpecies } from "../types/TaikyokuShogi";

// @ts-expect-error
import piecesCsv from "../assets/pieces.csv";
import type { PieceEntries, PieceEntry } from "../types/pieces.csv";
const pieces: PieceEntries = piecesCsv;

import initialTsfen from "../assets/initial.tsfen?raw";
import { countItems } from "./utils";
import { parseBetzaNotation } from "./betzaNotationParser";
export { initialTsfen };

export const piecesInitiallyOnBoard: Set<PieceSpecies> = new Set([...initialTsfen.matchAll(/[A-Z]+/g)].map(x => x[0] as PieceSpecies));
export const initialPieceCounts: Map<PieceSpecies, number> = countItems([...initialTsfen.matchAll(/[A-Z]+/g)].map(x => x[0] as PieceSpecies));
export const pieceNames: Map<PieceSpecies, string> = new Map(pieces.map(piece => [piece.code, piece.name]));
export const piecePromotions: Map<PieceSpecies, PieceSpecies> = new Map(pieces.filter(doesPiecePromote).map(piece => [piece.code, piece.promotion]));
export const piecePromotionReverseLookups: Map<PieceSpecies, PieceSpecies[]> = generatePiecePromotionReverseLookups(pieces);
export const pieceKanjis: Map<PieceSpecies, string> = new Map(pieces.map(piece => [piece.code, piece.kanji]));
export const pieceRanks: Map<PieceSpecies, number> = new Map(Object.entries({
	K: 4,
	CP: 4,
	GG: 3,
	VG: 2,
	FLG: 1,
	AG: 1,
	FID: 1,
	FCR: 1
}));
export const pieceMovements: Map<PieceSpecies, PieceMovements> = new Map(pieces.map(piece => [piece.code, parseBetzaNotation(piece.movement)]));
export const rangeCapturingPieces: Set<PieceSpecies> = new Set(["GG", "VG", "FLG", "AG", "FID", "FCR"]);

function doesPiecePromote(piece: PieceEntry): piece is {
	code: PieceSpecies;
	name: string;
	kanji: string;
	movement: string;
	promotion: PieceSpecies;
} {
	return piece.promotion != "-";
}
function generatePiecePromotionReverseLookups(pieces: PieceEntries): Map<PieceSpecies, PieceSpecies[]> {
	const reverseLookup: Map<PieceSpecies, PieceSpecies[]> = new Map();
	pieces.forEach(piece => {
		if(!doesPiecePromote(piece)) {
			return;
		}
		const { promotion } = piece;
		if(!reverseLookup.has(promotion)) {
			reverseLookup.set(promotion, []);
		}
		reverseLookup.get(promotion)!.push(piece.code);
	});
	return reverseLookup;
}