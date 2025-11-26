import { PieceSpecies } from "./TaikyokuShogi";

export type PieceEntry = {
	code: PieceSpecies;
	name: string;
	kanji: string;
	movement: string;
	promotion: PieceSpecies | "-";
};
export type PieceEntries = PieceEntry[];