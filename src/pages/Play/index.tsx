import Game from "../../lib/Game";
import { useRef, useState } from "preact/hooks";
import { initialTsfen } from "../../lib/pieceData";
import { PieceSpecies, Player, Vec2 } from "../../types/TaikyokuShogi"
import ShogiBoard from "../../components/ShogiBoard";
import PieceInfo from "../../components/PieceInfo";

import pieceClickAudio from "../../assets/pieceClick.mp3";
import styles from "./index.module.css";
export default function PlayPage({
	debug
}: {
	debug?: boolean
}) {
	const game = useRef(new Game(initialTsfen)).current;
	
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [selectedSquare, setSelectedSquare] = useState<Vec2 | null>(null);
	const [pieceInfoPiece, setPieceInfoPiece] = useState<PieceSpecies | null>(null);
	const [bottomPlayer, setBottomPlayer] = useState(Player.Sente);
	
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