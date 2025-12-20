import { Dispatch, useCallback, useImperativeHandle, useMemo, useRef, useState } from "preact/hooks";
import Game from "../lib/Game";
import { joinClasses, leftClickOnly, range } from "../lib/utils";
import { GameStatus, Move, Player, Vec2 } from "../types/TaikyokuShogi";
import styles from "./ShogiBoard.module.css";
import * as vec2 from "../lib/vec2";
import BoardSquare from "./BoardSquare";
import { useForceRerender } from "../lib/hooks";
import Piece from "../lib/Piece";
import { hypot, sqrt } from "../lib/math";
import { forwardRef } from "preact/compat";

type MultiStepMove = {
	currentPos: Vec2,
	possibleMoves: Move[]
};

export type ShogiBoardHandle = {
	forceRerender: () => void
};

export default forwardRef<ShogiBoardHandle, {
	game: Game,
	bottomPlayer?: Player,
	selectedSquare: Vec2 | null,
	setSelectedSquare: Dispatch<Vec2 | null>,
	onPieceHover?: (piece: Piece) => void,
	onMove?: () => void,
	interactive?: boolean,
	debug?: boolean,
	destroyHax?: boolean,
	getCreativeHaxPiece?: (() => Piece | null) | null
}>(function ShogiBoard({
	game,
	bottomPlayer = Player.Sente,
	selectedSquare,
	setSelectedSquare,
	onPieceHover,
	onMove,
	interactive = false,
	debug = false,
	destroyHax = false,
	getCreativeHaxPiece = null
}, ref) {
	const contElRef = useRef<HTMLDivElement | null>(null);
	
	const forceRerender = useForceRerender();
	const currentPlayer = game.getCurrentPlayer();
	const [moves, setMoves] = useState<Move[] | null>(null);
	const [multiStepMove, setMultiStepMove] = useState<MultiStepMove | null>(null);
	
	const lastMove = game.lastMove;
	const lastMoveTime = useMemo(() => Date.now(), [game.moveCounter]);
	
	useImperativeHandle(ref, () => ({
		forceRerender
	}));
	
	const calculateBoardPos = useCallback(([x, y]: [number, number]): Vec2 => {
		// return bottomPlayer == Player.Sente? [x, y] : [35 - x, 35 - y];
		return [x,y];
	}, [bottomPlayer]);
	
	const clearSelectedSquare = () => {
		setSelectedSquare(null);
		setMoves(null);
		setMultiStepMove(null);
	};
	const getMouseEventBoardCell = (e: MouseEvent) => {
		if(!e.target || !(e.target instanceof Element)) {
			console.error("Board click event fired on", e.target);
			return;
		}
		const cell = e.target.closest("div");
		if(!cell || cell == contElRef.current || !contElRef.current!.contains(cell)) {
			console.error("Couldn't find cell of board click event!", cell);
			return;
		}
		return cell;
	};
	const getPosFromCell = (cell: HTMLDivElement) => [+cell.dataset.x!, +cell.dataset.y!] as Vec2;
	const handleClick = (e: MouseEvent) => {
		const cell = getMouseEventBoardCell(e);
		if(!cell) {
			return;
		}
		const pos = getPosFromCell(cell);
		if(destroyHax) {
			game.setSquare(pos, null);
			forceRerender();
			return;
		}
		if(getCreativeHaxPiece) {
			game.setSquare(pos, getCreativeHaxPiece());
			forceRerender();
			return;
		}
		if(cell.classList.contains(styles.moveTarget)) {
			const validMoves = multiStepMove? multiStepMove.possibleMoves.filter(move => vec2.equals(move.end, pos)) : moves!.filter(move => vec2.equals(move.intermediateSteps?.[0] ?? move.end, pos));
			if(validMoves.length > 1) {
				setMultiStepMove({
					currentPos: pos,
					possibleMoves: validMoves
				});
				onMove?.();
			} else {
				const move = validMoves[0];
				// console.log("making move", move)
				game.makeMove(move);
				console.log(`${game.countAllMoves()} moves`);
				if(game.getStatus() != GameStatus.Playing) {
					console.log(`WIN FOR ${game.getStatus() == GameStatus.SenteWin? "SENTE" : "GOTE"}!!!!!`);
				}
				clearSelectedSquare();
				if(!multiStepMove || !vec2.equals(multiStepMove.currentPos, move.end)) {
					onMove?.();
				}
			}
		} else if(!selectedSquare && cell.classList.contains(styles.canMove) && (contElRef.current!.classList.contains(styles.sente) == cell.classList.contains(styles.sente))) {
			const boardPos = calculateBoardPos(pos);
			const moves = game.getMovesAtSquare(boardPos);
			setMoves(moves);
			setSelectedSquare(boardPos);
		} else {
			clearSelectedSquare();
		}
	};
	const handleHover = (e: MouseEvent) => {
		if(getCreativeHaxPiece) {
			return;
		}
		const cell = getMouseEventBoardCell(e);
		if(!cell) {
			return;
		}
		const pos = getPosFromCell(cell);
		if(debug) {
			setSelectedSquare(pos);
			return;
		}
		const boardPos = calculateBoardPos(pos);
		const piece = game.getSquare(boardPos);
		if(piece) {
			onPieceHover?.(piece);
		}
	};
	
	const moveTargets = useMemo(() => multiStepMove? new vec2.Set(multiStepMove.possibleMoves.map(m => m.end)) : moves? new vec2.Set(moves.map(m => m.intermediateSteps?.[0] ?? m.end)) : null, [moves, multiStepMove]);
	const selectedPieceCacheKey = selectedSquare? Game.posToI(selectedSquare) : -1;
	const attackMap = game.twoWayAttackMap.getForwards(selectedPieceCacheKey);
	const reverseAttackMap = game.twoWayAttackMap.getBackwards(selectedPieceCacheKey);
	
	const moveAnimOffset = lastMove? vec2.sub(lastMove.start, lastMove.end) : [0, 0];
	const moveAnimDuration = sqrt(hypot(...moveAnimOffset)) / 12 + 0.02;
	
	return (
		<div class={joinClasses(
			styles.wrapper,
			bottomPlayer == Player.Gote && styles.flipped
		)}>
			<div
				ref={contElRef}
				className={joinClasses(
					styles.board,
					selectedSquare && styles.hasSelectedSquare,
					currentPlayer == Player.Sente? styles.sente : styles.gote
				)}
				onMouseDown={interactive? leftClickOnly(handleClick) : undefined}
				onMouseMove={handleHover}
				style={`
					--anim-offset-x: ${moveAnimOffset[0] * 100}%;
					--anim-offset-y: ${moveAnimOffset[1] * 100}%;
					--anim-duration: ${moveAnimDuration}s;
				`}
			>
				{range(36).flatMap(y => (
					range(36).map(x => {
						const pos: Vec2 = [x, y];
						const boardPos: [number, number] = calculateBoardPos(pos);
						let piece = multiStepMove && vec2.equals(selectedSquare!, pos)? null : game.getSquare(multiStepMove && vec2.equals(multiStepMove.currentPos, pos)? selectedSquare! : boardPos);
						// piece?.canPromote() && (piece=piece.promote())
						
						const isMoveTarget = moveTargets?.has(boardPos);
						const canMove = game.pieceCanMoveDisregardingCurrentPlayer(boardPos);
						const isSelectedSquare = selectedSquare && vec2.equals(selectedSquare, boardPos);
						
						const boardI = Game.posToI(pos);
						const inAttackMap = attackMap?.has(boardI);
						const inReverseAttackMap = reverseAttackMap?.has(boardI);
						
						const wasLastMoveStart = lastMove && (vec2.equals(pos, lastMove.start) || (lastMove.intermediateSteps && lastMove.intermediateSteps?.some(step => vec2.equals(pos, step))));
						const wasLastMoveEnd = lastMove && vec2.equals(pos, lastMove.end);
						
						return (
							<BoardSquare
								key={wasLastMoveEnd? `anim-${lastMoveTime}` : `static-${x}-${y}`} // This is needed so if a piece which just moved is captured, Preact doesn't optimise it away and will fully replace this element, ensuring the move animation plays.
								data-x={x}
								data-y={y}
								piece={piece}
								className={joinClasses(
									piece && piece.species,
									interactive && canMove && styles.canMove,
									isSelectedSquare && styles.selected,
									isMoveTarget && styles.moveTarget,
									piece && (piece.owner == Player.Sente? styles.sente : styles.gote),
									wasLastMoveStart && styles.lastMoveStart,
									wasLastMoveEnd && styles.lastMoveEnd,
									debug && inAttackMap && styles.inAttackMap,
									debug && inReverseAttackMap && styles.inReverseAttackMap
								)}
								pieceClassName={wasLastMoveEnd? styles.moveAnim : undefined}
							/>
						);
					})
				))}
			</div>
		</div>
	);
});