import { useCallback, useState } from "preact/hooks";
import Game from "../lib/Game";
import { joinClasses, range } from "../lib/utils";
import { Move, Player, Vec2 } from "../types/TaikyokuShogi"
import styles from "./ShogiBoard.module.css";
import * as vec2 from "../lib/vec2";
import BoardSquare from "./BoardSquare";

export default function ShogiBoard({
	game,
	bottomPlayer = Player.Sente
}: {
	game: Game,
	bottomPlayer?: Player
}) {
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
	const handleClick = useCallback((x: number, y: number) => {
		const boardPos = calculateBoardPos([x, y]);
		const piece = game.getSquare(boardPos)!;
		const moves = piece.getMoves(boardPos, game);
		setMoves(moves);
		setMoveTargets(new vec2.Set(moves.map(m => m.end)));
		setSelectedSquare(boardPos);
	}, [game, bottomPlayer]);
	const handleMoveClick = useCallback((x: number, y: number) => {
		const move = moves!.find(move => vec2.equals(move.end, [x, y]));
		console.log("making move:", move);
		game.makeMove(move!);
		clearSelected();
	}, [game, bottomPlayer, selectedSquare]);
	
	return (
		<div
			className={styles.board}
			data-current-player={currentPlayer == Player.Sente? "sente" : "gote"}
		>
			{range(36).flatMap(y => (
				range(36).map(x => {
					const boardPos: [number, number] = calculateBoardPos([x, y]);
					const piece = game.getSquare(boardPos);
					
					const isMoveTarget = moveTargets?.has(boardPos);
					const canBeSelected = !selectedSquare && piece?.canMove(boardPos, game);
					const isSelectedSquare = selectedSquare && vec2.equals(selectedSquare, boardPos);
					
					return (
						<BoardSquare
							x={x}
							y={y}
							piece={piece}
							onClick={isMoveTarget? handleMoveClick : canBeSelected? handleClick : clearSelected}
							className={joinClasses(
								(isSelectedSquare || canBeSelected) && styles.selected,
								isMoveTarget && styles.moveTarget
							)}
						/>
					)
				})
			))}
		</div>
	);
}