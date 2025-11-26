import { PieceSpecies } from "../types/TaikyokuShogi";

// @ts-expect-error
import piecesCsv from "../assets/pieces.csv";
import type { PieceEntries, PieceEntry } from "../types/pieces.csv";
const pieces: PieceEntries = piecesCsv;

export { default as initialTsfen } from "../assets/initial.tsfen?raw";

export const piecePromotions: Map<Partial<PieceSpecies>, PieceSpecies> = new Map(pieces.filter(doesPiecePromote).map(piece => [piece.code, piece.promotion]));
export const pieceKanjis: Map<PieceSpecies, string> = new Map(pieces.map(piece => [piece.code, piece.kanji]));
export const pieceRanks: Map<Partial<PieceSpecies>, number> = new Map(Object.entries({
	K: 4,
	CP: 4,
	GG: 3,
	VG: 2,
	FLG: 1,
	AG: 1,
	FID: 1,
	FCR: 1
}));
export const pieceMovementBetzaNotations: Map<PieceSpecies, string> = new Map(pieces.map(piece => [piece.code, piece.movement]));
export const rangeCapturingPieces: Set<Partial<PieceSpecies>> = new Set(["GG", "VG", "FLG", "AG", "FID", "FCR"]);

function doesPiecePromote(piece: PieceEntry): piece is {
	code: PieceSpecies;
	name: string;
	kanji: string;
	movement: string;
	promotion: PieceSpecies;
} {
	return piece.promotion != "-";
}