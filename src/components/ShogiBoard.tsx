import { Dispatch, useCallback, useMemo, useRef, useState } from "preact/hooks";
import Game from "../lib/Game";
import { joinClasses, leftClickOnly, range } from "../lib/utils";
import { GameStatus, Move, Player, Vec2 } from "../types/TaikyokuShogi";
import styles from "./ShogiBoard.module.css";
import * as vec2 from "../lib/vec2";
import BoardSquare from "./BoardSquare";
import { useForceRerender } from "../lib/hooks";
import Piece from "../lib/Piece";

type MultiStepMove = {
	currentPos: Vec2,
	possibleMoves: Move[]
};

export default function ShogiBoard({
	game,
	bottomPlayer = Player.Sente,
	selectedSquare,
	setSelectedSquare,
	onPieceHover,
	onMove,
	debug = false,
	destroyHax = false,
	getCreativeHaxPiece = null
}: {
	game: Game,
	bottomPlayer?: Player,
	selectedSquare: Vec2 | null,
	setSelectedSquare: Dispatch<Vec2 | null>,
	onMove?: () => void,
	onPieceHover?: (piece: Piece) => void,
	debug?: boolean,
	destroyHax?: boolean,
	getCreativeHaxPiece?: (() => Piece | null) | null
}) {
	const contElRef = useRef<HTMLDivElement | null>(null);
	
	const forceRerender = useForceRerender();
	const currentPlayer = game.getCurrentPlayer();
	const [moves, setMoves] = useState<Move[] | null>(null);
	const [multiStepMove, setMultiStepMove] = useState<MultiStepMove | null>(null);
	const [lastMove, setLastMove] = useState<Move | null>(null);
	
	const calculateBoardPos = useCallback(([x, y]: [number, number]): Vec2 => {
		// return bottomPlayer == Player.Sente? [x, y] : [35 - x, 35 - y];
		return [x,y];
	}, [bottomPlayer]);
	
	const clearSelected = () => {
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
			const validMoves = multiStepMove? multiStepMove.possibleMoves.filter(move => vec2.equals(move.end, pos)) : moves!.filter(move => vec2.equals(move.intermediateStep ?? move.end, pos));
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
				setLastMove(move);
				console.log(`${game.countAllMoves()} moves`);
				if(game.getStatus() != GameStatus.Playing) {
					console.log(`WIN FOR ${game.getStatus() == GameStatus.SenteWin? "SENTE" : "GOTE"}!!!!!`);
				}
				clearSelected();
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
			clearSelected();
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
	
	const moveTargets = useMemo(() => multiStepMove? new vec2.Set(multiStepMove.possibleMoves.map(m => m.end)) : moves? new vec2.Set(moves.map(m => m.intermediateStep ?? m.end)) : null, [moves, multiStepMove]);
	const selectedPieceCacheKey = selectedSquare? Game.posToI(selectedSquare) : -1;
	const attackMap = game.twoWayAttackMap.getForwards(selectedPieceCacheKey);
	const reverseAttackMap = game.twoWayAttackMap.getBackwards(selectedPieceCacheKey);
	
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
				onMouseDown={leftClickOnly(handleClick)}
				onMouseMove={handleHover}
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
						
						const wasLastMoveStart = lastMove && (vec2.equals(pos, lastMove.start) || (lastMove.intermediateStep && vec2.equals(pos, lastMove.intermediateStep)));
						const wasLastMoveEnd = lastMove && vec2.equals(pos, lastMove.end);
						
						return (
							<BoardSquare
								x={x}
								y={y}
								piece={piece}
								className={joinClasses(
									piece && piece.species,
									canMove && styles.canMove,
									isSelectedSquare && styles.selected,
									isMoveTarget && styles.moveTarget,
									piece && (piece.owner == Player.Sente? styles.sente : styles.gote),
									wasLastMoveStart && styles.lastMoveStart,
									wasLastMoveEnd && styles.lastMoveEnd,
									debug && inAttackMap && styles.inAttackMap,
									debug && inReverseAttackMap && styles.inReverseAttackMap
								)}
							/>
						);
					})
				))}
			</div>
		</div>
	);
}