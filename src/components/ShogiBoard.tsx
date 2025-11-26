import { useState } from "preact/hooks";
import Game from "../lib/Game";
import { loop } from "../lib/utils";
import { Player } from "../types/TaikyokuShogi"
import styles from "./ShogiBoard.module.css";
import ShogiPiece from "./ShogiPiece";

import boardImg from "../assets/board.jpg";
import ackaisyoFont from "../assets/ackaisyo.ttf";
import acgyosyoFont from "../assets/acgyosyo.ttf";

export default function ShogiBoard({
	game,
	bottomPlayer = Player.Sente
}: {
	game: Game,
	bottomPlayer?: Player
}) {
	const [, update] = useState(0);
	const currentPlayer = game.getCurrentPlayer();
	return (
		<div
			className={styles.board}
			data-current-player={currentPlayer == Player.Sente? "sente" : "gote"}
		>
			{loop(36).flatMap(y => (
				loop(36).map(x => {
					const boardPos: [number, number] = bottomPlayer == Player.Sente? [x, y] : [36 - x, 36 - y];
					const piece = game.getSquare(boardPos);
					
					return (
						<div
							key={`${x}-${y}`}
						>
							{piece && <ShogiPiece
								piece={piece}
								onClick={piece.owner == currentPlayer? () => {
									let moves = piece.getMoves([x, y], game);
									console.log(moves)
									if(moves.length) {
										game.makeMove(moves[0]);
										update(x => x + 1);
									}
									// if(piece.canPromote()) {
									// 	game.setSquare([x, y], piece.promote());
									// 	update(x => x + 1)
									// }
								} : null}
							/>}
						</div>
					);
				})
			))}
		</div>
	);
}