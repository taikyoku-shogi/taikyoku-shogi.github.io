import { MovementDir, directions } from "../lib/betzaNotationParser";
import { abs, max } from "../lib/math";
import Piece from "../lib/Piece";
import { pieceMovements, piecesInitiallyOnBoard } from "../lib/pieceData";
import { range } from "../lib/utils";
import { PieceMovements, PieceSpecies, Player } from "../types/TaikyokuShogi";

import ShogiPiece from "./ShogiPiece";
import styles from "./PieceMovementDiagram.module.css";
import { JumpMoveTd, RangeMoveTd } from "./pieceMovementSymbols";
import { StepMoveTd } from "./pieceMovementSymbols";
import { useMemo } from "preact/hooks";
import { useInView } from "../lib/hooks";

enum MovementType {
	Step,
	Range,
	Jump
}

const horizontalDirs: Set<MovementDir> = new Set(["FR", "R", "BR", "BL", "L", "FL"]);
const forwardsDirs: Set<MovementDir> = new Set(["FL", "F", "FR"]);
const backWardsDirs: Set<MovementDir> = new Set(["BL", "B", "BR"]);

export default function PieceMovementDiagram({
	pieceSpecies
}: {
	pieceSpecies: PieceSpecies
}) {
	const movements = pieceMovements.get(pieceSpecies)!;
	
	const maxHorizontalSlide = maxSlideInDir(movements, horizontalDirs);
	const maxHorizontalJump = max(0, ...movements.jumps.map(([x]) => abs(x)));
	const horizontalGridSize = max(1, maxHorizontalSlide, maxHorizontalJump) + 1;
	
	const maxForwardsSlide = maxSlideInDir(movements, forwardsDirs);
	const maxForwardsJump = max(...movements.jumps.filter(([, y]) => y > 0).map(([, y]) => y));
	const gridUpperY = max(1, maxForwardsSlide, maxForwardsJump) + 1;
	
	const maxBackwardsSlide = maxSlideInDir(movements, backWardsDirs);
	const maxBackwardsJump = max(...movements.jumps.filter(([, y]) => y < 0).map(([, y]) => -y));
	const gridLowerY = -max(1, maxBackwardsSlide, maxBackwardsJump) - 1;
	
	const grid: Record<number, Record<number, MovementType | null>> = {};
	for(let y = gridLowerY; y <= gridUpperY; y++) {
		grid[y] = {};
		for(let x = -horizontalGridSize; x <= horizontalGridSize; x++) {
			grid[y][x] = null;
		}
	}
	Object.entries(movements.slides).forEach(([dir, range]) => {
		const step = directions[dir];
		let [x, y] = step;
		for(let i = 1; i <= range; i++) {
			if(grid[y]?.[x] === undefined) {
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
	
	const [tableRef, tableVisible] = useInView<HTMLTableElement>();
	
	const piece = new Piece(pieceSpecies, !piecesInitiallyOnBoard.has(pieceSpecies), Player.Sente);
	
	const tbody = useMemo(() => (
		<tbody>
			{range(-gridUpperY, -gridLowerY + 1).flatMap(row => (
				<tr>
					{range(-horizontalGridSize, horizontalGridSize + 1).map(x => {
						// very wacky ranges because the highest y rows should be rendered first, not last
						const y = -row;
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
	), [grid, gridLowerY, gridUpperY, horizontalGridSize, pieceSpecies]);
	
	return (
		<table
			ref={tableRef}
			class={styles.table}
			style={{
				// by putting the width/height here, it avoids the layout changing when tables pop in and out of visibility.
				// 31px per cell + 1px for the border on the other edge
				width: `${31 * (2 * horizontalGridSize + 1) + 1}px`,
				height: `${31 * (gridUpperY - gridLowerY + 1) + 1}px`
			}}
		>
			{tableVisible && tbody}
		</table>
	);
}

function maxSlideInDir(movements: PieceMovements, dirs: Set<MovementDir>): number {
	return max(0, ...Object.entries(movements.slides).filter(([dir, range]) => dirs.has(dir) && range != Infinity).map(([, range]) => range));
}