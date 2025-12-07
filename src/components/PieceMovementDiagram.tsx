import { directions } from "../lib/betzaNotationParser";
import { abs, max } from "../lib/math";
import Piece from "../lib/Piece";
import { pieceMovements, piecesInitiallyOnBoard, rangeCapturingPieces } from "../lib/pieceData";
import { joinClasses, range } from "../lib/utils";
import { MovementDir, PieceMovements, PieceMovementsOnlySlidesJumps, PieceSpecies, Player } from "../types/TaikyokuShogi";

import ShogiPiece from "./ShogiPiece";
import styles from "./PieceMovementDiagram.module.css";
import { JumpMoveTd, RangeAfterJumpMoveTd, RangeCaptureMoveTd, RangeMoveTd, StepAfterJumpMoveTd, TripleSlashedArrowJumpMoveTd } from "./pieceMovementSymbols";
import { StepMoveTd } from "./pieceMovementSymbols";
import { useMemo } from "preact/hooks";
import { useInView } from "../lib/hooks";
import { joinElements } from "../lib/jsxUtils";
import * as vec2 from "../lib/vec2";

enum MovementType {
	Step,
	Range,
	RangeCapture,
	Jump,
	StepAfterJump,
	RangeAfterJump,
	TripleSlashedArrowJump
}

const horizontalDirs: Set<MovementDir> = new Set(["FR", "R", "BR", "BL", "L", "FL"]);
const forwardsDirs: Set<MovementDir> = new Set(["FL", "F", "FR"]);
const backwardsDirs: Set<MovementDir> = new Set(["BL", "B", "BR"]);

export default function PieceMovementDiagram({
	pieceSpecies
}: {
	pieceSpecies: PieceSpecies
}) {
	const movements = pieceMovements.get(pieceSpecies)!;
	const tables = [
		<PieceMovementTable
			pieceSpecies={pieceSpecies}
			movements={movements}
		/>
	];
	if(movements.compoundMoves.length) {
		const doubleRangeCompoundMoves = movements.compoundMoves.filter(([move1]) => Object.keys(move1.slides).length);
		const compoundMoveTables = doubleRangeCompoundMoves.map(compound => (
			<div class={styles.compoundMove}>
				<PieceMovementTable
					pieceSpecies={pieceSpecies}
					movements={compound[0]}
					isCompoundMove
				/>
				<span>then</span>
				<PieceMovementTable
					pieceSpecies={pieceSpecies}
					movements={compound[1]}
					isCompoundMove
				/>
			</div>
		));
		tables.push(...compoundMoveTables);
	}
	return joinElements(tables, <div>or:</div>);
}
function PieceMovementTable({
	pieceSpecies,
	movements,
	isCompoundMove = false
}: {
	pieceSpecies: PieceSpecies,
	movements: PieceMovements | PieceMovementsOnlySlidesJumps,
	isCompoundMove?: boolean
}) {
	const isRangeCapturingPiece = rangeCapturingPieces.has(pieceSpecies);
	
	const maxHorizontalSlide = maxSlideInDir(movements, horizontalDirs);
	const maxHorizontalJump = max(0, ...movements.jumps.map(([x]) => abs(x)));
	const horizontalGridSize = max(1, maxHorizontalSlide, maxHorizontalJump) + 1;
	
	const maxForwardsSlide = maxSlideInDir(movements, forwardsDirs);
	const maxForwardsJump = max(...movements.jumps.filter(([, y]) => y > 0).map(([, y]) => y));
	const gridUpperY = max(1, maxForwardsSlide, maxForwardsJump) + 1;
	
	const maxBackwardsSlide = maxSlideInDir(movements, backwardsDirs);
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
			grid[y][x] = range == Infinity? isRangeCapturingPiece? MovementType.RangeCapture : MovementType.Range : MovementType.Step;
			x += step[0];
			y += step[1]
		}
	});
	movements.jumps.forEach(([x, y]) => {
		grid[y][x] = MovementType.Jump; // jumps take precedence on the grid
	});
	if("compoundMoves" in movements) {
		const jumpThenRangeCompoundMoves = movements.compoundMoves.filter(([move1]) => move1.jumps.length);
		jumpThenRangeCompoundMoves.map(([move1, move2]) => {
			move1.jumps.forEach(jump => {
				// this may not be needed since most pieces that jump then range also have a move to just jump to there.
				grid[jump[1]][jump[0]] = MovementType.Jump;
				Object.entries(move2.slides).forEach(([dir, range]) => {
					const step = directions[dir];
					let [x, y] = vec2.add(jump, step);
					for(let i = 1; i <= range; i++) {
						if(grid[y]?.[x] === undefined) {
							break;
						}
						grid[y][x] = range == Infinity? MovementType.RangeAfterJump : MovementType.StepAfterJump;
						x += step[0];
						y += step[1];
					}
				});
			});
		});
	}
	if("tripleSlashedArrowDirs" in movements) {
		movements.tripleSlashedArrowDirs.forEach(dir => {
			const step = directions[dir];
			grid[step[1]][step[0]] = MovementType.TripleSlashedArrowJump;
			let [x, y] = vec2.add(step, step);
			for(let i = 1; grid[y]?.[x] !== undefined; i++) {
				grid[y][x] = MovementType.RangeAfterJump;
				x += step[0];
				y += step[1];
			}
		});
	}
	
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
						} else if(move === MovementType.RangeCapture) {
							return <RangeCaptureMoveTd x={x} y={y}/>;
						} else if(move === MovementType.Jump) {
							return <JumpMoveTd/>;
						} else if(move === MovementType.StepAfterJump) {
							return <StepAfterJumpMoveTd/>;
						} else if(move === MovementType.RangeAfterJump) {
							return <RangeAfterJumpMoveTd x={x} y={y}/>;
						} else if(move === MovementType.TripleSlashedArrowJump) {
							return <TripleSlashedArrowJumpMoveTd/>
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
			class={joinClasses(
				styles.table,
				isCompoundMove && styles.isCompoundMove
			)}
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

function maxSlideInDir(movements: PieceMovements | PieceMovementsOnlySlidesJumps, dirs: Set<MovementDir>): number {
	const ranges = Object.entries(movements.slides).filter(([dir, range]) => dirs.has(dir) && range != Infinity).map(([, range]) => range);
	if("compoundMoves" in movements) {
		movements.compoundMoves.filter(([move1]) => move1.jumps.length).forEach(([move1, move2]) => {
			move1.jumps.forEach(jump => {
				const jumpDirVec = vec2.sign(jump)
				const jumpDir = Object.entries(directions).find(([, vec]) => vec2.equals(vec, jumpDirVec))?.[0];
				if(!jumpDir || !dirs.has(jumpDir)) {
					return;
				}
				const jumpMag = max(abs(jump[0]), abs(jump[1]));
				const rangesAfterJump = Object.entries(move2.slides).filter(([dir, range]) => dirs.has(dir) && range != Infinity).map(([, range]) => range + jumpMag);
				ranges.push(...rangesAfterJump);
			});
		});
	}
	if("tripleSlashedArrowDirs" in movements) {
		if(movements.tripleSlashedArrowDirs.some(dir => dirs.has(dir))) {
			// ranges.push(1);
		}
	}
	return max(0, ...ranges);
}