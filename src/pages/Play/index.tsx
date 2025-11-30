import { useRef } from "preact/hooks";
import ShogiGame from "../../components/ShogiGame";
import Game from "../../lib/Game";
import { initialTsfen } from "../../lib/pieceData";

export default function PlayPage() {
	const board = useRef(new Game(initialTsfen));
	
	return (
		<ShogiGame
			game={board.current}
		/>
	);
}