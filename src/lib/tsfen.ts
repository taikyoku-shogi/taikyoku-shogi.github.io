import { BoardSquares, PieceSpecies, Player } from "../types/TaikyokuShogi";
import Piece from "./Piece";
import { assert, assertFail, create36x36 } from "./utils";

export function parseTsfen(tsfen: string): [BoardSquares, number] {
	const fields = tsfen.split(" ");
	assert(fields.length == 2, `TSFEN must have exactly 2 fields; got ${fields}`);
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