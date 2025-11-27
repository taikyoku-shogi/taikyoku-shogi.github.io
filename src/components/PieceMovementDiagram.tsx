import { directions, parseBetzaNotation } from "../lib/betzaNotationParser";
import { abs, max } from "../lib/math";
import Piece from "../lib/Piece";
import { piecesInitiallyOnBoard } from "../lib/pieceData";
import { loop } from "../lib/utils";
import { PieceEntry } from "../types/pieces.csv";
import { Player } from "../types/TaikyokuShogi";

import ShogiPiece from "./ShogiPiece";
import styles from "./PieceMovementDiagram.module.css";
import { JumpMoveTd, RangeMoveTd } from "./pieceMovementSymbols";
import { StepMoveTd } from "./pieceMovementSymbols";

enum MovementType {
	Step,
	Range,
	Jump
}

export default function PieceMovementDiagram({
	pieceEntry
}: {
	pieceEntry: PieceEntry
}) {
	const piece = new Piece(pieceEntry.code, !piecesInitiallyOnBoard.has(pieceEntry.code), Player.Sente);
	
	const movements = parseBetzaNotation(pieceEntry.movement);
	
	const maxSlide = max(...Object.values(movements.slides).filter(x => x != Infinity));
	const maxJump = max(...movements.jumps.flatMap(([x, y]) => [abs(x), abs(y)]));
	const gridSize = max(1, maxSlide, maxJump) + 1;
	
	const grid: Record<number, Record<number, MovementType | null>> = {};
	for(let y = -gridSize; y <= gridSize; y++) {
		grid[y] = {};
		for(let x = -gridSize; x <= gridSize; x++) {
			grid[y][x] = null;
		}
	}
	Object.entries(movements.slides).forEach(([dir, range]) => {
		const step = directions[dir];
		let [x, y] = step;
		for(let i = 1; i <= range; i++) {
			if(grid[x]?.[y] === undefined) {
				break;
			}
			grid[y][x] = range == Infinity? MovementType.Range : MovementType.Step;
			x += step[0];
			y += step[1]
		}
	});
	movements.jumps.forEach(([x, y]) => {
		grid[y][x] = MovementType.Jump; // jumps take precedence on the grid
	});
	
	return (
		<table class={styles.table}>
			<tbody>
				{loop(gridSize * 2 + 1).flatMap(col => (
					<tr>
						{loop(gridSize * 2 + 1).map(row => {
							const y = gridSize - col;
							const x = row - gridSize;
							const move = grid[y][x];
							if(!y && !x) {
								return (
									<td className={styles.piece}>
										<ShogiPiece piece={piece}/>
									</td>
								);
							} else if(move === MovementType.Step) {
								return <StepMoveTd/>;
							} else if(move === MovementType.Range) {
								return <RangeMoveTd x={x} y={y}/>;
							} else if(move === MovementType.Jump) {
								return <JumpMoveTd/>;
							} else {
								return <td></td>;
							}
						})}
					</tr>
				))}
			</tbody>
		</table>
	);
}