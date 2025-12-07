import { BoardSquares, PieceSpecies, Player } from "../types/TaikyokuShogi";
import Game from "./Game";
import Piece from "./Piece";
import { assert, assertFail, create36x36 } from "./utils";

export function parseTsfen(tsfen: string): [BoardSquares, number] {
	const fields = tsfen.split(" ");
	assert(fields.length == 2, `TSFEN must have exactly 2 fields; got ${fields.length}: "${fields}"`);
	const rows = fields[0].split("/");
	assert(rows.length == 36, `TSFEN board must have exactly 36 rows; got ${rows.length}`);
	
	const squares = create36x36<Piece | null>(null);
	rows.forEach((row, y) => {
		const cells = row.split(",");
		let x = 0;
		cells.forEach(cell => {
			if(/^\d+$/.test(cell)) {
				x += +cell;
			} else if(/^[a-z]+\d*$/.test(cell)) {
				const [_, species, count = 1] = cell.match(/^([a-z]+)(\d+)?$/)!;
				for(let i = 0; i < +count; i++) {
					squares[x++][y] = new Piece(species.toUpperCase() as PieceSpecies, false, Player.Sente);
				}
			} else if(/^[A-Z]+\d*$/.test(cell)) {
				const [_, species, count = 1] = cell.match(/^([A-Z]+)(\d+)?$/)!;
				for(let i = 0; i < +count; i++) {
					squares[x++][y] = new Piece(species as PieceSpecies, false, Player.Gote);
				}
			} else {
				assertFail(`Could not understand TSFEN piece: ${cell} in row ${y}, column ${x}`);
			}
		})
		assert(x == 36, `TSFEN board must have exactly 36 squares in each row; got ${x} in row ${y}`)
	});
	
	const moveCounter = fields[1];
	assert(parseInt(moveCounter) == +moveCounter && +moveCounter >= 0, `TSFEN move counter must be a positive integer; got ${moveCounter}`);
	
	return [squares, +moveCounter];
}
export function exportTsfen(game: Game): string {
	const rows: string[] = [];
	for(let y = 0; y < 36; y++) {
		let lastPieceSpecies: PieceSpecies | Lowercase<PieceSpecies> | undefined;
		let streak = 0;
		const cells: (string | number)[] = [];
		for(let x = 0; x < 36; x++) {
			const piece = game.getSquare([x, y]);
			const pieceSpecies = piece?.owner == Player.Sente? piece?.species.toLowerCase() : piece?.species;
			if(streak && pieceSpecies == lastPieceSpecies) {
				streak++;
			} else {
				if(streak) {
					if(lastPieceSpecies) {
						cells.push(lastPieceSpecies + (streak > 1? streak : ""));
					} else {
						cells.push(streak);
					}
				}
				streak = 1;
				lastPieceSpecies = pieceSpecies;
			}
		}
		if(streak) {
			if(lastPieceSpecies) {
				cells.push(lastPieceSpecies + (streak > 1? streak : ""));
			} else {
				cells.push(streak);
			}
		}
		rows.push(cells.join(","));
	}
	const boardField = rows.join("/");
	
	const moveCounterField = game.moveCounter;
	
	const fields = [boardField, moveCounterField];
	return fields.join(" ");
}