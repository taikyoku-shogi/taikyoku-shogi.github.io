import { Dispatch, StateUpdater, useCallback, useRef, useState } from "preact/hooks";
import Game from "../lib/Game";
import { joinClasses, range } from "../lib/utils";
import { Move, Player, Vec2 } from "../types/TaikyokuShogi"
import styles from "./ShogiBoard.module.css";
import * as vec2 from "../lib/vec2";
import BoardSquare from "./BoardSquare";

export default function ShogiBoard({
	game,
	bottomPlayer = Player.Sente,
	selectedSquare,
	setSelectedSquare,
	onMove,
	debug = false
}: {
	game: Game,
	bottomPlayer?: Player,
	selectedSquare: Vec2 | null,
	setSelectedSquare: Dispatch<Vec2 | null>,
	onMove?: () => void,
	debug?: boolean
}) {
	const contElRef = useRef<HTMLDivElement | null>(null);
	
	const currentPlayer = game.getCurrentPlayer();
	const [moveTargets, setMoveTargets] = useState<vec2.Set | null>(null);
	const [moves, setMoves] = useState<Move[] | null>(null);
	
	const calculateBoardPos = useCallback(([x, y]: [number, number]): Vec2 => {
		return bottomPlayer == Player.Sente? [x, y] : [35 - x, 35 - y];
	}, [bottomPlayer]);
	
	const clearSelected = useCallback(() => {
		setSelectedSquare(null);
		setMoveTargets(null);
		setMoves(null);
	}, [])
	const handleClick = (e: MouseEvent) => {
		if(!e.target || !(e.target instanceof Element)) {
			console.error("Board click event fired on", e.target);
			return;
		}
		const cell = e.target.closest("div");
		if(!cell || cell == contElRef.current || !contElRef.current!.contains(cell)) {
			console.error("Couldn't find cell of board click event!", cell);
			return;
		}
		const x = +cell.dataset.x!;
		const y = +cell.dataset.y!;
		if(cell.classList.contains(styles.moveTarget)) {
			const move = moves!.find(move => vec2.equals(move.end, [x, y]));
			game.makeMove(move!);
			clearSelected();
			onMove?.();
		} else if(!selectedSquare && cell.classList.contains(styles.canMove) && (contElRef.current!.classList.contains(styles.sente) == cell.classList.contains(styles.sente))) {
			const boardPos = calculateBoardPos([x, y]);
			const moves = game.getMovesAtSquare(boardPos);
			setMoves(moves);
			setMoveTargets(new vec2.Set(moves.map(m => m.end)));
			setSelectedSquare(boardPos);
		} else {
			clearSelected();
		}
	};
	
	const selectedPieceCacheKey = selectedSquare? game.posToI(selectedSquare) : -1;
	
	return (
		<div
			ref={contElRef}
			className={joinClasses(
				styles.board,
				selectedSquare && styles.hasSelectedSquare,
				currentPlayer == Player.Sente? styles.sente : styles.gote
			)}
			onMouseDown={handleClick}
		>
			{range(36).flatMap(y => (
				range(36).map(x => {
					const boardPos: [number, number] = calculateBoardPos([x, y]);
					const piece = game.getSquare(boardPos);
					
					const isMoveTarget = moveTargets?.has(boardPos);
					const canMove = game.pieceCanMoveDisregardingCurrentPlayer(boardPos);
					const isSelectedSquare = selectedSquare && vec2.equals(selectedSquare, boardPos);
					
					const inAttackMap = game.twoWayAttackMap.getForwards(selectedPieceCacheKey)?.has(x * 36 + y);
					const inReverseAttackMap = game.twoWayAttackMap.getBackwards(selectedPieceCacheKey)?.has(x * 36 + y);
					
					return (
						<BoardSquare
							x={x}
							y={y}
							piece={piece}
							className={joinClasses(
								canMove && styles.canMove,
								isSelectedSquare && styles.selected,
								isMoveTarget && styles.moveTarget,
								piece && (piece.owner == Player.Sente? styles.sente : styles.gote),
								debug && inAttackMap && styles.inAttackMap,
								debug && inReverseAttackMap && styles.inReverseAttackMap
							)}
						/>
					)
				})
			))}
		</div>
	);
}