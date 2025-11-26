import { useRef } from "preact/hooks";
import ShogiBoard from "../../components/ShogiBoard";
import Game from "../../lib/Game";
import { initialTsfen } from "../../lib/pieceData";

export default function PlayPage() {
	const board = useRef(new Game(initialTsfen));
	
	return (
		<ShogiBoard
			game={board.current}
		/>
	);
}