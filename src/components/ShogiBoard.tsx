import { useCallback, useRef, useState } from "preact/hooks";
import Game from "../lib/Game";
import { joinClasses, range } from "../lib/utils";
import { Move, Player, Vec2 } from "../types/TaikyokuShogi"
import styles from "./ShogiBoard.module.css";
import * as vec2 from "../lib/vec2";
import BoardSquare from "./BoardSquare";

import pieceClickAudio from "../assets/pieceClick.mp3";

export default function ShogiBoard({
	game,
	bottomPlayer = Player.Sente
}: {
	game: Game,
	bottomPlayer?: Player
}) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const contElRef = useRef<HTMLDivElement | null>(null);
	
	const currentPlayer = game.getCurrentPlayer();
	
	const [selectedSquare, setSelectedSquare] = useState<Vec2 | null>(null);
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
			console.log("making move:", move);
			game.makeMove(move!);
			audioRef.current!.play();
			clearSelected();
		} else if(!selectedSquare && cell.classList.contains(styles.selected)) {
			const boardPos = calculateBoardPos([x, y]);
			const moves = game.getMovesAtSquare(boardPos);
			setMoves(moves);
			setMoveTargets(new vec2.Set(moves.map(m => m.end)));
			setSelectedSquare(boardPos);
		} else {
			clearSelected();
		}
	};
	
	return (
		<>
			<audio
				ref={audioRef}
				src={pieceClickAudio}
			></audio>
			<div
				ref={contElRef}
				className={styles.board}
				data-current-player={currentPlayer == Player.Sente? "sente" : "gote"}
				onMouseDown={handleClick}
			>
				{range(36).flatMap(y => (
					range(36).map(x => {
						const boardPos: [number, number] = calculateBoardPos([x, y]);
						const piece = game.getSquare(boardPos);
						
						const isMoveTarget = moveTargets?.has(boardPos);
						const canBeSelected = !selectedSquare && game.pieceCanMove(boardPos);
						const isSelectedSquare = selectedSquare && vec2.equals(selectedSquare, boardPos);
						
						return (
							<BoardSquare
								x={x}
								y={y}
								piece={piece}
								className={joinClasses(
									(isSelectedSquare || canBeSelected) && styles.selected,
									isMoveTarget && styles.moveTarget
								)}
							/>
						)
					})
				))}
			</div>
		</>
	);
}