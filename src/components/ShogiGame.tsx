import { useRef, useState } from "preact/hooks";
import Game from "../lib/Game";
import { PieceSpecies, Player, Vec2 } from "../types/TaikyokuShogi"
import ShogiBoard from "./ShogiBoard";
import PieceInfo from "./PieceInfo";

import pieceClickAudio from "../assets/pieceClick.mp3";
import styles from "./ShogiGame.module.css";

export default function ShogiGame({
	game,
	bottomPlayer,
	debug
}: {
	game: Game,
	bottomPlayer?: Player,
	debug?: boolean
}) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [selectedSquare, setSelectedSquare] = useState<Vec2 | null>(null);
	const [pieceInfoPiece, setPieceInfoPiece] = useState<PieceSpecies | null>(null);
	
	return (
		<div class={styles.gameWrapper}>
			<audio
				ref={audioRef}
				src={pieceClickAudio}
			></audio>
			<div>
				<ShogiBoard
					game={game}
					bottomPlayer={bottomPlayer}
					selectedSquare={selectedSquare}
					setSelectedSquare={selectedSquare => {
						setSelectedSquare(selectedSquare);
						const selectedPiece = selectedSquare && game.getSquare(selectedSquare);
						if(selectedPiece) {
							setPieceInfoPiece(selectedPiece.species);
						}
					}}
					onMove={() => audioRef.current!.play()}
					debug={debug}
				/>
			</div>
			<div>
				{pieceInfoPiece && (
					<PieceInfo
						pieceSpecies={pieceInfoPiece}
						onAnchorClick={setPieceInfoPiece}
					/>
				)}
			</div>
		</div>
	);
}